import axios from "axios";
import fs from "fs";

const API_KEY =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY ||
    "";
const MODELS = ["gemini-flash-latest", "gemini-3.5-flash", "gemini-2.0-flash"];

const aiApiClient = axios.create({
    baseURL: "https://generativelanguage.googleapis.com",
    headers: {
        "Content-Type": "application/json",
    },
});

export const analyzeMaintenanceImage = async (imagePath: string): Promise<string> => {
    try {
        if (process.env.NODE_ENV === "test") {
            return "Test AI diagnostic result.";
        }

        if (!API_KEY) {
            console.error("[AI Diagnostic] No API_KEY found in environment variables!");
            return "AI scanning failed. No API key configured. Add API_KEY or GEMINI_API_KEY to Backend/.env.";
        }

        if (!fs.existsSync(imagePath)) {
            console.error("[AI Diagnostic] Image file not found at path:", imagePath);
            return "AI scanning failed. Image file not found.";
        }

        console.log("[AI Diagnostic] Analyzing image at path:", imagePath);
        console.log("[AI Diagnostic] Using API key starting with:", API_KEY.substring(0, 10) + "...");

        const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
        const mimeType = imagePath.endsWith('.png') ? 'image/png' 
                       : imagePath.endsWith('.webp') ? 'image/webp' 
                       : 'image/jpeg';

        console.log("[AI Diagnostic] Image encoded, MIME type:", mimeType, "Base64 length:", base64Image.length);

        let response;
        const payload = {
            contents: [
                {
                    parts: [
                        { text: "Analyze this image and identify the maintenance issue in 1-2 short sentences. Be concise." },
                        {
                            inline_data: {
                                mime_type: mimeType,
                                data: base64Image
                            }
                        }
                    ]
                }
            ]
        };

        let lastError: any;
        for (const model of MODELS) {
            try {
                response = await aiApiClient.post(
                    `/v1beta/models/${model}:generateContent?key=${API_KEY}`,
                    payload
                );
                break;
            } catch (error: any) {
                lastError = error;
                console.error(`[AI Diagnostic] ${model} failed:`, error?.response?.data || error?.message);
                if (error?.response?.status && ![400, 404].includes(error.response.status)) break;
            }
        }

        if (!response) {
            throw lastError || new Error("Gemini API did not return a response.");
        }

        console.log("[AI Diagnostic] Got response from Gemini API");

        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            const result = response.data.candidates[0].content.parts[0].text;
            console.log("[AI Diagnostic] Result:", result);
            return result;
        }

        console.warn("[AI Diagnostic] Response received but no text found:", JSON.stringify(response.data));
        return "AI scanning complete. No specific issues identified.";

    } catch (error: any) {
        console.error("[AI Diagnostic] FAILED:");
        console.error("Status:", error?.response?.status);
        console.error("Error data:", JSON.stringify(error?.response?.data, null, 2));
        console.error("Message:", error?.message);
        return `AI scanning failed: ${error?.response?.data?.error?.message || error?.message || "Unknown error"}`;
    }
};
