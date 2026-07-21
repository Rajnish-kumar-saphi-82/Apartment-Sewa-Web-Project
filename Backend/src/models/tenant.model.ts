import mongoose, { Schema, Document } from "mongoose";

export interface ITenant extends Document {
  name: string;
  phone: string;
  flatNo: string;
  houseCode: string;
  created_at: Date;
  updated_at: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    flatNo: { type: String, required: true },
    houseCode: { type: String, required: true, unique: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const TenantModel = mongoose.model<ITenant>("Tenant", TenantSchema);
