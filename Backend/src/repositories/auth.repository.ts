// import { UserModel, IUser } from "../models/auth.model";

// export class UserRepository {
//   // updateById(userId: string, updatePayload: Record<string, unknown>) {
//   //   throw new Error("Method not implemented.");
//   // }
//   async findByEmail(email: string): Promise<IUser | null> {
//     return await UserModel.findOne({ email });
//   }

//   async findById(id: string): Promise<IUser | null> {
//     return await UserModel.findById(id);
//   }

//   async create(userData: Partial<IUser>): Promise<IUser> {
//     return await UserModel.create(userData);
//   }

//    async updateById(id: string, data: Partial<IUser>): Promise<IUser | null> {
//     return await UserModel.findByIdAndUpdate(id, data, { new: true });
//   }
// }


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