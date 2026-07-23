import { DashboardRepository } from "../repositories/dashboard.repository.js";
import { CreateNoticeDTO, CreateUnitDTO, UpdateUnitStatusDTO, CreateTenantDTO, CreateBillDTO, PayBillDTO, CreateTicketDTO, UpdateTicketStatusDTO } from "../dtos/dashboard.dto.js";

const dashboardRepository = new DashboardRepository();

export class DashboardService {
  // Notices
  async createNotice(data: CreateNoticeDTO) {
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return dashboardRepository.createNotice({ ...data, date });
  }

  async getNotices() {
    return dashboardRepository.getNotices();
  }

  async updateNotice(id: string, data: any) {
    const notice = await dashboardRepository.updateNotice(id, data);
    if (!notice) throw { status: 404, message: "Notice not found" };
    return notice;
  }

  // Units
  async createUnit(data: CreateUnitDTO) {
    // Basic unique check could be added here if not handled by mongo
    const defaultImage = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=60";
    return dashboardRepository.createUnit({
      ...data,
      status: "Vacant",
      image: data.image || defaultImage
    });
  }

  async getUnits() {
    return dashboardRepository.getUnits();
  }

  async updateUnitStatus(id: string, data: UpdateUnitStatusDTO) {
    const unit = await dashboardRepository.updateUnit(id, data);
    if (!unit) throw { status: 404, message: "Unit not found" };
    return unit;
  }

  // Tenants
  async createTenant(data: CreateTenantDTO) {
    // Link to unit if exists
    const matchingUnit = await dashboardRepository.findUnitByFlatNo(data.flatNo);
    if (matchingUnit) {
      await dashboardRepository.updateUnit(matchingUnit._id as unknown as string, {
        status: "Occupied",
        tenantName: data.name,
        tenantPhone: data.phone,
      });
    }

    const houseCode = `SEWA-${data.flatNo}-${Math.random().toString(36).substring(2, 4).toUpperCase()}${Math.floor(Math.random() * 10)}`;
    return dashboardRepository.createTenant({
      ...data,
      houseCode
    });
  }

  async getTenants() {
    return dashboardRepository.getTenants();
  }

  // Bills
  async createBill(data: CreateBillDTO) {
    let tenantName = "Unassigned Tenant";
    try {
      const tenant = await dashboardRepository.findTenantByFlatNo(data.flatNo);
      if (tenant?.name) tenantName = tenant.name;
      
      if (!tenant) {
        const units = await dashboardRepository.getUnits();
        const unit = units.find(u => u.flatNo === data.flatNo);
        if (unit?.tenantName) tenantName = unit.tenantName;
      }
    } catch (e) { /* non-fatal */ }
    const totalCost = data.rentCost + data.electricityCost + data.waterCost + data.serviceCost;
    
    return dashboardRepository.createBill({
      ...data,
      tenantName,
      totalCost,
      status: "Pending"
    });
  }

  async getBills() {
    return dashboardRepository.getBills();
  }

  async getMyBills(phone: string, name: string) {
    // Find unit record by their phone number or name to get their flatNo
    const units = await dashboardRepository.getUnits();
    const unit = units.find(u => (phone && u.tenantPhone === phone) || (name && u.tenantName === name));
    if (!unit) {
      if (name) return dashboardRepository.getBillsByTenantName(name);
      return []; 
    }
    return dashboardRepository.getBillsByFlatNo(unit.flatNo);
  }

  async getBillById(id: string) {
    const bill = await dashboardRepository.getBillById(id);
    if (!bill) throw { status: 404, message: "Bill not found" };
    return bill;
  }

  async payBill(id: string, data: PayBillDTO) {
    const paymentDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const bill = await dashboardRepository.updateBill(id, {
      status: "Paid",
      paymentDate,
      paymentMethod: data.paymentMethod
    });
    if (!bill) throw { status: 404, message: "Bill not found" };
    return bill;
  }

  // Tickets
  async createTicket(data: CreateTicketDTO) {
    const defaultImage = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=60";
    return dashboardRepository.createTicket({
      ...data,
      urgency: "new",
      status: "Pending",
      diagnostic: "AI scanning pending. Processing components...",
      image: data.image || defaultImage
    });
  }

  async getTickets() {
    return dashboardRepository.getTickets();
  }

  async updateTicketStatus(id: string, data: UpdateTicketStatusDTO) {
    const urgency = data.status === "Fixed" ? "resolved" : undefined;
    const updateData: any = { status: data.status };
    if (urgency) updateData.urgency = urgency;

    const ticket = await dashboardRepository.updateTicket(id, updateData);
    if (!ticket) throw { status: 404, message: "Ticket not found" };
    return ticket;
  }

  async deleteTicket(id: string) {
    const ticket = await dashboardRepository.deleteTicket(id);
    if (!ticket) throw { status: 404, message: "Ticket not found" };
    return ticket;
  }

  // Deletions for Notice and Unit
  async deleteNotice(id: string) {
    const notice = await dashboardRepository.deleteNotice(id);
    if (!notice) throw { status: 404, message: "Notice not found" };
    return notice;
  }

  async deleteUnit(id: string) {
    const unit = await dashboardRepository.deleteUnit(id);
    if (!unit) throw { status: 404, message: "Unit not found" };
    return unit;
  }
}
