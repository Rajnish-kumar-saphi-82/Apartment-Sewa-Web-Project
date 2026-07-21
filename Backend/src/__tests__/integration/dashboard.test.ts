// src/__tests__/integration/dashboard.test.ts
// INTEGRATION TEST: Dashboard Routes (GET/POST /api/v1/dashboard/...)
// Tests protected routes for managing units, bills, tenants, tickets, notices

import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/auth.model";
import { UnitModel } from "../../models/unit.model";
import { BillModel } from "../../models/bill.model";
import { TicketModel } from "../../models/ticket.model";
import { NoticeModel } from "../../models/notice.model";

describe("Integration: Dashboard Routes", () => {
  let ownerToken: string;
  let tenantToken: string;

  beforeAll(async () => {
    // Clear all data
    await Promise.all([
      UserModel.deleteMany({}),
      UnitModel.deleteMany({}),
      BillModel.deleteMany({}),
      TicketModel.deleteMany({}),
      NoticeModel.deleteMany({}),
    ]);

    // Register + verify + login as OWNER
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Dashboard Owner",
      email: "dashowner@test.com",
      password: "Password@123",
      confirmPassword: "Password@123",
      userType: "Owner",
      countryCode: "+977",
      phone: "9811111111",
    });
    await UserModel.updateOne({ email: "dashowner@test.com" }, { is_verified: true });
    const ownerLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "dashowner@test.com", password: "Password@123" });
    ownerToken = ownerLogin.body.data?.token;

    // Register + verify + login as TENANT
    await request(app).post("/api/v1/auth/register").send({
      fullName: "Dashboard Tenant",
      email: "dashtenant@test.com",
      password: "Password@123",
      confirmPassword: "Password@123",
      userType: "Tenant",
      countryCode: "+977",
      phone: "9822222222",
    });
    await UserModel.updateOne({ email: "dashtenant@test.com" }, { is_verified: true });
    const tenantLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "dashtenant@test.com", password: "Password@123" });
    tenantToken = tenantLogin.body.data?.token;
  });

  // ============================================
  // AUTHORIZATION MIDDLEWARE (2 tests)
  // ============================================
  describe("Authorization Middleware", () => {
    // TEST 1: No token → 401
    test("should return 401 when accessing without a token", async () => {
      const res = await request(app).get("/api/v1/dashboard/units");
      expect(res.statusCode).toBe(401);
    });

    // TEST 2: Invalid token → 401
    test("should return 401 with an invalid/expired token", async () => {
      const res = await request(app)
        .get("/api/v1/dashboard/units")
        .set("Authorization", "Bearer this-is-totally-fake");
      expect(res.statusCode).toBe(401);
    });
  });

  // ============================================
  // NOTICE TESTS (2 tests)
  // ============================================
  describe("Notices", () => {
    // TEST 3: Get notices as owner
    test("owner: should get notices list successfully", async () => {
      const res = await request(app)
        .get("/api/v1/dashboard/notices")
        .set("Authorization", `Bearer ${ownerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    // TEST 4: Create notice as owner
    test("owner: should create a notice successfully", async () => {
      const res = await request(app)
        .post("/api/v1/dashboard/notices")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "Water cut on Sunday", message: "Water supply cut from 8am-12pm", date: "2024-07-15" });
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("Water cut on Sunday");
    });
  });

  // ============================================
  // UNIT (FLAT) TESTS (2 tests)
  // ============================================
  describe("Apartment Units", () => {
    // TEST 5: Get all units
    test("should return units list as owner", async () => {
      const res = await request(app)
        .get("/api/v1/dashboard/units")
        .set("Authorization", `Bearer ${ownerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    // TEST 6: Create a unit (flat)
    test("owner: should create an apartment unit successfully", async () => {
      const res = await request(app)
        .post("/api/v1/dashboard/units")
        .set("Authorization", `Bearer ${ownerToken}`)
        .field("flatNo", "301")
        .field("floor", "3rd")
        .field("status", "Vacant")
        .field("rent", "18000"); // rent not rentAmount
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ============================================
  // TENANT TESTS (1 test)
  // ============================================
  describe("Tenants", () => {
    // TEST 7: Get all tenants
    test("should return tenants list as owner", async () => {
      const res = await request(app)
        .get("/api/v1/dashboard/tenants")
        .set("Authorization", `Bearer ${ownerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ============================================
  // BILL TESTS (2 tests)
  // ============================================
  describe("Bills", () => {
    // TEST 8: Get all bills
    test("owner: should return bills list", async () => {
      const res = await request(app)
        .get("/api/v1/dashboard/bills")
        .set("Authorization", `Bearer ${ownerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    // TEST 9: Tenant views their own bills
    test("tenant: should be able to view their own bills", async () => {
      const res = await request(app)
        .get("/api/v1/dashboard/bills/mine")
        .set("Authorization", `Bearer ${tenantToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ============================================
  // MAINTENANCE TICKET TESTS (2 tests)
  // ============================================
  describe("Maintenance Tickets", () => {
    // TEST 10: Get all tickets as owner
    test("owner: should return all tickets", async () => {
      const res = await request(app)
        .get("/api/v1/dashboard/tickets")
        .set("Authorization", `Bearer ${ownerToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    // TEST 11: Tenant creates a maintenance ticket (no image)
    test("tenant: should create a maintenance ticket successfully", async () => {
      const res = await request(app)
        .post("/api/v1/dashboard/tickets")
        .set("Authorization", `Bearer ${tenantToken}`)
        .field("flatNo", "301")
        .field("description", "Bathroom pipe is leaking water")
        .field("urgency", "urgent") // urgent not High
        .attach("image", Buffer.from("mock image"), "test-image.jpg"); // Image required by schema
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
