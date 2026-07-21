import mongoose, { Schema, Document } from "mongoose";

export interface IUnit extends Document {
  flatNo: string;
  floor: string;
  rent: number;
  status: "Occupied" | "Vacant";
  tenantName?: string;
  tenantPhone?: string;
  image?: string;
  created_at: Date;
  updated_at: Date;
}

const UnitSchema = new Schema<IUnit>(
  {
    flatNo: { type: String, required: true, unique: true },
    floor: { type: String, required: true },
    rent: { type: Number, required: true },
    status: { type: String, enum: ["Occupied", "Vacant"], default: "Vacant" },
    tenantName: { type: String },
    tenantPhone: { type: String },
    image: { type: String },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const UnitModel = mongoose.model<IUnit>("Unit", UnitSchema);
