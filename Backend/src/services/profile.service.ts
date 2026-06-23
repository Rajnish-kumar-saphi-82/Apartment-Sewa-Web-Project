import { HttpException } from "../exceptions/http-exception.js";
import { ProfileRepository } from "../repositories/profile.repository.js";

export class ProfileService {
  private profileRepo = new ProfileRepository();

  async uploadProfileImage(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new HttpException(400, "No image file uploaded");
    }

    const imagePath = `/${file.path.replace(/\\/g, "/")}`;

    const updatedUser = await this.profileRepo.updateProfileImage(
      userId,
      imagePath,
    );

    if (!updatedUser) {
      throw new HttpException(404, "User not found");
    }

    return {
      imageUrl: imagePath,
    };
  }

  async getProfile(userId: string) {
    const user = await this.profileRepo.findById(userId);

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    return {
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profile_image: user.profile_image,
    };
  }
}
