import type { Request, Response, NextFunction } from "express";
import { JWTUtil } from "../utils/jwt.util.js";
import { ApiResponseHelper } from "../utils/apihelper.util.js";
import { UserRole } from "../types/auth.type.js";
import { HttpException } from "../exceptions/http-exception.js";

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
  next: NextFunction,
) => {
  try {
    const token = getRequestToken(req);
    const payload = JWTUtil.verifyToken(token);
    req.user = payload;
    next();
  } catch (exception: unknown) {
    const errorMessage =
      exception instanceof Error ? exception.message : "Authentication failed";
    const errorStatus = (exception as any)?.status || 401;

    return ApiResponseHelper.error(res, errorMessage, errorStatus);
  }
};

export const authorizedMiddleware = authMiddleware;

const getRequestToken = (req: Request): string => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    return JWTUtil.extractToken(authHeader);
  }

  const token = getCookieValue(req.headers.cookie, "auth_token");

  if (!token) {
    throw new HttpException(401, "No authorization token provided");
  }

  return token;
};

const getCookieValue = (
  cookieHeader: string | undefined,
  key: string,
): string | null => {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const target = cookies.find((cookie) => cookie.startsWith(`${key}=`));

  if (!target) return null;

  return decodeURIComponent(target.substring(key.length + 1));
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
          403,
        );
      }

      next();
    } catch (exception: unknown) {
      const errorMessage =
        exception instanceof Error ? exception.message : "Authorization failed";

      return ApiResponseHelper.error(res, errorMessage, 500);
    }
  };
};
