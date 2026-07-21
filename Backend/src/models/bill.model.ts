import mongoose, { Schema, Document } from "mongoose";

export interface IBill extends Document {
  flatNo: string;
  tenantName: string;
  month: string;
  rentCost: number;
  electricityCost: number;
  waterCost: number;
  serviceCost: number;
  totalCost: number;
  status: "Paid" | "Pending";
  paymentDate?: string;
  paymentMethod?: string;
  created_at: Date;
  updated_at: Date;
}

const BillSchema = new Schema<IBill>(
  {
    flatNo: { type: String, required: true },
    tenantName: { type: String, required: false, default: "Unassigned Tenant" },
    month: { type: String, required: true },
    rentCost: { type: Number, required: true },
    electricityCost: { type: Number, required: true },
    waterCost: { type: Number, required: true },
    serviceCost: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    status: { type: String, enum: ["Paid", "Pending"], default: "Pending" },
    paymentDate: { type: String },
    paymentMethod: { type: String },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const BillModel = mongoose.model<IBill>("Bill", BillSchema);
