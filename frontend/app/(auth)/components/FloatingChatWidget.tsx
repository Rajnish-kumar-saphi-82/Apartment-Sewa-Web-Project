"use client";

import { useState, useRef, useEffect, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { MessageSquare, X } from "lucide-react";
import { handleGenerateContent } from "@/lib/actions/ai/gemini-action";
import Image from "next/image";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const starterMessages: ChatMessage[] = [
  {
    id: 1,
    role: "assistant",
    content: "👋 Namaste! I'm your Apartment Sewa AI Assistant. Ask me anything about managing your apartment, tenants, billing, or maintenance!",
  },
];

const formatMessage = (value: unknown) => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return "No content generated.";
};

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(starterMessages);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [chatHistory, isSending, isOpen]);

  const handlePromptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

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
      const resultData = formatMessage(result.data?.candidates?.[0]?.content?.parts?.[0]?.text);
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: result.success ? resultData : result.message || "Something went wrong.",
        },
      ]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: error instanceof Error ? error.message : "An unknown error occurred.",
        },
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
    <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "16px" }}>
      {isOpen && (
        <div style={{
          width: "380px",
          height: "560px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          backgroundImage: "url('/assets/images/login-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #1a56db, #3b82f6)",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#ffffff"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#ffffff", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.8)" }}>
                <img src="/assets/images/chartbot.png" alt="AI Avatar" width="24" height="24" style={{ objectFit: "contain", width: "100%", height: "100%" }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Apartment Sewa AI</h3>
                <p style={{ margin: 0, fontSize: "12px", opacity: 0.9 }}>Always here to help</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", padding: "4px" }}>
              <X size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "rgba(248, 250, 252, 0.85)" }}>
            {chatHistory.map((message) => (
              <div key={message.id} style={{ display: "flex", justifyContent: message.role === "user" ? "flex-end" : "flex-start" }}>
                {message.role === "assistant" && (
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#ffffff", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "8px", flexShrink: 0, marginTop: "2px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    <img src="/assets/images/chartbot.png" alt="AI Avatar" width="24" height="24" style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                  </div>
                )}
                <div style={{
                  maxWidth: "75%",
                  padding: "10px 14px",
                  borderRadius: message.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  backgroundColor: message.role === "user" ? "#1a56db" : "#ffffff",
                  color: message.role === "user" ? "#ffffff" : "#1e293b",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  border: message.role === "assistant" ? "1px solid #e2e8f0" : "none"
                }}>
                  <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{message.content}</p>
                </div>
              </div>
            ))}

            {isSending && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#ffffff", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                  <img src="/assets/images/chartbot.png" alt="AI Avatar" width="24" height="24" style={{ objectFit: "contain", width: "100%", height: "100%" }} />
                </div>
                <div style={{ padding: "10px 14px", borderRadius: "16px 16px 16px 4px", backgroundColor: "#ffffff", display: "flex", gap: "6px", alignItems: "center", border: "1px solid #e2e8f0" }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#94a3b8", animation: "bounce 1.2s infinite", animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ borderTop: "1px solid #e2e8f0", padding: "16px", backgroundColor: "#ffffff" }}>
            <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", alignItems: "flex-end", position: "relative" }}>
              <textarea
                value={prompt}
                onChange={handlePromptChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                rows={1}
                style={{
                  flex: 1, resize: "none", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "10px 48px 10px 16px",
                  fontSize: "14px", color: "#0f172a", backgroundColor: "#f8fafc", outline: "none",
                  fontFamily: "inherit", lineHeight: "1.4", transition: "border-color 0.2s"
                }}
                onFocus={(e) => { e.target.style.borderColor = "#1a56db"; }}
                onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; }}
              />
              <button
                type="submit"
                disabled={isSending || !prompt.trim()}
                style={{
                  position: "absolute", right: "6px", bottom: "6px", width: "32px", height: "32px",
                  borderRadius: "50%", border: "none", backgroundColor: isSending || !prompt.trim() ? "transparent" : "#1a56db",
                  color: isSending || !prompt.trim() ? "#94a3b8" : "#ffffff",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: isSending || !prompt.trim() ? "not-allowed" : "pointer",
                  transition: "background-color 0.2s",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button — matches design: white circle + blue ring + building icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "96px",
          height: "96px",
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          border: "none",
          padding: "3px",
          background: isOpen
            ? "linear-gradient(135deg, #1a56db, #3b82f6)"
            : "linear-gradient(135deg, #1a56db 0%, #60a5fa 100%)",
          boxShadow: "0 4px 20px rgba(26, 86, 219, 0.35)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s, box-shadow 0.2s",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 6px 28px rgba(26, 86, 219, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(26, 86, 219, 0.35)";
        }}
        aria-label="Open AI Chat"
      >
        {/* Inner white circle */}
        <div style={{
          width: "100%", height: "100%", borderRadius: "50%",
          backgroundColor: "#ffffff",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {isOpen
            ? <X size={48} color="#1a56db" />
            : <img src="/assets/images/chartbot.png" alt="AI Chat" width="86" height="86" style={{ objectFit: "cover", width: "100%", height: "100%", borderRadius: "50%" }} />
          }
        </div>
      </button>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
