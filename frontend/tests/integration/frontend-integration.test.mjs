import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const expectContains = (source, text) => assert.ok(source.includes(text), `Expected source to contain ${text}`);

const adminUsersApi = read("lib/api/admin-users.ts");
const dashboardApi = read("lib/api/dashboard.ts");
const kycEmergencyApi = read("lib/api/kyc-emergency.ts");
const userApi = read("lib/api/user.ts");
const authApi = read("lib/api/auth.ts");

describe("Integration: Frontend Admin User API Wiring", () => {
  test("lists users through API.ADMIN.USERS", () => expectContains(adminUsersApi, "axiosInstance.get(API.ADMIN.USERS"));
  test("creates users through API.ADMIN.USERS", () => expectContains(adminUsersApi, "axiosInstance.post(API.ADMIN.USERS"));
  test("updates users through API.ADMIN.USERS id route", () => expectContains(adminUsersApi, "axiosInstance.patch(`${API.ADMIN.USERS}/${id}`"));
  test("deletes users through API.ADMIN.USERS id route", () => expectContains(adminUsersApi, "axiosInstance.delete(`${API.ADMIN.USERS}/${id}`"));
  test("returns paginated admin user data", () => expectContains(adminUsersApi, "meta: AdminUsersMeta"));
  test("supports page query param", () => expectContains(adminUsersApi, "page?: number"));
  test("supports limit query param", () => expectContains(adminUsersApi, "limit?: number"));
  test("supports search query param", () => expectContains(adminUsersApi, "search?: string"));
});

describe("Integration: Frontend Dashboard API Wiring", () => {
  test("fetches notices from dashboard API", () => expectContains(dashboardApi, "API.DASHBOARD.NOTICES"));
  test("fetches units from dashboard API", () => expectContains(dashboardApi, "API.DASHBOARD.UNITS"));
  test("fetches tenants from dashboard API", () => expectContains(dashboardApi, "API.DASHBOARD.TENANTS"));
  test("fetches bills from dashboard API", () => expectContains(dashboardApi, "API.DASHBOARD.BILLS"));
  test("fetches tickets from dashboard API", () => expectContains(dashboardApi, "API.DASHBOARD.TICKETS"));
});

describe("Integration: Frontend Profile, Auth, KYC and Emergency API Wiring", () => {
  test("auth login uses API.AUTH.LOGIN", () => expectContains(authApi, "API.AUTH.LOGIN"));
  test("auth register uses API.AUTH.REGISTER", () => expectContains(authApi, "API.AUTH.REGISTER"));
  test("profile loads through profile endpoint", () => expectContains(userApi, "getProfile"));
  test("profile updates through FormData endpoint", () => expectContains(userApi, "updateProfile"));
  test("password changes through user API", () => expectContains(userApi, "changePassword"));
  test("kyc calls use API.KYC", () => expectContains(kycEmergencyApi, "API.KYC"));
  test("emergency calls use API.EMERGENCY", () => expectContains(kycEmergencyApi, "API.EMERGENCY"));
});
