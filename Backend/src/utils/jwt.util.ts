import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/constant.js";
import { JWTPayload } from "../types/auth.type.js";
import { HttpException } from "../exceptions/http-exception.js";

export class JWTUtil {
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d",
    });
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new HttpException(401, "Invalid or expired token");
    }
  }

  static extractToken(authHeader?: string): string {
    if (!authHeader) {
      throw new HttpException(401, "No authorization header provided");
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new HttpException(401, "Invalid authorization header format");
    }

    return authHeader.substring(7); 
  }
}
