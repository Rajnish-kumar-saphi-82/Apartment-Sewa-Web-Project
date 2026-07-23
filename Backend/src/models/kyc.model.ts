import mongoose, { Schema, Document } from "mongoose";

export interface IKyc extends Document {
  userId: string;
  documentType: "Citizenship" | "Passport" | "Driver License" | "National ID";
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl: string;
  ownershipCertUrl?: string; 
  status: "Pending" | "Approved" | "Rejected";
  reviewNote?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  created_at: Date;
  updated_at: Date;
}

const KycSchema = new Schema<IKyc>(
  {
    userId: { type: String, required: true },
    documentType: {
      type: String,
      enum: ["Citizenship", "Passport", "Driver License", "National ID"],
      required: true,
    },
    documentFrontUrl: { type: String, required: true },
    documentBackUrl: { type: String },
    selfieUrl: { type: String, required: true },
    ownershipCertUrl: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    reviewNote: { type: String },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const KycModel = mongoose.model<IKyc>("Kyc", KycSchema);
