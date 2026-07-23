export const API = {
  AUTH: {
    REGISTER: "/api/v1/auth/register",
    LOGIN: "/api/v1/auth/login",
    WHOAMI: "/api/v1/auth/whoami",
    UPDATE: "/api/v1/auth/update",
    UPDATE_PASSWORD: "/api/v1/auth/change-password",
    CHANGE_PASSWORD: "/api/v1/auth/change-password",
  },
  ADMIN: {
    USERS: "/api/v1/admin/users",
  },
  DASHBOARD: {
    NOTICES: "/api/v1/dashboard/notices",
    UNITS: "/api/v1/dashboard/units",
    TENANTS: "/api/v1/dashboard/tenants",
    BILLS: "/api/v1/dashboard/bills",
    TICKETS: "/api/v1/dashboard/tickets",
  },
  KYC: "/api/v1/kyc",
  EMERGENCY: "/api/v1/emergency",
};
