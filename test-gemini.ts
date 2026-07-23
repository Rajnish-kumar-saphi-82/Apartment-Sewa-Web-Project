import axios from "axios";

const API_KEY = "AIzaSyAVcDWinK3n5K_ldOlKz7C5_qkt4NyWRZk";

const test = async () => {
    try {
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            contents: [
                {
                    parts: [
                        { text: "Hello" }
                    ]
                }
            ]
        }, {
            headers: {
                "Content-Type": "application/json"
            }
        });
        console.log("SUCCESS:", JSON.stringify(response.data));
    } catch (error: any) {
        console.error("ERROR:", error.response?.data || error.message);
    }
};

test();
