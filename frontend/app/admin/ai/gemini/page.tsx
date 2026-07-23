"use client";
import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
    type KeyboardEvent,
} from "react";
import { handleGenerateContent } from "@/lib/actions/ai/gemini-action";
import { Send } from "lucide-react";

type ChatMessage = {
    id: number;
    role: "user" | "assistant";
    content: string;
};

const starterMessages: ChatMessage[] = [
    {
        id: 1,
        role: "assistant",
        content: "Hello! I am your Apartment Sewa AI Assistant. Ask me anything about your apartment, rent, maintenance, or any property-related question!",
    },
];

const formatMessage = (value: unknown) => {
    if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
    }
    return "No content generated.";
};

export default function Page() {
    const [prompt, setPrompt] = useState("");
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(starterMessages);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isSending]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt || isSending) return;

        setPrompt("");
        setIsSending(true);
        setChatHistory((prev) => [
            ...prev,
            { id: Date.now(), role: "user", content: trimmedPrompt },
        ]);

        try {
            const result = await handleGenerateContent(trimmedPrompt);
            const resultData = formatMessage(
                result.data?.candidates?.[0]?.content?.parts?.[0]?.text,
            );

            setChatHistory((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: "assistant",
                    content: result.success ? resultData : result.message || "Something went wrong.",
                },
            ]);
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            setChatHistory((prev) => [
                ...prev,
                { id: Date.now() + 1, role: "assistant", content: message },
            ]);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#f8fafc" }}>

            {/* Page Header */}
            <div className="page-header">
                <div className="page-title-area">
                    <h1 className="page-title">AI Assistant</h1>
                    <p className="page-subtitle">Ask anything about your apartment, rent, or maintenance</p>
                </div>
            </div>

            {/* Chat Container */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                maxWidth: "800px",
                width: "100%",
                margin: "0 auto 24px auto",
                background: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                overflow: "hidden",
                minHeight: 0,
            }}>

                {/* Chat Header */}
                <div style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #e2e8f0",
                    background: "linear-gradient(135deg, #1a56db 0%, #1e40af 100%)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                }}>
                    <div style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        background: "rgba(255,255,255,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "20px",
                    }}>🤖</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: "15px", color: "#ffffff" }}>Apartment Sewa AI</div>
                        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)" }}>● Online — Ready to help</div>
                    </div>
                </div>

                {/* Messages Area */}
                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    minHeight: 0,
                }}>
                    {chatHistory.map((message) => (
                        <div
                            key={message.id}
                            style={{
                                display: "flex",
                                justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                            }}
                        >
                            {message.role === "assistant" && (
                                <div style={{
                                    width: "32px", height: "32px", borderRadius: "50%",
                                    background: "linear-gradient(135deg, #1a56db 0%, #1e40af 100%)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "14px", marginRight: "10px", flexShrink: 0, marginTop: "2px",
                                }}>🤖</div>
                            )}
                            <div style={{
                                maxWidth: "75%",
                                padding: "12px 16px",
                                borderRadius: message.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                background: message.role === "user"
                                    ? "linear-gradient(135deg, #1a56db 0%, #1e40af 100%)"
                                    : "#f1f5f9",
                                color: message.role === "user" ? "#ffffff" : "#1e293b",
                                fontSize: "14px",
                                lineHeight: "1.6",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            }}>
                                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {isSending && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                            <div style={{
                                width: "32px", height: "32px", borderRadius: "50%",
                                background: "linear-gradient(135deg, #1a56db 0%, #1e40af 100%)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "14px", flexShrink: 0,
                            }}>🤖</div>
                            <div style={{
                                padding: "14px 18px",
                                borderRadius: "18px 18px 18px 4px",
                                background: "#f1f5f9",
                                display: "flex", gap: "6px", alignItems: "center",
                            }}>
                                {[0, 1, 2].map((i) => (
                                    <div key={i} style={{
                                        width: "8px", height: "8px",
                                        borderRadius: "50%", background: "#94a3b8",
                                        animation: "bounce 1s ease-in-out infinite",
                                        animationDelay: `${i * 0.15}s`,
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{
                    borderTop: "1px solid #e2e8f0",
                    padding: "16px 20px",
                    background: "#ffffff",
                }}>
                    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                        <div style={{ flex: 1, position: "relative" }}>
                            <textarea
                                id="chat-prompt"
                                value={prompt}
                                onChange={handlePromptChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                                rows={2}
                                style={{
                                    width: "100%",
                                    resize: "none",
                                    border: "2px solid #e2e8f0",
                                    borderRadius: "12px",
                                    padding: "12px 16px",
                                    fontSize: "14px",
                                    fontFamily: "inherit",
                                    color: "#1e293b",
                                    background: "#f8fafc",
                                    outline: "none",
                                    lineHeight: "1.5",
                                    boxSizing: "border-box",
                                    transition: "border-color 0.2s",
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#1a56db"}
                                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSending || !prompt.trim()}
                            style={{
                                padding: "12px 20px",
                                background: isSending || !prompt.trim() ? "#94a3b8" : "linear-gradient(135deg, #1a56db 0%, #1e40af 100%)",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "12px",
                                cursor: isSending || !prompt.trim() ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "14px",
                                fontWeight: 600,
                                transition: "all 0.2s",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <Send size={16} />
                            {isSending ? "Sending..." : "Send"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
