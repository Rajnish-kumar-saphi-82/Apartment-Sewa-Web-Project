import type { Response } from "express";

export class ApiResponseHelper {
  static success<T>(
    res: Response,
    data: T,
    message: string = "Success",
    status: number = 200,
  ) {
    return res.status(status).json({
      status,
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    message: string = "Error",
    status: number = 500,
    errors?: any,
  ) {
    return res.status(status).json({
      status,
      success: false,
      message,
      errors: errors ?? null,
    });
  }

  static validationError(res: Response, errors: any) {
    return this.error(res, "Validation Error", 400, errors);
  }
}
