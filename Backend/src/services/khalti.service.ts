import axios from "axios";
import { BillModel } from "../models/bill.model.js";

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || "9c2c8ed9e3ee405db629d5606f2bdb75";
const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL || "https://dev.khalti.com/api/v2";

export class KhaltiService {
  async initiatePayment(billId: string) {
    const bill = await BillModel.findById(billId);
    if (!bill) {
      throw new Error("Bill not found");
    }

    if (bill.status === "Paid") {
      throw new Error("Bill is already paid");
    }

    const payload = {
      return_url: "http://localhost:3000/payment/callback",
      website_url: "http://localhost:3000",
      amount: bill.totalCost * 100, // convert to paisa
      purchase_order_id: bill._id.toString(),
      purchase_order_name: `Rent Bill - ${bill.flatNo} - ${bill.month}`,
      customer_info: {
        name: bill.tenantName || "Tenant",
        email: "tenant@apartmentsewa.com",
        phone: "9800000001", // Placeholder or use tenant phone if stored
      },
    };

    try {
      const response = await axios.post(`${KHALTI_BASE_URL}/epayment/initiate/`, payload, {
        headers: {
          Authorization: `key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      });

      const { pidx, payment_url } = response.data;
      if (!pidx || !payment_url) {
        throw new Error("Failed to get pidx or payment_url from Khalti response");
      }

      bill.khaltiPidx = pidx;
      await bill.save();

      return { pidx, payment_url };
    } catch (error: any) {
      console.error("Khalti Initiate Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || "Khalti initiation failed");
    }
  }

  async verifyPayment(pidx: string) {
    try {
      const response = await axios.post(
        `${KHALTI_BASE_URL}/epayment/lookup/`,
        { pidx },
        {
          headers: {
            Authorization: `key ${KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const status = response.data.status;
      if (status === "Completed") {
        const bill = await BillModel.findOne({ khaltiPidx: pidx });
        if (!bill) {
          throw new Error("No bill matching this payment token was found.");
        }

        const paymentDate = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        bill.status = "Paid";
        bill.paymentDate = paymentDate;
        bill.paymentMethod = "Khalti";
        bill.khaltiTransactionId = response.data.transaction_id;
        await bill.save();

        return bill;
      } else {
        throw new Error(`Payment verification failed: Status is ${status}`);
      }
    } catch (error: any) {
      console.error("Khalti Verify Error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.detail || error.message || "Payment verification failed");
    }
  }
}
