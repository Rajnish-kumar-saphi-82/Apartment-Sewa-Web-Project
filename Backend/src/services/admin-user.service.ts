import mongoose from "mongoose";
import { UserRepository } from "../repositories/auth.repository.js";
import type {
  AdminCreateUserDTO,
  AdminUpdateUserDTO,
} from "../dtos/auth.dto.js";
import { HttpException } from "../exceptions/http-exception.js";
import { PasswordUtil } from "../utils/hash.util.js";
import type { UserWithoutPassword } from "../types/auth.type.js";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class AdminUserService {
  private userRepo = new UserRepository();

  async getUsers(page?: string, limit?: string, search?: string) {
    const currentPage = this.toPositiveNumber(page, 1);
    const currentLimit = Math.min(this.toPositiveNumber(limit, 10), 100);
    const currentSearch = search?.trim() || undefined;

    const { data, total } = await this.userRepo.findAllPaginated(
      currentPage,
      currentLimit,
      currentSearch,
    );

    const meta: PaginationMeta = {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.max(Math.ceil(total / currentLimit), 1),
    };

    return { data, meta };
  }

  async getUserById(id: string): Promise<UserWithoutPassword> {
    this.assertValidId(id);
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }

    return this.withoutPassword(user);
  }

  async createUser(data: AdminCreateUserDTO): Promise<UserWithoutPassword> {
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new HttpException(400, "Email already registered");
    }

    const hashedPassword = await PasswordUtil.hash(data.password);
    const created = await this.userRepo.create({
      full_name: data.full_name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      country_code: data.country_code,
      phone: data.phone,
      is_verified: data.is_verified ?? false,
    } as any);

    return this.withoutPassword(created);
  }

  async updateUser(
    id: string,
    data: AdminUpdateUserDTO,
  ): Promise<UserWithoutPassword> {
    this.assertValidId(id);
    const existingUser = await this.userRepo.findById(id);
    if (!existingUser) {
      throw new HttpException(404, "User not found");
    }

    if (data.email && data.email !== existingUser.email) {
      const emailTaken = await this.userRepo.findByEmail(data.email);
      if (emailTaken) {
        throw new HttpException(400, "Email already in use");
      }
    }

    const updated = await this.userRepo.updateById(id, data as any);
    if (!updated) {
      throw new HttpException(404, "User not found");
    }

    return this.withoutPassword(updated);
  }

  async deleteUser(id: string): Promise<void> {
    this.assertValidId(id);
    const deleted = await this.userRepo.deleteById(id);
    if (!deleted) {
      throw new HttpException(404, "User not found");
    }
  }

  private toPositiveNumber(value: string | undefined, fallback: number) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }

  private assertValidId(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpException(400, "Invalid user id");
    }
  }

  private withoutPassword(user: any): UserWithoutPassword {
    const userObject = user.toObject ? user.toObject() : user;
    const { password, ...userWithoutPassword } = userObject;
    return userWithoutPassword;
  }
}
