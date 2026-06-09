import type { Request, Response, NextFunction } from "express";
import { JWTUtil } from "../utils/jwt.util.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";
import { UserRole } from "../types/auth.type.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtil.extractToken(authHeader);
    const payload = JWTUtil.verifyToken(token);
    req.user = payload;
    next();
  } catch (exception: unknown) {
    const errorMessage = exception instanceof Error ? exception.message : "Authentication failed";
    const errorStatus = (exception as any)?.status || 401;
    
    return ApiResponseHelper.error(
      res,
      errorMessage,
      errorStatus
    );
  }
};

export const roleMiddleware = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return ApiResponseHelper.error(res, "Unauthorized", 401);
      }

      if (!allowedRoles.includes(user.role)) {
        return ApiResponseHelper.error(
          res,
          "Forbidden: Insufficient permissions",
          403
        );
      }

      next();
    } catch (exception: unknown) {
      const errorMessage = exception instanceof Error ? exception.message : "Authorization failed";
      
      return ApiResponseHelper.error(res, errorMessage, 500);
    }
  };
};