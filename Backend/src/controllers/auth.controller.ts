import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";

import {
  RegisterDTO,
  LoginDTO,
  ChangePasswordDTO,
  UpdateProfileDTO,
} from "../dtos/auth.dto.js";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const parsedData = RegisterDTO.safeParse(req.body);
      if (!parsedData.success) {
        return ApiResponseHelper.error(
          res,
          parsedData.error.issues[0].message,
          400,
          parsedData.error.issues,
        );
      }
      const newUser = await authService.register(parsedData.data);
      return ApiResponseHelper.success(
        res,
        newUser,
        "User registered successfully",
        201,
      );
    } catch (exception: unknown) {
      const errorMessage =
        exception instanceof Error ? exception.message : "Unknown error";
      const errorStatus = (exception as any)?.status || 500;
      return ApiResponseHelper.error(res, errorMessage, errorStatus);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const parsedData = LoginDTO.safeParse(req.body);
      if (!parsedData.success) {
        return ApiResponseHelper.error(
          res,
          parsedData.error.issues[0].message,
          400,
          parsedData.error.issues,
        );
      }
      const loginResponse = await authService.login(parsedData.data);
      return ApiResponseHelper.success(
        res,
        loginResponse,
        "Login successful",
        200,
      );
    } catch (exception: unknown) {
      const errorMessage =
        exception instanceof Error ? exception.message : "Unknown error";
      const errorStatus = (exception as any)?.status || 500;
      return ApiResponseHelper.error(res, errorMessage, errorStatus);
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const user = await authService.getCurrentUser(userId);
      return ApiResponseHelper.success(
        res,
        user,
        "User profile fetched successfully",
      );
    } catch (exception: unknown) {
      const errorMessage =
        exception instanceof Error ? exception.message : "Unknown error";
      const errorStatus = (exception as any)?.status || 500;
      return ApiResponseHelper.error(res, errorMessage, errorStatus);
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const parsedData = UpdateProfileDTO.safeParse(req.body);
      if (!parsedData.success) {
        return ApiResponseHelper.error(
          res,
          parsedData.error.issues[0].message,
          400,
          parsedData.error.issues,
        );
      }
      const uploadedFile = (req as any).file as Express.Multer.File | undefined;
      const profileImagePath = uploadedFile
        ? `/uploads/profile-images/${uploadedFile.filename}`
        : undefined;
      const updated = await authService.updateProfile(
        userId,
        parsedData.data,
        profileImagePath,
      );
      return ApiResponseHelper.success(
        res,
        updated,
        "Profile updated successfully",
      );
    } catch (exception: unknown) {
      const errorMessage =
        exception instanceof Error ? exception.message : "Unknown error";
      const errorStatus = (exception as any)?.status || 500;
      return ApiResponseHelper.error(res, errorMessage, errorStatus);
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const parsedData = ChangePasswordDTO.safeParse(req.body);
      if (!parsedData.success) {
        return ApiResponseHelper.error(
          res,
          parsedData.error.issues[0].message,
          400,
          parsedData.error.issues,
        );
      }
      await authService.changePassword(userId, parsedData.data);
      return ApiResponseHelper.success(
        res,
        null,
        "Password changed successfully",
      );
    } catch (exception: unknown) {
      const errorMessage =
        exception instanceof Error ? exception.message : "Unknown error";
      const errorStatus = (exception as any)?.status || 500;
      return ApiResponseHelper.error(res, errorMessage, errorStatus);
    }
  }
}
