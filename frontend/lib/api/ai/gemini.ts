import axios from "axios";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "AIzaSyAVcDWinK3n5K_ldOlKz7C5_qkt4NyWRZk";

// const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const aiApiClient = axios.create({
    baseURL: "https://generativelanguage.googleapis.com",
    headers: {
        "Content-Type": "application/json"
    },
});

export const generateContent = async (systemInstruction: string, userContext: string, userQuery: string) => {
    try {
        const response = await aiApiClient.post(`/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
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
        return response.data;
    } catch (error) {
        console.error("Error generating content:", error);
        throw error;
    }
};

export const analyzeImage = async (base64Image: string, mimeType: string) => {
    try {
        const response = await aiApiClient.post(`/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
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
        return response.data;
    } catch (error) {
        console.error("Error analyzing image:", error);
        throw error;
    }
};
