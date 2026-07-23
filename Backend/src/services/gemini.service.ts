import axios from "axios";
import fs from "fs";

const API_KEY = process.env.API_KEY || "";

const aiApiClient = axios.create({
    baseURL: "https://generativelanguage.googleapis.com",
    headers: {
        "Content-Type": "application/json",
    },
});

export const analyzeMaintenanceImage = async (imagePath: string): Promise<string> => {
    try {
        if (!API_KEY) {
            console.error("[AI Diagnostic] No API_KEY found in environment variables!");
            return "AI scanning failed. No API key configured.";
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

        // Try with x-goog-api-key header first (standard API key format)
        let response;
        try {
            response = await aiApiClient.post(
                `/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
                {
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
                }
            );
        } catch (firstError: any) {
            console.error("[AI Diagnostic] First attempt failed:", firstError?.response?.data || firstError?.message);
            
            // Try with Bearer auth as fallback
            console.log("[AI Diagnostic] Retrying with Bearer auth...");
            response = await aiApiClient.post(
                `/v1beta/models/gemini-flash-latest:generateContent`,
                {
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
                },
                {
                    headers: {
                        "Authorization": `Bearer ${API_KEY}`,
                        "Content-Type": "application/json"
                    }
                }
            );
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
