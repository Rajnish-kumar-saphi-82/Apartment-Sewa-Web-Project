import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
  flatNo: string;
  description: string;
  urgency: "urgent" | "priority" | "new" | "resolved";
  status: "Pending" | "In Progress" | "Fixed";
  image: string;
  diagnostic?: string;
  cost?: string;
  created_at: Date;
  updated_at: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    flatNo: { type: String, required: true },
    description: { type: String, required: true },
    urgency: {
      type: String,
      enum: ["urgent", "priority", "new", "resolved"],
      default: "new",
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Fixed"],
      default: "Pending",
    },
    image: { type: String, required: true },
    diagnostic: { type: String },
    cost: { type: String },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export const TicketModel = mongoose.model<ITicket>("Ticket", TicketSchema);
