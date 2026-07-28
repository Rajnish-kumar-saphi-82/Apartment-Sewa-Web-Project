import axios from "axios";
import fs from "fs";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not configured.");
}
const MODEL = "llama-3.2-11b-vision-preview"; 

const aiApiClient = axios.create({
    baseURL: "https://api.groq.com/openai/v1",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
    },
});

export const analyzeMaintenanceImage = async (imagePath: string): Promise<string> => {
    try {
        if (!GROQ_API_KEY) {
            console.error("[AI Diagnostic] No GROQ_API_KEY configured!");
            return "AI scanning failed. No API key configured.";
        }

        if (!fs.existsSync(imagePath)) {
            console.error("[AI Diagnostic] Image file not found at path:", imagePath);
            return "AI scanning failed. Image file not found.";
        }

        console.log("[AI Diagnostic] Analyzing image at path:", imagePath);

        const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
        const mimeType = imagePath.endsWith('.png') ? 'image/png' 
                       : imagePath.endsWith('.webp') ? 'image/webp' 
                       : 'image/jpeg';

        console.log("[AI Diagnostic] Image encoded, MIME type:", mimeType, "Base64 length:", base64Image.length);

        let response: any = null;

        try {
            console.log("[AI Diagnostic] Using Groq Vision model...");
            response = await aiApiClient.post(
                `/chat/completions`,
                {
                    model: MODEL,
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: "Analyze this image and identify the maintenance issue in 1-2 short sentences. Be concise." },
                                { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
                            ]
                        }
                    ]
                }
            );
            
        } catch (error: any) {
             throw error; 
        }

        console.log("[AI Diagnostic] Got response from Groq API");

        if (response.data?.choices?.[0]?.message?.content) {
            const result = response.data.choices[0].message.content;
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
