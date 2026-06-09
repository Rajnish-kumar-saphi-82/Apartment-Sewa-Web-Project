// import { usersDataset } from "../models/auth.model";
// import type { User } from "../types/auth.type.js";

// /**
//  * User Repository Interface
//  * Defines all data access methods
//  */
// export interface IUserRepository {
//   findByEmail(email: string): User | undefined;
//   findById(id: string): User | undefined;
//   create(user: User): User;
//   getAll(): User[];
// }

// /**
//  * User Repository Implementation
//  * Handles all database operations for User entity
//  */
// export class UserRepository implements IUserRepository {
  
//   /**
//    * Find user by email
//    */
//   findByEmail(email: string): User | undefined {
//     return usersDataset.find(u => u.email === email);
//   }

//   /**
//    * Find user by ID
//    */
//   findById(id: string): User | undefined {
//     return usersDataset.find(u => u.id === id);
//   }

//   /**
//    * Create new user
//    */
//   create(user: User): User {
//     usersDataset.push(user);
//     return user;
//   }

//   /**
//    * Get all users
//    */
//   getAll(): User[] {
//     return usersDataset;
//   }
// }

import { UserModel, IUser } from "../models/auth.model";

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
}