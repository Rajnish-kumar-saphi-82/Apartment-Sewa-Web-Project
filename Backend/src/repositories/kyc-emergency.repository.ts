import { KycModel, IKyc } from "../models/kyc.model.js";
import { EmergencyContactModel, IEmergencyContact } from "../models/emergency.model.js";

export class KycRepository {
  async create(data: Partial<IKyc>): Promise<IKyc> {
    return KycModel.create(data);
  }

  async findByUserId(userId: string): Promise<IKyc[]> {
    return KycModel.find({ userId }).sort({ created_at: -1 });
  }

  async findLatestByUserId(userId: string): Promise<IKyc | null> {
    return KycModel.findOne({ userId }).sort({ created_at: -1 });
  }

  async getAll(): Promise<IKyc[]> {
    return KycModel.find().sort({ created_at: -1 });
  }

  async updateStatus(
    id: string,
    status: IKyc["status"],
    reviewNote?: string
  ): Promise<IKyc | null> {
    return KycModel.findByIdAndUpdate(
      id,
      { status, reviewNote, reviewedAt: new Date() },
      { returnDocument: "after" }
    );
  }

  async deleteById(id: string): Promise<IKyc | null> {
    return KycModel.findByIdAndDelete(id);
  }
}

export class EmergencyRepository {
  async getAll(): Promise<IEmergencyContact[]> {
    return EmergencyContactModel.find({ isActive: true }).sort({ category: 1, sortOrder: 1 });
  }

  async getAllAdmin(): Promise<IEmergencyContact[]> {
    return EmergencyContactModel.find().sort({ category: 1, sortOrder: 1 });
  }

  async create(data: Partial<IEmergencyContact>): Promise<IEmergencyContact> {
    return EmergencyContactModel.create(data);
  }

  async update(id: string, data: Partial<IEmergencyContact>): Promise<IEmergencyContact | null> {
    return EmergencyContactModel.findByIdAndUpdate(id, data, { returnDocument: "after" });
  }

  async deleteById(id: string): Promise<IEmergencyContact | null> {
    return EmergencyContactModel.findByIdAndDelete(id);
  }

  async seedDefaultContacts(): Promise<void> {
    const count = await EmergencyContactModel.countDocuments();
    if (count > 0) return; 

    const defaults: Partial<IEmergencyContact>[] = [
      { category: "Public Emergency", name: "Local Police", number: "100", icon: "shield", sortOrder: 0 },
      { category: "Public Emergency", name: "Ambulance", number: "102 / 108", icon: "plus-circle", sortOrder: 1 },
      { category: "Public Emergency", name: "Fire Brigade", number: "101", icon: "flame", sortOrder: 2 },
      { category: "Property Management", name: "Landlord / Owner", description: "Contact via call or WhatsApp", icon: "user", sortOrder: 0 },
      { category: "Property Management", name: "Apartment Security", description: "Main Gate / Guard Room", icon: "shield-check", sortOrder: 1 },
      { category: "Maintenance", name: "Preferred Electrician", description: "Ram K.", icon: "zap", sortOrder: 0 },
      { category: "Maintenance", name: "Preferred Plumber", description: "Shyam B.", icon: "wrench", sortOrder: 1 },
    ];

    await EmergencyContactModel.insertMany(defaults as any);
  }
}
