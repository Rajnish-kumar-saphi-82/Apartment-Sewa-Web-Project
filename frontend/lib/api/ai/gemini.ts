import axios from "axios";

const API_KEY =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY ||
    process.env.NEXT_PUBLIC_API_KEY ||
    "";
const MODELS = ["gemini-flash-latest", "gemini-3.5-flash", "gemini-2.0-flash"];

const aiApiClient = axios.create({
    baseURL: "https://generativelanguage.googleapis.com",
    headers: {
        "Content-Type": "application/json"
    },
});

const assertApiKey = () => {
    if (!API_KEY) {
        throw new Error("Gemini API key is missing. Add API_KEY or GEMINI_API_KEY to your env file and restart the frontend.");
    }
};

const postToGemini = async (payload: unknown) => {
    assertApiKey();

    let lastError: unknown;
    for (const model of MODELS) {
        try {
            const response = await aiApiClient.post(`/v1beta/models/${model}:generateContent?key=${API_KEY}`, payload);
            return response.data;
        } catch (error) {
            lastError = error;
            const status = axios.isAxiosError(error) ? error.response?.status : undefined;
            if (status && status !== 404 && status !== 400) break;
        }
    }

    throw lastError;
};

export const generateContent = async (systemInstruction: string, userContext: string, userQuery: string) => {
    try {
        return await postToGemini({
            systemInstruction: {
                parts: [
                    {
                        text: systemInstruction
                    }
                ]
            },
            contents: [
                {
                    parts: [
                        { text: userContext },
                        { text: userQuery }
                    ]
                }
            ]
        });
    } catch (error) {
        console.error("Error generating content:", error);
        throw error;
    }
};

export const analyzeImage = async (base64Image: string, mimeType: string) => {
    try {
        return await postToGemini({
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
        });
    } catch (error) {
        console.error("Error analyzing image:", error);
        throw error;
    }
};
