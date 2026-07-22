// src/__tests__/unit/utils/hash.util.test.ts
// UNIT TEST: PasswordUtil (hash.util.ts)
// Tests that passwords are hashed and compared correctly

import { PasswordUtil } from "../../../utils/hash.util";

describe("Unit: PasswordUtil", () => {
  const plainPassword = "MySecurePassword@123";
  let hashedPassword: string;

  // ===========================
  // TEST 1: Hash a password
  // ===========================
  test("should hash a password and return a bcrypt string", async () => {
    hashedPassword = await PasswordUtil.hash(plainPassword);
    expect(hashedPassword).toBeDefined();
    // Bcrypt hashes always start with $2b$
    expect(hashedPassword.startsWith("$2b$")).toBe(true);
    // Hash should NOT equal the original
    expect(hashedPassword).not.toBe(plainPassword);
  });

  // ===========================
  // TEST 2: Compare correct password
  // ===========================
  test("should return true when comparing the correct password", async () => {
    const isMatch = await PasswordUtil.compare(plainPassword, hashedPassword);
    expect(isMatch).toBe(true);
  });

  // ===========================
  // TEST 3: Compare wrong password
  // ===========================
  test("should return false when comparing a wrong password", async () => {
    const isMatch = await PasswordUtil.compare("WrongPassword!", hashedPassword);
    expect(isMatch).toBe(false);
  });

  // ===========================
  // TEST 4: Two hashes of same password are different (salt)
  // ===========================
  test("should generate different hashes for the same password (salting)", async () => {
    const hash1 = await PasswordUtil.hash(plainPassword);
    const hash2 = await PasswordUtil.hash(plainPassword);
    expect(hash1).not.toBe(hash2);
  });
});
