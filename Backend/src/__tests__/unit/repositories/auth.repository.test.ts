// src/__tests__/unit/repositories/auth.repository.test.ts
// UNIT TEST: UserRepository
// Tests every method in the UserRepository class directly against the DB

import { UserRepository } from "../../../repositories/auth.repository";
import { UserModel } from "../../../models/auth.model";

describe("Unit: UserRepository", () => {
  let userRepo: UserRepository;

  // STEP 1: Clear all test users before each test group to prevent data conflicts
  beforeAll(async () => {
    await UserModel.deleteMany({});
    userRepo = new UserRepository();
  });

  // ===========================
  // TEST 1: Create a user
  // ===========================
  test("should create a user successfully", async () => {
    const userData = {
      full_name: "Test Tenant",
      email: "tenant@test.com",
      password: "hashedpassword123",
      role: "Tenant" as any,  // Must be capitalized — UserRole.TENANT = "Tenant"
      country_code: "+977",
      phone: "9812345678",
    };
    const user = await userRepo.create(userData);
    expect(user).toBeDefined();
    expect(user).toHaveProperty("_id");
    expect(user.full_name).toBe(userData.full_name);
    expect(user.email).toBe(userData.email);
    expect(user.role).toBe("Tenant");  // UserRole.TENANT = "Tenant" (capitalized)
  });

  // ===========================
  // TEST 2: Find user by email (success)
  // ===========================
  test("should find a user by email", async () => {
    const found = await userRepo.findByEmail("tenant@test.com");
    expect(found).not.toBeNull();
    expect(found?.email).toBe("tenant@test.com");
    expect(found?.full_name).toBe("Test Tenant");
  });

  // ===========================
  // TEST 3: Find user by email (not found)
  // ===========================
  test("should return null for a non-existent email", async () => {
    const notFound = await userRepo.findByEmail("nobody@test.com");
    expect(notFound).toBeNull();
  });

  // ===========================
  // TEST 4: Find user by ID
  // ===========================
  test("should find a user by ID", async () => {
    const created = await UserModel.findOne({ email: "tenant@test.com" });
    const found = await userRepo.findById(created!._id.toString());
    expect(found).not.toBeNull();
    expect(found?.email).toBe("tenant@test.com");
  });

  // ===========================
  // TEST 5: Find by ID (invalid ID returns null)
  // ===========================
  test("should return null for a non-existent ID", async () => {
    const notFound = await userRepo.findById("000000000000000000000000");
    expect(notFound).toBeNull();
  });

  // ===========================
  // TEST 6: Update a user by ID
  // ===========================
  test("should update a user's full_name", async () => {
    const existing = await UserModel.findOne({ email: "tenant@test.com" });
    const updated = await userRepo.updateById(existing!._id.toString(), {
      full_name: "Updated Name",
    });
    expect(updated).not.toBeNull();
    expect(updated?.full_name).toBe("Updated Name");
  });

  // ===========================
  // TEST 7: Find by query
  // ===========================
  test("should find a user by a custom query (phone)", async () => {
    const found = await userRepo.findByQuery({ phone: "9812345678" });
    expect(found).not.toBeNull();
    expect(found?.phone).toBe("9812345678");
  });

  // ===========================
  // TEST 8: Paginated user list
  // ===========================
  test("should return paginated users", async () => {
    const result = await userRepo.findAllPaginated(1, 10);
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(1);
  });

  // ===========================
  // TEST 9: Paginated with search
  // ===========================
  test("should return paginated users matching a search query", async () => {
    const result = await userRepo.findAllPaginated(1, 10, "tenant@test.com");
    expect(result.data.length).toBeGreaterThanOrEqual(1);
  });

  // ===========================
  // TEST 10: Delete a user
  // ===========================
  test("should delete a user by ID", async () => {
    const existing = await UserModel.findOne({ email: "tenant@test.com" });
    const deleted = await userRepo.deleteById(existing!._id.toString());
    expect(deleted).not.toBeNull();
    const confirm = await UserModel.findById(existing!._id);
    expect(confirm).toBeNull();
  });
});
