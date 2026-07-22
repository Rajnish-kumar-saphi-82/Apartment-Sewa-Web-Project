// src/__tests__/unit/utils/jwt.util.test.ts
// UNIT TEST: JWTUtil
// Tests token generation, verification, and extraction

import { JWTUtil } from "../../../utils/jwt.util";

describe("Unit: JWTUtil", () => {
  const payload = {
    userId: "test-user-id-123",
    email: "test@apartmentsewa.com",
    role: "tenant" as any,
  };
  let token: string;

  // ===========================
  // TEST 1: Generate a token
  // ===========================
  test("should generate a valid JWT token", () => {
    token = JWTUtil.generateToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    // JWT tokens have 3 parts separated by dots
    expect(token.split(".").length).toBe(3);
  });

  // ===========================
  // TEST 2: Verify a valid token
  // ===========================
  test("should verify a valid token and return the payload", () => {
    const decoded = JWTUtil.verifyToken(token);
    expect(decoded).toBeDefined();
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  // ===========================
  // TEST 3: Reject an invalid token
  // ===========================
  test("should throw HttpException for an invalid token", () => {
    expect(() => {
      JWTUtil.verifyToken("invalid.token.string");
    }).toThrow("Invalid or expired token");
  });

  // ===========================
  // TEST 4: Extract token from Bearer header
  // ===========================
  test("should extract token from a Bearer Authorization header", () => {
    const authHeader = `Bearer ${token}`;
    const extracted = JWTUtil.extractToken(authHeader);
    expect(extracted).toBe(token);
  });

  // ===========================
  // TEST 5: Throw if no Authorization header
  // ===========================
  test("should throw when Authorization header is missing", () => {
    expect(() => {
      JWTUtil.extractToken(undefined);
    }).toThrow("No authorization header provided");
  });

  // ===========================
  // TEST 6: Throw if header format is wrong
  // ===========================
  test("should throw when Authorization header does not start with Bearer", () => {
    expect(() => {
      JWTUtil.extractToken("Basic some-token");
    }).toThrow("Invalid authorization header format");
  });
});
