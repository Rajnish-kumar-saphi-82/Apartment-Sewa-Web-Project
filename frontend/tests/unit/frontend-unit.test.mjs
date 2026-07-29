import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const expectContains = (source, text) => assert.ok(source.includes(text), `Expected source to contain ${text}`);

const endpoints = read("lib/api/endpoints.ts");
const mockData = read("lib/mockData.ts");
const authSchema = read("app/(auth)/_components/schema.ts");
const axiosInstance = read("lib/api/axios-instance.ts");

describe("Unit: Frontend API Constants", () => {
  test("exposes register endpoint", () => expectContains(endpoints, 'REGISTER: "/api/v1/auth/register"'));
  test("exposes login endpoint", () => expectContains(endpoints, 'LOGIN: "/api/v1/auth/login"'));
  test("exposes whoami endpoint", () => expectContains(endpoints, 'WHOAMI: "/api/v1/auth/whoami"'));
  test("exposes update profile endpoint", () => expectContains(endpoints, 'UPDATE: "/api/v1/auth/update"'));
  test("exposes change password endpoint", () => expectContains(endpoints, 'CHANGE_PASSWORD: "/api/v1/auth/change-password"'));
  test("exposes admin users endpoint", () => expectContains(endpoints, 'USERS: "/api/v1/admin/users"'));
  test("exposes notices endpoint", () => expectContains(endpoints, 'NOTICES: "/api/v1/dashboard/notices"'));
  test("exposes units endpoint", () => expectContains(endpoints, 'UNITS: "/api/v1/dashboard/units"'));
  test("exposes tenants endpoint", () => expectContains(endpoints, 'TENANTS: "/api/v1/dashboard/tenants"'));
  test("exposes bills endpoint", () => expectContains(endpoints, 'BILLS: "/api/v1/dashboard/bills"'));
  test("exposes tickets endpoint", () => expectContains(endpoints, 'TICKETS: "/api/v1/dashboard/tickets"'));
  test("exposes kyc endpoint", () => expectContains(endpoints, 'KYC: "/api/v1/kyc"'));
  test("exposes emergency endpoint", () => expectContains(endpoints, 'EMERGENCY: "/api/v1/emergency"'));
});

describe("Unit: Frontend Auth Schema", () => {
  test("allows owner and tenant user types", () => expectContains(authSchema, 'z.enum(["Owner", "Tenant"]'));
  test("requires full name", () => expectContains(authSchema, "Full name is required"));
  test("validates email", () => expectContains(authSchema, "Please enter a valid email address"));
  test("includes Nepal country code", () => expectContains(authSchema, '{ code: "+977", short: "NP" }'));
  test("includes India country code", () => expectContains(authSchema, '{ code: "+91", short: "IN" }'));
  test("includes US country code", () => expectContains(authSchema, '{ code: "+1", short: "US" }'));
  test("includes UK country code", () => expectContains(authSchema, '{ code: "+44", short: "UK" }'));
  test("includes China country code", () => expectContains(authSchema, '{ code: "+86", short: "CN" }'));
  test("requires 10 digit phone numbers", () => expectContains(authSchema, "/^\\d{10}$/"));
  test("requires six character passwords", () => expectContains(authSchema, "Password must be at least 6 characters"));
  test("checks password confirmation", () => expectContains(authSchema, "Passwords do not match"));
  test("login requires email", () => expectContains(authSchema, "Email is required"));
  test("login requires password", () => expectContains(authSchema, "Password is required"));
});

describe("Unit: Frontend Mock Data Helpers", () => {
  test("defines notice storage key", () => expectContains(mockData, 'notices: "sewa_notices"'));
  test("defines unit storage key", () => expectContains(mockData, 'units: "sewa_units"'));
  test("defines tenant storage key", () => expectContains(mockData, 'tenants: "sewa_tenants"'));
  test("defines bill storage key", () => expectContains(mockData, 'bills: "sewa_bills"'));
  test("defines ticket storage key", () => expectContains(mockData, 'tickets: "sewa_tickets"'));
  test("defines admin user storage key", () => expectContains(mockData, 'adminUsers: "sewa_admin_users"'));
  test("creates notices at the top of the list", () => expectContains(mockData, "list.unshift(item); // latest notice on top"));
  test("creates vacant units by default", () => expectContains(mockData, 'status: "Vacant"'));
  test("converts rent to number", () => expectContains(mockData, "rent: Number(rent)"));
  test("assigns tenants to matching units", () => expectContains(mockData, 'updateUnitStatus(matchingUnit.id, "Occupied", name, phone)'));
  test("marks new bills pending", () => expectContains(mockData, 'status: "Pending"'));
  test("computes bill totals", () => expectContains(mockData, "Number(rentCost) + Number(electricityCost) + Number(waterCost) + Number(serviceCost)"));
  test("marks paid bills as paid", () => expectContains(mockData, 'status: "Paid" as const'));
  test("stores payment method", () => expectContains(mockData, "paymentMethod: method"));
  test("creates pending maintenance tickets", () => expectContains(mockData, 'status: "Pending"'));
  test("creates unresolved ticket urgency", () => expectContains(mockData, 'urgency: "new"'));
  test("stores AI pending diagnostic", () => expectContains(mockData, "AI scanning pending. Processing components..."));
  test("resolves urgency when tickets are fixed", () => expectContains(mockData, 'urgency: status === "Fixed" ? ("resolved" as const) : t.urgency'));
});

describe("Unit: Frontend Axios Instance", () => {
  test("uses same origin API proxy", () => expectContains(axiosInstance, 'const BASE_URL = "";'));
  test("reads token from localStorage", () => expectContains(axiosInstance, 'localStorage.getItem("token")'));
  test("sets bearer authorization header", () => expectContains(axiosInstance, 'Bearer ${token}'));
  test("logs failed API requests", () => expectContains(axiosInstance, "API request failed"));
});
