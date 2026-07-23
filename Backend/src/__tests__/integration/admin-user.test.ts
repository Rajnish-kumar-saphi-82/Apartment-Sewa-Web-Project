import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/auth.model";
import { PasswordUtil } from "../../utils/hash.util";

describe("Integration: Admin User Routes", () => {
  let adminToken: string;
  let tenantToken: string;
  let targetUserId: string;

  beforeAll(async () => {
    // Clean up
    await UserModel.deleteMany({ email: { $in: ["admin_test@test.com", "tenant_test@test.com", "target_test@test.com", "new_admin_test@test.com"] } });

    // Create an Admin user
    const adminPassword = await PasswordUtil.hash("AdminPass123");
    const adminUser = await UserModel.create({
      full_name: "Admin User",
      email: "admin_test@test.com",
      password: adminPassword,
      phone: "9800000001",
      country_code: "+977",
      role: "Admin",
      is_verified: true,
    });

    // Create a regular Tenant user
    const tenantUser = await UserModel.create({
      full_name: "Tenant User",
      email: "tenant_test@test.com",
      password: await PasswordUtil.hash("TenantPass123"),
      phone: "9800000002",
      country_code: "+977",
      role: "Tenant",
      is_verified: true,
    });

    // Create a target user to fetch/update/delete
    const targetUser = await UserModel.create({
      full_name: "Target User",
      email: "target_test@test.com",
      password: await PasswordUtil.hash("TargetPass123"),
      phone: "9800000003",
      country_code: "+977",
      role: "Tenant",
      is_verified: true,
    });
    targetUserId = targetUser._id.toString();

    // Login to get tokens
    const adminRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin_test@test.com", password: "AdminPass123" });
    adminToken = adminRes.body.data.token;

    const tenantRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "tenant_test@test.com", password: "TenantPass123" });
    tenantToken = tenantRes.body.data.token;
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email: { $in: ["admin_test@test.com", "tenant_test@test.com", "target_test@test.com", "new_admin_test@test.com"] } });
  });

  // ============================================
  // GET /api/v1/admin/users
  // ============================================
  describe("GET /api/v1/admin/users", () => {
    test("should return 401 when no token is provided", async () => {
      const res = await request(app).get("/api/v1/admin/users");
      expect(res.statusCode).toBe(401);
    });

    test("should return 403 when a non-admin token is provided", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${tenantToken}`);
      expect(res.statusCode).toBe(403);
    });

    test("should return 200 and list of users when admin token is provided", async () => {
      const res = await request(app)
        .get("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ============================================
  // GET /api/v1/admin/users/:id
  // ============================================
  describe("GET /api/v1/admin/users/:id", () => {
    test("should return 401 when no token is provided", async () => {
      const res = await request(app).get(`/api/v1/admin/users/${targetUserId}`);
      expect(res.statusCode).toBe(401);
    });

    test("should return 403 when a non-admin token is provided", async () => {
      const res = await request(app)
        .get(`/api/v1/admin/users/${targetUserId}`)
        .set("Authorization", `Bearer ${tenantToken}`);
      expect(res.statusCode).toBe(403);
    });

    test("should return 200 and the user data when admin token is provided", async () => {
      const res = await request(app)
        .get(`/api/v1/admin/users/${targetUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(targetUserId);
    });
  });

  // ============================================
  // POST /api/v1/admin/users
  // ============================================
  describe("POST /api/v1/admin/users", () => {
    const newUserPayload = {
      full_name: "New Admin",
      email: "new_admin_test@test.com",
      password: "NewPassword123",
      phone: "9800000004",
      country_code: "+977",
      role: "Admin"
    };

    test("should return 401 when no token is provided", async () => {
      const res = await request(app).post("/api/v1/admin/users").send(newUserPayload);
      expect(res.statusCode).toBe(401);
    });

    test("should return 403 when a non-admin token is provided", async () => {
      const res = await request(app)
        .post("/api/v1/admin/users")
        .set("Authorization", `Bearer ${tenantToken}`)
        .send(newUserPayload);
      expect(res.statusCode).toBe(403);
    });

    test("should return 201 and create the user when admin token is provided", async () => {
      const res = await request(app)
        .post("/api/v1/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newUserPayload);
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(newUserPayload.email);
    });
  });

  // ============================================
  // PUT /api/v1/admin/users/:id
  // ============================================
  describe("PUT /api/v1/admin/users/:id", () => {
    const updatePayload = { full_name: "Updated Target Name" };

    test("should return 401 when no token is provided", async () => {
      const res = await request(app).put(`/api/v1/admin/users/${targetUserId}`).send(updatePayload);
      expect(res.statusCode).toBe(401);
    });

    test("should return 403 when a non-admin token is provided", async () => {
      const res = await request(app)
        .put(`/api/v1/admin/users/${targetUserId}`)
        .set("Authorization", `Bearer ${tenantToken}`)
        .send(updatePayload);
      expect(res.statusCode).toBe(403);
    });

    test("should return 200 and update the user when admin token is provided", async () => {
      const res = await request(app)
        .put(`/api/v1/admin/users/${targetUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(updatePayload);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.full_name).toBe(updatePayload.full_name);
    });
  });

  // ============================================
  // PATCH /api/v1/admin/users/:id
  // ============================================
  describe("PATCH /api/v1/admin/users/:id", () => {
    const patchPayload = { phone: "9876543210" };

    test("should return 401 when no token is provided", async () => {
      const res = await request(app).patch(`/api/v1/admin/users/${targetUserId}`).send(patchPayload);
      expect(res.statusCode).toBe(401);
    });

    test("should return 403 when a non-admin token is provided", async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${targetUserId}`)
        .set("Authorization", `Bearer ${tenantToken}`)
        .send(patchPayload);
      expect(res.statusCode).toBe(403);
    });

    test("should return 200 and update the user when admin token is provided", async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${targetUserId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(patchPayload);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.phone).toBe(patchPayload.phone);
    });
  });

  // ============================================
  // DELETE /api/v1/admin/users/:id
  // ============================================
  describe("DELETE /api/v1/admin/users/:id", () => {
    test("should return 401 when no token is provided", async () => {
      const res = await request(app).delete(`/api/v1/admin/users/${targetUserId}`);
      expect(res.statusCode).toBe(401);
    });

    test("should return 403 when a non-admin token is provided", async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/users/${targetUserId}`)
        .set("Authorization", `Bearer ${tenantToken}`);
      expect(res.statusCode).toBe(403);
    });

    test("should return 200 and delete the user when admin token is provided", async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/users/${targetUserId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
