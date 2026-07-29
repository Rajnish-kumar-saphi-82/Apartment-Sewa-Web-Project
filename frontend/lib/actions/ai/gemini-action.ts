"use server";

import { generateContent, analyzeImage } from "@/lib/api/ai/gemini";

const systemInstruction = `You are a friendly, highly knowledgeable AI assistant embedded in 'Apartment Sewa', a premier apartment and property management web application designed for users in Nepal. 
Your primary goal is to help users (Tenants, Owners, and Admins) navigate the platform and understand its features. 

Key features of Apartment Sewa include:
1. Dashboard Analytics: Tracks monthly revenue, bill statuses, and property occupancy (vacant vs occupied units).
2. KYC Verification: A secure system where users upload their ID (Citizenship/Passport) and a selfie. Admins review and approve these to ensure safety.
3. Billing & Payments: Owners can generate monthly bills covering Rent, Electricity, Water, and Service costs. Tenants can view and pay these bills via the platform.
4. Maintenance Tickets: Tenants can submit maintenance requests (e.g., Plumbing, Electrical) with photos. The system even uses AI to auto-diagnose issues from images.
5. Notice Board: Admins/Owners can post announcements that appear on tenant dashboards.
6. Settings & Profile: Users can manage their personal details and access quick Emergency Contacts (like Local Police, Ambulance, or Plumbers via WhatsApp).

Always be polite, concise (under two paragraphs), and use simple analogies if explaining complex features. Tailor your answers specifically to how Apartment Sewa works.`;

const contents = "Context: Please answer the following user query based strictly on the features and capabilities of the Apartment Sewa platform.";

export async function handleGenerateContent(prompt: string): Promise<any> {
    try {
        const response = await generateContent(systemInstruction, contents, prompt);
        
        if (response.candidates && response.candidates.length > 0) {
            return {
                success: true,
                data: response,
                message: "Content generated successfully",
            };
        }
        else {
            return {
                success: false,
                message: response.message || "Failed to generate content",
            }
        }
    } catch (error) {
        return {
            success: false,
            error: true,
            message: error instanceof Error ? error.message : "An unknown error occurred",
        }
    }
}

export async function handleAnalyzeImage(base64Image: string, mimeType: string): Promise<any> {
    try {
        const response = await analyzeImage(base64Image, mimeType);
        
        if (response.candidates && response.candidates.length > 0) {
            return {
                success: true,
                data: response.candidates[0].content.parts[0].text,
                message: "Image analyzed successfully",
            };
        }
        else {
            return {
                success: false,
                message: "Failed to analyze image",
            }
        }
    } catch (error: any) {
        console.error("[Gemini Action Error]:", error?.response?.data || error.message || error);
        return {
            success: false,
            error: true,
            message: error instanceof Error ? error.message : "An unknown error occurred",
        }
    }
}
