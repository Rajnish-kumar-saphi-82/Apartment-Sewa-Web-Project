import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/constant.js";
import { JWTPayload } from "../types/auth.type.js";
import { HttpException } from "../exceptions/http-exception.js";

/**
 * JWT Utility Class
 * Handles JWT token creation and verification
 * Similar to teacher's structure
 */
export class JWTUtil {
  
  /**
   * Generate JWT Token
   * @param payload - Data to store in token
   * @returns JWT token string
   */
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: "7d" // 7 days like teacher's code
    });
  }

  /**
   * Verify JWT Token
   * @param token - JWT token to verify
   * @returns Decoded payload
   * @throws HttpException if token is invalid
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new HttpException(401, "Invalid or expired token");
    }
  }

  /**
   * Extract token from Authorization header
   * @param authHeader - Authorization header value
   * @returns Token string
   * @throws HttpException if header is invalid
   */
  static extractToken(authHeader?: string): string {
    if (!authHeader) {
      throw new HttpException(401, "No authorization header provided");
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new HttpException(401, "Invalid authorization header format");
    }

    return authHeader.substring(7); // Remove "Bearer " prefix
  }
}