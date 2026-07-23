// src/__tests__/unit/repositories/dashboard.repository.test.ts
// UNIT TEST: DashboardRepository
// Tests every method (Notices, Units, Tenants, Bills, Tickets)
// Field names match the EXACT mongoose models

import { DashboardRepository } from "../../../repositories/dashboard.repository";
import { NoticeModel } from "../../../models/notice.model";
import { UnitModel } from "../../../models/unit.model";
import { TenantModel } from "../../../models/tenant.model";
import { BillModel } from "../../../models/bill.model";
import { TicketModel } from "../../../models/ticket.model";

describe("Unit: DashboardRepository", () => {
  let repo: DashboardRepository;

  beforeAll(async () => {
    await Promise.all([
      NoticeModel.deleteMany({}),
      UnitModel.deleteMany({}),
      TenantModel.deleteMany({}),
      BillModel.deleteMany({}),
      TicketModel.deleteMany({}),
    ]);
    repo = new DashboardRepository();
  });

  // ============================================
  // NOTICE TESTS (4 tests)
  // ============================================
  describe("Notices", () => {
    let noticeId: string;

    test("should create a notice", async () => {
      const notice = await repo.createNotice({
        title: "Test Notice",
        message: "Building maintenance on Sunday",
        date: "2024-07-15",   // date is required in the Notice schema
      });
      expect(notice).toBeDefined();
      expect(notice).toHaveProperty("_id");
      expect(notice.title).toBe("Test Notice");
      noticeId = notice._id.toString();
    });

    test("should get all notices (at least 1)", async () => {
      const notices = await repo.getNotices();
      expect(Array.isArray(notices)).toBe(true);
      expect(notices.length).toBeGreaterThanOrEqual(1);
    });

    test("should update a notice", async () => {
      const updated = await repo.updateNotice(noticeId, { title: "Updated Notice" });
      expect(updated).not.toBeNull();
      expect(updated?.title).toBe("Updated Notice");
    });

    test("should delete a notice", async () => {
      const notice = await repo.createNotice({ title: "To Delete", message: "temp", date: "2024-07-15" });
      const deleted = await repo.deleteNotice(notice._id.toString());
      expect(deleted).not.toBeNull();
      const confirm = await NoticeModel.findById(notice._id);
      expect(confirm).toBeNull();
    });
  });

  // ============================================
  // UNIT (apartment flat) TESTS (5 tests)
  // Model fields: flatNo, floor, rent (NOT rentAmount), status
  // ============================================
  describe("Apartment Units", () => {
    let unitId: string;

    test("should create a unit (flat)", async () => {
      const unit = await repo.createUnit({
        flatNo: "101",
        floor: "1st",
        rent: 15000,     // Field is 'rent', NOT 'rentAmount'
        status: "Vacant",
      });
      expect(unit).toBeDefined();
      expect(unit.flatNo).toBe("101");
      expect(unit.rent).toBe(15000);
      unitId = unit._id.toString();
    });

    test("should get all units", async () => {
      const units = await repo.getUnits();
      expect(Array.isArray(units)).toBe(true);
      expect(units.length).toBeGreaterThanOrEqual(1);
    });

    test("should find a unit by flat number", async () => {
      const found = await repo.findUnitByFlatNo("101");
      expect(found).not.toBeNull();
      expect(found?.flatNo).toBe("101");
    });

    test("should update a unit status to Occupied", async () => {
      const updated = await repo.updateUnit(unitId, { status: "Occupied" });
      expect(updated?.status).toBe("Occupied");
    });

    test("should delete a unit", async () => {
      const unit = await repo.createUnit({ flatNo: "999", floor: "top", rent: 5000 });
      const deleted = await repo.deleteUnit(unit._id.toString());
      expect(deleted).not.toBeNull();
    });
  });

  // ============================================
  // TENANT TESTS (3 tests)
  // Model fields: name, phone, flatNo, houseCode (required!)
  // ============================================
  describe("Tenants", () => {
    test("should create a tenant", async () => {
      const tenant = await repo.createTenant({
        name: "Rajnish Rajak",
        phone: "9876543210",
        flatNo: "101",
        houseCode: "HC-001",   // Required field!
      });
      expect(tenant).toBeDefined();
      expect(tenant.name).toBe("Rajnish Rajak");
      expect(tenant.houseCode).toBe("HC-001");
    });

    test("should get all tenants", async () => {
      const tenants = await repo.getTenants();
      expect(Array.isArray(tenants)).toBe(true);
      expect(tenants.length).toBeGreaterThanOrEqual(1);
    });

    test("should find tenant by flat number", async () => {
      const tenant = await repo.findTenantByFlatNo("101");
      expect(tenant).not.toBeNull();
      expect(tenant?.flatNo).toBe("101");
    });
  });

  // ============================================
  // BILL TESTS (4 tests)
  // ============================================
  describe("Bills", () => {
    let billId: string;

    test("should create a bill", async () => {
      const bill = await repo.createBill({
        flatNo: "101",
        tenantName: "Rajnish Rajak",
        month: "July 2024",
        rentCost: 15000,
        electricityCost: 800,
        waterCost: 300,
        serviceCost: 200,
        totalCost: 16300,
        status: "Pending",
      });
      expect(bill).toBeDefined();
      expect(bill.totalCost).toBe(16300);
      expect(bill.status).toBe("Pending");
      billId = bill._id.toString();
    });

    test("should get all bills", async () => {
      const bills = await repo.getBills();
      expect(Array.isArray(bills)).toBe(true);
      expect(bills.length).toBeGreaterThanOrEqual(1);
    });

    test("should get bills by flat number", async () => {
      const bills = await repo.getBillsByFlatNo("101");
      expect(bills.length).toBeGreaterThanOrEqual(1);
      expect(bills[0].flatNo).toBe("101");
    });

    test("should update a bill status to Paid", async () => {
      const updated = await repo.updateBill(billId, { status: "Paid" });
      expect(updated?.status).toBe("Paid");
    });
  });

  // ============================================
  // MAINTENANCE TICKET TESTS (3 tests)
  // Model fields: flatNo, description, urgency (urgent/priority/new/resolved),
  //               image (required!), status
  // ============================================
  describe("Maintenance Tickets", () => {
    let ticketId: string;

    test("should create a maintenance ticket", async () => {
      const ticket = await repo.createTicket({
        flatNo: "101",
        description: "Bathroom pipe is leaking badly",
        urgency: "urgent",          // Enum: urgent | priority | new | resolved
        status: "Pending",
        image: "uploads/test-image.jpg",   // image is required in schema
      });
      expect(ticket).toBeDefined();
      expect(ticket.urgency).toBe("urgent");
      ticketId = ticket._id.toString();
    });

    test("should get all tickets", async () => {
      const tickets = await repo.getTickets();
      expect(Array.isArray(tickets)).toBe(true);
      expect(tickets.length).toBeGreaterThanOrEqual(1);
    });

    test("should update a ticket status to In Progress", async () => {
      const updated = await repo.updateTicket(ticketId, { status: "In Progress" });
      expect(updated?.status).toBe("In Progress");
    });
  });
});
