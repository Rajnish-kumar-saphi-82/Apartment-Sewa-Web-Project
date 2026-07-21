import mongoose, { Schema, Document } from "mongoose";

export interface IEmergencyContact extends Document {
  category: "Public Emergency" | "Property Management" | "Maintenance";
  name: string;
  number?: string;
  description?: string;
  whatsapp?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    category: {
      type: String,
      enum: ["Public Emergency", "Property Management", "Maintenance"],
      required: true,
    },
    name: { type: String, required: true },
    number: { type: String },
    description: { type: String },
    whatsapp: { type: String },
    icon: { type: String },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const EmergencyContactModel = mongoose.model<IEmergencyContact>(
  "EmergencyContact",
  EmergencyContactSchema
);
