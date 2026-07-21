import { NoticeModel, INotice } from "../models/notice.model.js";
import { UnitModel, IUnit } from "../models/unit.model.js";
import { TenantModel, ITenant } from "../models/tenant.model.js";
import { BillModel, IBill } from "../models/bill.model.js";
import { TicketModel, ITicket } from "../models/ticket.model.js";

export class DashboardRepository {
  // Notices
  async createNotice(data: Partial<INotice>): Promise<INotice> {
    return NoticeModel.create(data);
  }
  async getNotices(): Promise<INotice[]> {
    return NoticeModel.find().sort({ created_at: -1, _id: -1 });
  }
  async deleteNotice(id: string): Promise<INotice | null> {
    return NoticeModel.findByIdAndDelete(id);
  }
  async updateNotice(id: string, data: Partial<INotice>): Promise<INotice | null> {
    return NoticeModel.findByIdAndUpdate(id, data, { new: true });
  }

  // Units
  async createUnit(data: Partial<IUnit>): Promise<IUnit> {
    return UnitModel.create(data);
  }
  async getUnits(): Promise<IUnit[]> {
    return UnitModel.find().sort({ created_at: -1 });
  }
  async updateUnit(id: string, data: Partial<IUnit>): Promise<IUnit | null> {
    return UnitModel.findByIdAndUpdate(id, data, { new: true });
  }
  async findUnitByFlatNo(flatNo: string): Promise<IUnit | null> {
    return UnitModel.findOne({ flatNo });
  }
  async deleteUnit(id: string): Promise<IUnit | null> {
    return UnitModel.findByIdAndDelete(id);
  }

  // Tenants
  async createTenant(data: Partial<ITenant>): Promise<ITenant> {
    return TenantModel.create(data);
  }
  async getTenants(): Promise<ITenant[]> {
    return TenantModel.find().sort({ created_at: -1 });
  }
  async findTenantByFlatNo(flatNo: string): Promise<ITenant | null> {
    return TenantModel.findOne({ flatNo });
  }
  async findTenantByPhoneOrName(phone: string, name: string): Promise<ITenant | null> {
    return TenantModel.findOne({ $or: [{ phone }, { name }] });
  }

  // Bills
  async createBill(data: Partial<IBill>): Promise<IBill> {
    return BillModel.create(data);
  }
  async getBills(): Promise<IBill[]> {
    return BillModel.find().sort({ created_at: -1 });
  }
  async getBillById(id: string): Promise<IBill | null> {
    return BillModel.findById(id);
  }
  async updateBill(id: string, data: Partial<IBill>): Promise<IBill | null> {
    return BillModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: false });
  }
  async getBillsByFlatNo(flatNo: string): Promise<IBill[]> {
    return BillModel.find({ flatNo }).sort({ created_at: -1 });
  }
  async getBillsByTenantName(tenantName: string): Promise<IBill[]> {
    return BillModel.find({ tenantName }).sort({ created_at: -1 });
  }

  // Tickets
  async createTicket(data: Partial<ITicket>): Promise<ITicket> {
    return TicketModel.create(data);
  }
  async getTickets(): Promise<ITicket[]> {
    return TicketModel.find().sort({ created_at: -1 });
  }
  async updateTicket(id: string, data: Partial<ITicket>): Promise<ITicket | null> {
    return TicketModel.findByIdAndUpdate(id, data, { new: true });
  }
  async deleteTicket(id: string): Promise<ITicket | null> {
    return TicketModel.findByIdAndDelete(id);
  }
}
