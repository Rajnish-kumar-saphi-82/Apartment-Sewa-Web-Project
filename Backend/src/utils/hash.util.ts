import bcrypt from "bcryptjs";

/**
 * Password Utility Class
 * Handles password hashing and comparison
 * Similar to teacher's structure
 */
export class PasswordUtil {
  
  /**
   * Hash a plain text password
   * @param password - Plain text password
   * @returns Hashed password
   */
  static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  /**
   * Compare plain text password with hashed password
   * @param password - Plain text password
   * @param hashedPassword - Hashed password from database
   * @returns True if passwords match, false otherwise
   */
  static async compare(
    password: string, 
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}