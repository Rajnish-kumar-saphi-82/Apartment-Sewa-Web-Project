import { UserModel, IUser } from "../models/auth.model.js";

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    return await UserModel.create(userData);
  }

  async updateById(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, data, { new: true });
  }
}
