import { UserModel, IUser } from "../models/auth.model.js";

export interface PaginatedUsersResult {
  data: IUser[];
  total: number;
}

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

  async deleteById(id: string): Promise<IUser | null> {
    return await UserModel.findByIdAndDelete(id);
  }

<<<<<<< Updated upstream
  async findByQuery(query: Record<string, unknown>): Promise<IUser | null> {
=======
  async findByQuery(query: Record<string, any>): Promise<IUser | null> {
>>>>>>> Stashed changes
    return await UserModel.findOne(query);
  }

  async findAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaginatedUsersResult> {
    const query = search
      ? {
          $or: [
            { full_name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      UserModel.find(query)
        .select("-password")
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      UserModel.countDocuments(query),
    ]);

    return { data, total };
  }
}
