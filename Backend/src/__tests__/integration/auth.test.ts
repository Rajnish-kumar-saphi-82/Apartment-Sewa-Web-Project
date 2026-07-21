// src/__tests__/integration/auth.test.ts
// INTEGRATION TEST: Auth Routes
// IMPORTANT: Uses --runInBand to ensure sequential execution

import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/auth.model";

describe("Integration: Auth Routes", () => {
  // Wipe users and re-create from scratch for this test suite
  beforeAll(async () => {
    await UserModel.deleteMany({});
  });

  // ============================================
  // POST /api/v1/auth/register (4 tests)
  // ============================================
  describe("POST /api/v1/auth/register", () => {
    // TEST 1: Missing fields → 400
    test("should return 400 when required fields are missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ email: "incomplete@test.com" });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    // TEST 2: Successful tenant registration → 201
    test("should register a new tenant user and return 201", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          fullName: "Test Tenant User",
          email: "newtenant@test.com",
          password: "Password@123",
          confirmPassword: "Password@123",
          userType: "Tenant",
          countryCode: "+977",
          phone: "9800000001",
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    // TEST 3: Duplicate email → 400
    test("should return 400 if email is already registered", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          fullName: "Duplicate User",
          email: "newtenant@test.com",
          password: "Password@123",
          confirmPassword: "Password@123",
          userType: "Tenant",
          countryCode: "+977",
          phone: "9800000002",
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    // TEST 4: Register an owner → 201
    test("should register a new owner user and return 201", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          fullName: "Test Owner",
          email: "newowner@test.com",
          password: "Password@123",
          confirmPassword: "Password@123",
          userType: "Owner",
          countryCode: "+977",
          phone: "9800000003",
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ============================================
  // POST /api/v1/auth/login (4 tests)
  // ============================================
  describe("POST /api/v1/auth/login", () => {
    // TEST 5: Wrong password → 401
    test("should return 401 with invalid password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "newtenant@test.com", password: "WrongPassword!" });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    // TEST 6: Non-existent user → 401
    test("should return 401 for a non-existent email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "ghost@test.com", password: "Password@123" });
      expect(res.statusCode).toBe(401);
    });

    // TEST 7: Successful login (register + verify + login in sequence)
    test("should login successfully and return a JWT token", async () => {
      // Step 1: register a fresh user
      await request(app).post("/api/v1/auth/register").send({
        fullName: "Login Test User",
        email: "logintest@test.com",
        password: "Password@123",
        confirmPassword: "Password@123",
        userType: "Tenant",
        countryCode: "+977",
        phone: "9800009999",
      });
      // Step 2: mark as verified in the database directly
      await UserModel.updateOne({ email: "logintest@test.com" }, { is_verified: true });
      // Step 3: login
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "logintest@test.com", password: "Password@123" });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("token");
      expect(res.body.data.token).toBeTruthy();
    });

    // TEST 8: Login response has user info
    test("login response should include user object with email", async () => {
      // User already verified from test 7
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "logintest@test.com", password: "Password@123" });
      expect(res.body.data).toHaveProperty("user");
      expect(res.body.data.user.email).toBe("logintest@test.com");
      expect(res.body.data.user.role).toBeDefined();
    });
  });

  // ============================================
  // GET /api/v1/auth/whoami (2 tests)
  // ============================================
  describe("GET /api/v1/auth/whoami", () => {
    let authToken: string;

    beforeAll(async () => {
      // Use the verified user from Test 7
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "logintest@test.com", password: "Password@123" });
      authToken = loginRes.body.data?.token;
    });

    // TEST 9: No token → 401
    test("should return 401 when no token provided", async () => {
      const res = await request(app).get("/api/v1/auth/whoami");
      expect(res.statusCode).toBe(401);
    });

    // TEST 10: Valid token → 200 with user data
    test("should return 200 with user data for a valid token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/whoami")
        .set("Authorization", `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("email");
      expect(res.body.data.email).toBe("logintest@test.com");
    });
  });
});
