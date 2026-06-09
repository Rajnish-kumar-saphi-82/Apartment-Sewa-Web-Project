// import { UserRepository } from "../repositories/user.repository.js";
// import { comparePassword, hashPassword } from "../utils/hash.util.js";
// import { generateToken } from "../utils/jwt.util.js";
// import { HttpException } from "../exceptions/http-exception.js";
// import type { User } from "../types/user.type.js";



// const userRepo = new UserRepository();

// export class AuthService {
//   async register(data: any) {
//     const existing = userRepo.findByEmail(data.email);
//     if (existing) {
//       throw new HttpException(400, "User already exists");
//     }

//     const hashed = await hashPassword(data.password);

//     const newUser: User = {
//       id: Date.now().toString(),
//       fullName: data.fullName,
//       email: data.email,
//       password: hashed,
//       role: data.role,
//     };

//     return userRepo.create(newUser);
//   }

//   async login(email: string, password: string) {
//     const user = userRepo.findByEmail(email);
//     if (!user) {
//       throw new HttpException(401, "Invalid credentials");
//     }

//     const match = await comparePassword(password, user.password);
//     if (!match) {
//       throw new HttpException(401, "Invalid credentials");
//     }

//     const token = generateToken({
//       id: user.id,
//       role: user.role,
//     });

//     return { token };
//   }
// }



import { UserRepository } from "../repositories/auth.repository.js";
import type { RegisterDTO, LoginDTO } from "../dtos/auth.dto.js";
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

    const existingUser =
      await this.userRepo.findByEmail(data.email);

    if (existingUser) {
      throw new HttpException(400, "Email already registered");
    }

    const hashedPassword =
      await PasswordUtil.hash(data.password);

    const newUser = {
      full_name: data.fullName,
      email: data.email,
      password: hashedPassword,
      role: data.userType,
      country_code: data.countryCode,
      phone: data.phone,
      is_verified: false
    };

    const created =
      await this.userRepo.create(newUser);

    const userObject = created.toObject();

    const { password, ...userWithoutPassword } = userObject;

    return userWithoutPassword;
  }

  async login(data: LoginDTO): Promise<LoginResponse> {

    const user =
      await this.userRepo.findByEmail(data.email);

    if (!user) {
      throw new HttpException(401, "Invalid email or password");
    }

    const isPasswordValid =
      await PasswordUtil.compare(
        data.password,
        user.password
      );

    if (!isPasswordValid) {
      throw new HttpException(401, "Invalid email or password");
    }

    const token = JWTUtil.generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    return {
      token,
      user: {
        id: user._id.toString(),
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        country_code: user.country_code,
        phone: user.phone
      }
    };
  }

  async getCurrentUser(userId: string): Promise<UserWithoutPassword> {

    const user =
      await this.userRepo.findById(userId);

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const userObject = user.toObject();

    const { password, ...userWithoutPassword } = userObject;

    return userWithoutPassword;
  }
}