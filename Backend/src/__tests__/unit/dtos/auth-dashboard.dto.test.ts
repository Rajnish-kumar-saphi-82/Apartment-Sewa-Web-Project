import {
  AdminCreateUserDTO,
  AdminUpdateUserDTO,
  ChangePasswordDTO,
  LoginDTO,
  RegisterDTO,
  UpdateProfileDTO,
} from "../../../dtos/auth.dto";
import {
  CreateBillDTO,
  CreateNoticeDTO,
  CreateTenantDTO,
  CreateTicketDTO,
  CreateUnitDTO,
  PayBillDTO,
  UpdateTicketStatusDTO,
  UpdateUnitStatusDTO,
} from "../../../dtos/dashboard.dto";
import { UserRole } from "../../../types/auth.type";

describe("Unit: Auth and Dashboard DTOs", () => {
  test("RegisterDTO accepts a valid tenant registration", () => {
    const result = RegisterDTO.parse({
      userType: UserRole.TENANT,
      fullName: "Tenant User",
      email: "tenant@example.com",
      countryCode: "+977",
      phone: "9800000000",
      password: "secret123",
      confirmPassword: "secret123",
    });

    expect(result.email).toBe("tenant@example.com");
  });

  test("RegisterDTO rejects mismatched passwords", () => {
    expect(() =>
      RegisterDTO.parse({
        userType: UserRole.TENANT,
        fullName: "Tenant User",
        email: "tenant@example.com",
        countryCode: "+977",
        phone: "9800000000",
        password: "secret123",
        confirmPassword: "different",
      })
    ).toThrow();
  });

  test("RegisterDTO rejects invalid phone length", () => {
    expect(() =>
      RegisterDTO.parse({
        userType: UserRole.OWNER,
        fullName: "Owner User",
        email: "owner@example.com",
        countryCode: "+977",
        phone: "123",
        password: "secret123",
        confirmPassword: "secret123",
      })
    ).toThrow();
  });

  test("LoginDTO accepts valid credentials", () => {
    expect(LoginDTO.parse({ email: "user@example.com", password: "secret123" })).toEqual({
      email: "user@example.com",
      password: "secret123",
    });
  });

  test("LoginDTO rejects invalid email", () => {
    expect(() => LoginDTO.parse({ email: "bad-email", password: "secret123" })).toThrow();
  });

  test("UpdateProfileDTO accepts partial profile updates", () => {
    expect(UpdateProfileDTO.parse({ fullName: "Updated User" })).toEqual({
      fullName: "Updated User",
    });
  });

  test("ChangePasswordDTO accepts matching new passwords", () => {
    const result = ChangePasswordDTO.parse({
      currentPassword: "oldpass",
      newPassword: "newpass1",
      confirmNewPassword: "newpass1",
    });

    expect(result.newPassword).toBe("newpass1");
  });

  test("ChangePasswordDTO rejects mismatched new passwords", () => {
    expect(() =>
      ChangePasswordDTO.parse({
        currentPassword: "oldpass",
        newPassword: "newpass1",
        confirmNewPassword: "otherpass",
      })
    ).toThrow();
  });

  test("AdminCreateUserDTO accepts admin-created users", () => {
    const result = AdminCreateUserDTO.parse({
      full_name: "Admin Created",
      email: "created@example.com",
      password: "secret123",
      role: UserRole.TENANT,
      country_code: "+977",
      phone: "9800000001",
      is_verified: true,
    });

    expect(result.is_verified).toBe(true);
  });

  test("AdminUpdateUserDTO allows partial role updates", () => {
    expect(AdminUpdateUserDTO.parse({ role: UserRole.OWNER })).toEqual({ role: UserRole.OWNER });
  });

  test("CreateNoticeDTO rejects an empty title", () => {
    expect(() => CreateNoticeDTO.parse({ title: "", message: "Message" })).toThrow();
  });

  test("CreateUnitDTO coerces rent strings to numbers", () => {
    expect(CreateUnitDTO.parse({ flatNo: "101", floor: "1", rent: "15000" }).rent).toBe(15000);
  });

  test("CreateUnitDTO rejects negative rent", () => {
    expect(() => CreateUnitDTO.parse({ flatNo: "101", floor: "1", rent: -1 })).toThrow();
  });

  test("UpdateUnitStatusDTO accepts occupied status with tenant details", () => {
    expect(
      UpdateUnitStatusDTO.parse({ status: "Occupied", tenantName: "Ram", tenantPhone: "9800000000" })
    ).toMatchObject({ status: "Occupied" });
  });

  test("CreateTenantDTO requires a flat number", () => {
    expect(() => CreateTenantDTO.parse({ name: "Ram", phone: "9800000000", flatNo: "" })).toThrow();
  });

  test("CreateBillDTO accepts non-negative bill costs", () => {
    expect(
      CreateBillDTO.parse({
        flatNo: "101",
        month: "July",
        rentCost: 10000,
        electricityCost: 500,
        waterCost: 300,
        serviceCost: 200,
      }).serviceCost
    ).toBe(200);
  });

  test("PayBillDTO rejects an empty payment method", () => {
    expect(() => PayBillDTO.parse({ paymentMethod: "" })).toThrow();
  });

  test("CreateTicketDTO validates optional image URLs", () => {
    expect(() =>
      CreateTicketDTO.parse({ flatNo: "101", description: "Broken pipe", image: "not-a-url" })
    ).toThrow();
  });

  test("UpdateTicketStatusDTO accepts fixed status", () => {
    expect(UpdateTicketStatusDTO.parse({ status: "Fixed" })).toEqual({ status: "Fixed" });
  });
});
