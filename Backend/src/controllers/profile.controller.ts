import { Request, Response } from "express";

import { ApiResponseHelper } from "../utils/apihelper.util.js";
import { ProfileService } from "../services/profile.service.js";

const profileService = new ProfileService();

export class ProfileController {
  async uploadImage(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const file = req.file as Express.Multer.File;

      const result = await profileService.uploadProfileImage(userId, file);

      return ApiResponseHelper.success(
        res,
        result,
        "Profile image uploaded successfully",
      );
    } catch (exception: any) {
      return ApiResponseHelper.error(
        res,
        exception.message,
        exception.status ?? 500,
      );
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      const result = await profileService.getProfile(userId);

      return ApiResponseHelper.success(
        res,
        result,
        "Profile fetched successfully",
      );
    } catch (exception: any) {
      return ApiResponseHelper.error(
        res,
        exception.message,
        exception.status ?? 500,
      );
    }
  }
}
