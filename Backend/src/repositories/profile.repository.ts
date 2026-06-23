import { UserModel } from "../models/auth.model.js";

export class ProfileRepository {
  async updateProfileImage(userId: string, imagePath: string) {
    return await UserModel.findByIdAndUpdate(
      userId,
      { profile_image: imagePath },
      { new: true },
    );
  }

  async findById(userId: string) {
    return await UserModel.findById(userId);
  }
}
