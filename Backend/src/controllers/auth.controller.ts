import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";
import { RegisterDTO, LoginDTO, UpdateProfileDTO, ChangePasswordDTO} from "../dtos/auth.dto.js";

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
      return ApiResponseHelper.success(res, newUser, "User registered successfully", 201);
    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : "Unknown error";
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
      return ApiResponseHelper.success(res, loginResponse, "Login successful", 200);
    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : "Unknown error";
      const errorStatus = (exception as any)?.status || 500;
      return ApiResponseHelper.error(res, errorMessage, errorStatus);
    }
  }

  // GET /api/v1/auth/whoami — already existed, just confirming it's correct as-is
  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const user = await authService.getCurrentUser(userId);
      return ApiResponseHelper.success(res, user, "User profile fetched successfully");
    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : "Unknown error";
      const errorStatus = (exception as any)?.status || 500;
      return ApiResponseHelper.error(res, errorMessage, errorStatus);
    }
  }

  // ← NEW — PUT /api/v1/auth/update
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

      // req.file is populated by multer (upload.middleware.ts) when a file was sent
      const profileImagePath = req.file
        ? `/uploads/profile-images/${req.file.filename}`
        : undefined;

      const updatedUser = await authService.updateProfile(
        userId,
        parsedData.data,
        profileImagePath,
      );

      return ApiResponseHelper.success(res, updatedUser, "Profile updated successfully", 200);
    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : "Unknown error";
      const errorStatus = (exception as any)?.status || 500;
      return ApiResponseHelper.error(res, errorMessage, errorStatus);
    }
  }

  // PUT /api/v1/auth/change-password
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

      return ApiResponseHelper.success(res, null, "Password changed successfully", 200);
    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : "Unknown error";
      const errorStatus = (exception as any)?.status || 500;
      return ApiResponseHelper.error(res, errorMessage, errorStatus);
    }
  }
}