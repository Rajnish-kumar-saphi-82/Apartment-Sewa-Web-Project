import type { Request, Response } from "express";
import {
  AdminCreateUserDTO,
  AdminUpdateUserDTO,
} from "../dtos/auth.dto.js";
import { AdminUserService } from "../services/admin-user.service.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";

const adminUserService = new AdminUserService();

export class AdminUserController {
  async getUsers(req: Request, res: Response) {
    try {
      const { page, limit, search } = req.query;
      const result = await adminUserService.getUsers(
        page as string | undefined,
        limit as string | undefined,
        search as string | undefined,
      );

      return res.status(200).json({
        status: 200,
        success: true,
        message: "Users fetched successfully",
        data: result.data,
        meta: result.meta,
      });
    } catch (exception: unknown) {
      return this.handleError(res, exception);
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await adminUserService.getUserById(req.params.id);
      return ApiResponseHelper.success(res, user, "User fetched successfully");
    } catch (exception: unknown) {
      return this.handleError(res, exception);
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const parsedData = AdminCreateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return ApiResponseHelper.error(
          res,
          parsedData.error.issues[0].message,
          400,
          parsedData.error.issues,
        );
      }

      const user = await adminUserService.createUser(parsedData.data);
      return ApiResponseHelper.success(
        res,
        user,
        "User created successfully",
        201,
      );
    } catch (exception: unknown) {
      return this.handleError(res, exception);
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const parsedData = AdminUpdateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return ApiResponseHelper.error(
          res,
          parsedData.error.issues[0].message,
          400,
          parsedData.error.issues,
        );
      }

      const user = await adminUserService.updateUser(
        req.params.id,
        parsedData.data,
      );
      return ApiResponseHelper.success(res, user, "User updated successfully");
    } catch (exception: unknown) {
      return this.handleError(res, exception);
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      await adminUserService.deleteUser(req.params.id);
      return ApiResponseHelper.success(res, null, "User deleted successfully");
    } catch (exception: unknown) {
      return this.handleError(res, exception);
    }
  }

  private handleError(res: Response, exception: unknown) {
    const errorMessage =
      exception instanceof Error ? exception.message : "Unknown error";
    const errorStatus = (exception as any)?.status || 500;
    return ApiResponseHelper.error(res, errorMessage, errorStatus);
  }
}
