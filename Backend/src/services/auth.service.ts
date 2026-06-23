import { UserRepository } from "../repositories/auth.repository.js";
import type { RegisterDTO, LoginDTO, ChangePasswordDTO } from "../dtos/auth.dto.js";
import { HttpException } from "../exceptions/http-exception.js";
import { PasswordUtil } from "../utils/hash.util.js";
import { JWTUtil } from "../utils/jwt.util.js";
import type {
  User,
  UserWithoutPassword,
  LoginResponse,
} from "../types/auth.type.js";

export class AuthService {
  private userRepo = new UserRepository();

  async register(data: RegisterDTO): Promise<UserWithoutPassword> {
    const existingUser = await this.userRepo.findByEmail(data.email);

    if (existingUser) {
      throw new HttpException(400, "Email already registered");
    }

    const hashedPassword = await PasswordUtil.hash(data.password);

    const newUser = {
      full_name: data.fullName,
      email: data.email,
      password: hashedPassword,
      role: data.userType,
      country_code: data.countryCode,
      phone: data.phone,
      is_verified: false,
    };
    

    const created = await this.userRepo.create(newUser);

    const userObject = created.toObject();

    const { password, ...userWithoutPassword } = userObject;

    return userWithoutPassword;
  }

  async login(data: LoginDTO): Promise<LoginResponse> {
    const user = await this.userRepo.findByEmail(data.email);

    if (!user) {
      throw new HttpException(401, "Invalid email or password");
    }

    const isPasswordValid = await PasswordUtil.compare(
      data.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new HttpException(401, "Invalid email or password");
    }

    const token = JWTUtil.generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user._id.toString(),
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        country_code: user.country_code,
        phone: user.phone,
      },
    };
  }

  async getCurrentUser(userId: string): Promise<UserWithoutPassword> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const userObject = user.toObject();

    const { password, ...userWithoutPassword } = userObject;

    return userWithoutPassword;
  }
  /////

  async updateProfile(
  userId: string,
  data: Partial<{ fullName: string; email: string; phone: string }>,
  profileImagePath?: string,
): Promise<UserWithoutPassword> {
  const existingUser = await this.userRepo.findById(userId);

  if (!existingUser) {
    throw new HttpException(404, "User not found");
  }

  // prevent taking over someone else's email
  if (data.email && data.email !== existingUser.email) {
    const emailTaken = await this.userRepo.findByEmail(data.email);
    if (emailTaken) {
      throw new HttpException(400, "Email already in use");
    }
  }

  const updatePayload: Record<string, unknown> = {};
  if (data.fullName) updatePayload.full_name = data.fullName;
  if (data.email) updatePayload.email = data.email;
  if (data.phone) updatePayload.phone = data.phone;
  if (profileImagePath) updatePayload.profile_image = profileImagePath;

  const updated = await this.userRepo.updateById(userId, updatePayload);

  if (!updated) {
    throw new HttpException(404, "User not found");
  }

  const userObject = updated.toObject();
  const { password, ...userWithoutPassword } = userObject;

  return userWithoutPassword;
}

  async changePassword(
    userId: string,
    data: ChangePasswordDTO,
  ): Promise<void> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const isCurrentValid = await PasswordUtil.compare(
      data.currentPassword,
      user.password,
    );

    if (!isCurrentValid) {
      throw new HttpException(400, "Current password is incorrect");
    }

    const hashedNew = await PasswordUtil.hash(data.newPassword);

    await this.userRepo.updateById(userId, { password: hashedNew } as any);
  }
}
