import axios from "axios";
import { UnitModel } from "../models/unit.model.js";
import { BillModel } from "../models/bill.model.js";
import { TicketModel } from "../models/ticket.model.js";
import { NoticeModel } from "../models/notice.model.js";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not configured.");
}
const MODEL = "llama-3.1-8b-instant"; // Fast and free tier friendly

const aiApiClient = axios.create({
  baseURL: "https://api.groq.com/openai/v1",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${GROQ_API_KEY}`
  },
});

export class ChatService {
  async getLiveContext() {
    try {
      // 1. Occupancy details
      const totalUnitsCount = await UnitModel.countDocuments();
      const occupiedUnitsCount = await UnitModel.countDocuments({ status: "Occupied" });
      const vacantUnitsCount = totalUnitsCount - occupiedUnitsCount;

      // 2. Bills details
      const totalBillsCount = await BillModel.countDocuments();
      const pendingBillsCount = await BillModel.countDocuments({ status: "Pending" });
      const paidBillsCount = totalBillsCount - pendingBillsCount;
      const totalRevenueResult = await BillModel.aggregate([
        { $match: { status: "Paid" } },
        { $group: { _id: null, total: { $sum: "$totalCost" } } }
      ]);
      const totalRevenue = totalRevenueResult[0]?.total || 0;

      // 3. Maintenance details
      const pendingTicketsCount = await TicketModel.countDocuments({ status: "Pending" });
      const inProgressTicketsCount = await TicketModel.countDocuments({ status: "In Progress" });
      const fixedTicketsCount = await TicketModel.countDocuments({ status: "Fixed" });

      // 4. Latest notices
      const latestNotices = await NoticeModel.find().sort({ created_at: -1 }).limit(3).lean();
      const noticesStr = latestNotices
        .map((n: any) => `- [${n.category}] ${n.title}: ${n.content}`)
        .join("\n") || "No recent notices.";

      return `
=== APARTMENT REAL-TIME DATABASE CONTEXT ===
Property Statistics:
- Total Units: ${totalUnitsCount}
- Occupied Units: ${occupiedUnitsCount}
- Vacant Units: ${vacantUnitsCount}

Financial Statistics:
- Total Generated Bills: ${totalBillsCount}
- Paid Bills: ${paidBillsCount}
- Unpaid/Pending Bills: ${pendingBillsCount}
- Total Revenue Collected: NPR ${totalRevenue.toLocaleString()}

Maintenance Tickets:
- Pending Repair Tickets: ${pendingTicketsCount}
- In-Progress Repairs: ${inProgressTicketsCount}
- Resolved/Fixed Repairs: ${fixedTicketsCount}

Recent Announcements/Notices:
${noticesStr}
===========================================
`;
    } catch (err) {
      console.error("Error gathering live database context for chatbot:", err);
      return "Database context currently unavailable.";
    }
  }

  async getResponse(message: string, history: any[], userRole: string, userPhone: string, userName: string) {
    const liveContext = await this.getLiveContext();

    const systemInstruction = `You are a friendly, highly knowledgeable AI assistant embedded in 'Apartment Sewa', a premier apartment and property management web application designed for users in Nepal.
Your primary goal is to help users (Tenants, Owners, and Admins) navigate the platform, understand its features, and retrieve information about their properties.

Always answer politely and concisely (typically under two paragraphs).
Tailor your answers specifically to how Apartment Sewa works.
You MUST refer to the provided "APARTMENT REAL-TIME DATABASE CONTEXT" below to answer user queries about unit counts, paid/unpaid bills, revenue, notices, or repair tickets. Do not guess stats; use the exact database figures.

User context:
- Name: ${userName}
- Phone: ${userPhone}
- Role: ${userRole}

${liveContext}
`;

    // Map frontend history format to Groq/OpenAI format
    const messages = [
      { role: "system", content: systemInstruction },
      ...history.map(h => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content
      })),
      { role: "user", content: message }
    ];

    try {
      const response = await aiApiClient.post(`/chat/completions`, {
        model: MODEL,
        messages: messages,
      });

      const textOutput = response.data.choices[0].message.content;

      // Return exactly the structure the frontend expects (Gemini format mock)
      return {
        candidates: [{
          content: {
            parts: [{
              text: textOutput
            }]
          }
        }]
      };
    } catch (error: any) {
      console.error("Chatbot Groq API error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || "Chat service failed to respond.");
    }
  }
}
