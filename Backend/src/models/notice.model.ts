import mongoose, { Schema, Document } from "mongoose";

export interface INotice extends Document {
  title: string;
  message: string;
  date: string;
  created_at: Date;
  updated_at: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const NoticeModel = mongoose.model<INotice>("Notice", NoticeSchema);
