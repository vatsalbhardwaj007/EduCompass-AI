"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  MessageSquareText,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useProfile } from "@/lib/ProfileContext";

// ─── Types ────────────────────────────────────────────────────
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ─── Smart suggestion chips based on page context ─────────────
function getChipsForPage(
  pathname: string,
  hasProfile: boolean,
  hasRecommendations: boolean
): string[] {
  if (pathname === "/dashboard" && hasRecommendations) {
    return [
      "Why is my #1 college ranked highest?",
      "Which college has the best ROI?",
      "Compare my top 2 options",
      "Is my rank safe for the top match?",
    ];
  }
  if (pathname === "/compare") {
    return [
      "Which of these colleges is better for placements?",
      "Break down the fee difference",
      "Which has stronger coding culture?",
      "Which is safer for my rank?",
    ];
  }
  if (pathname === "/profile") {
    return [
      "What category should I select?",
      "How does budget affect my options?",
      "Which branches have best placements?",
      "What career goal should I pick?",
    ];
  }
  // Landing page or default
  if (hasProfile) {
    return [
      "Analyze my college options",
      "What's the best NIT for my rank?",
      "Should I prefer branch or college?",
      "Explain the FIT score system",
    ];
  }
  return [
    "What rank do I need for top NITs?",
    "IIT vs NIT — which is better?",
    "How does JoSAA counselling work?",
    "Best branches for high packages?",
  ];
}

// ─── Simple markdown-ish renderer ─────────────────────────────
function renderMessageContent(content: string) {
  // Split into lines and process
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    // Bold text
    let processed: React.ReactNode = line;

    // Process **bold** patterns
    const boldParts = line.split(/(\*\*[^*]+\*\*)/g);
    if (boldParts.length > 1) {
      processed = boldParts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} style={{ color: "#ffffff", fontWeight: 600 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
    }

    // Bullet points
    if (line.startsWith("- ") || line.startsWith("• ")) {
      elements.push(
        <div key={i} className="flex gap-2 pl-1" style={{ marginTop: "2px" }}>
          <span
            className="shrink-0 mt-1"
            style={{ color: "#555", fontSize: "8px" }}
          >
            ●
          </span>
          <span>{typeof processed === "string" ? processed : processed}</span>
        </div>
      );
      return;
    }

    // Numbered lists
    if (/^\d+\.\s/.test(line)) {
      elements.push(
        <div key={i} className="pl-1" style={{ marginTop: "2px" }}>
          {processed}
        </div>
      );
      return;
    }

    // Empty lines become spacers
    if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: "6px" }} />);
      return;
    }

    // Regular lines
    elements.push(
      <div key={i} style={{ marginTop: i > 0 ? "1px" : 0 }}>
        {processed}
      </div>
    );
  });

  return <>{elements}</>;
}

// ─── Main Component ───────────────────────────────────────────
export default function AIChatbot() {
  const pathname = usePathname();
  const { profile, recommendations } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const hasProfile = !!profile;
  const hasRecommendations = recommendations.length > 0;
  const chips = getChipsForPage(pathname, hasProfile, hasRecommendations);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ─── Send message with streaming ──────────────────────────
  const sendMessage = useCallback(
    async (customText?: string) => {
      const text = customText || input;
      if (!text.trim() || isStreaming) return;

      setInput("");

      const userMessage: ChatMessage = { role: "user", content: text };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsStreaming(true);

      // Prepare college data for context
      const collegeContext =
        hasRecommendations
          ? recommendations.slice(0, 10).map((r, i) => ({
              rank: i + 1,
              name: r.college.name,
              type: r.college.type,
              city: r.college.city,
              state: r.college.state,
              branch: r.matchedBranch.name,
              overallScore: r.overallScore,
              fees: r.college.fees,
              avgPackageLPA: r.college.avgPackageLPA,
              hostelRating: r.college.hostelRating,
              codingCultureRating: r.college.codingCultureRating,
              placementRating: r.college.placementRating,
              breakdown: r.breakdown,
              topReasons: r.topReasons,
            }))
          : undefined;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            profile: hasProfile ? profile : undefined,
            colleges: collegeContext,
          }),
        });

        // Check if it's a JSON error response
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.error || "Sorry, something went wrong." },
          ]);
          setIsStreaming(false);
          return;
        }

        // Stream the response
        const reader = res.body?.getReader();
        if (!reader) {
          throw new Error("No reader available");
        }

        const decoder = new TextDecoder();
        let assistantContent = "";

        // Add empty assistant message that we'll update
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;

          // Update the last message with accumulated content
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: assistantContent,
            };
            return updated;
          });
        }

        if (!assistantContent.trim()) {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: "Sorry, I couldn't generate a response. Please try again.",
            };
            return updated;
          });
        }
      } catch {
        setMessages((prev) => [
          ...prev.filter((m) => m.content !== ""),
          {
            role: "assistant",
            content: "Sorry, there was a connection error. Please check your API key and try again.",
          },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [input, messages, isStreaming, hasProfile, hasRecommendations, profile, recommendations]
  );

  const clearChat = () => {
    setMessages([]);
  };

  // ─── Welcome message (shown when no messages) ─────────────
  const welcomeContent = (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-10 space-y-5">
      <div
        className="h-16 w-16 rounded-2xl flex items-center justify-center chatbot-icon-glow"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Bot className="h-8 w-8 text-white" />
      </div>
      <div className="space-y-2">
        <h3 className="text-base font-bold text-white">
          EduCompass AI Counsellor
        </h3>
        <p className="text-xs leading-relaxed" style={{ color: "#666" }}>
          {hasProfile
            ? "I have access to your profile and matched colleges. Ask me anything about your options!"
            : "Ask me anything about JEE admissions, college choices, branch selection, or career paths."}
        </p>
      </div>

      {/* Mode indicator */}
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
        style={{
          background: hasProfile
            ? "rgba(255,255,255,0.08)"
            : "rgba(255,255,255,0.04)",
          border: `1px solid ${hasProfile ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)"}`,
          color: hasProfile ? "#fff" : "#666",
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: hasProfile ? "#fff" : "#555",
            boxShadow: hasProfile ? "0 0 6px rgba(255,255,255,0.4)" : "none",
          }}
        />
        {hasProfile ? "Personalised Mode" : "General Counselling"}
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => sendMessage(chip)}
            className="chatbot-chip text-[11px] px-3.5 py-2 rounded-xl border cursor-pointer transition-all"
            style={{
              background: "#1a1a1a",
              borderColor: "rgba(255,255,255,0.08)",
              color: "#777",
            }}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* ── Floating Action Button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105 chatbot-fab"
          style={{
            background: "#ffffff",
            boxShadow:
              "0 8px 32px -6px rgba(255,255,255,0.25), 0 0 0 1px rgba(255,255,255,0.1)",
          }}
          aria-label="Open AI Counsellor"
        >
          <MessageSquareText className="h-6 w-6 text-black" />
          <span
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 flex items-center justify-center"
            style={{
              borderColor: "#0a0a0a",
              background: "#fff",
            }}
          >
            <Sparkles
              className="h-2 w-2"
              style={{ color: "#0a0a0a" }}
            />
          </span>
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-2xl chatbot-fab-pulse" />
        </button>
      )}

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div
          className="fixed bottom-0 right-0 w-full sm:w-[420px] sm:bottom-6 sm:right-6 z-50 chatbot-panel-enter"
          style={{ maxHeight: "calc(100vh - 48px)" }}
        >
          <div
            className="flex flex-col rounded-none sm:rounded-2xl overflow-hidden"
            style={{
              height: "min(580px, calc(100vh - 48px))",
              background: "rgba(12,12,12,0.97)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "0 32px 80px -12px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)",
              backdropFilter: "blur(40px)",
            }}
          >
            {/* ── Header ── */}
            <div
              className="px-4 py-3.5 flex items-center justify-between shrink-0"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(10,10,10,0.8)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: "#ffffff",
                    boxShadow: "0 0 16px -4px rgba(255,255,255,0.3)",
                  }}
                >
                  <Bot className="h-5 w-5 text-black" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white">
                    AI Counsellor
                  </div>
                  <div
                    className="text-[10px] font-semibold flex items-center gap-1.5"
                    style={{ color: "#888" }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full inline-block"
                      style={{
                        background: hasProfile ? "#fff" : "#555",
                        boxShadow: hasProfile
                          ? "0 0 6px rgba(255,255,255,0.5)"
                          : "none",
                      }}
                    />
                    {hasProfile
                      ? "Personalised • Llama 3.3"
                      : "General Mode • Llama 3.3"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                    style={{ color: "#444" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#444";
                      e.currentTarget.style.background = "transparent";
                    }}
                    title="Clear chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
                  style={{ color: "#666" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#666";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div
              ref={chatBodyRef}
              className="flex-1 overflow-y-auto"
              style={{ scrollBehavior: "smooth" }}
            >
              {messages.length === 0 ? (
                welcomeContent
              ) : (
                <div className="p-4 space-y-3">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex gap-2.5 chatbot-msg-enter ${
                        m.role === "user" ? "justify-end" : "justify-start"
                      }`}
                      style={{ animationDelay: `${Math.min(i * 30, 150)}ms` }}
                    >
                      {m.role === "assistant" && (
                        <div
                          className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-1"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <Bot className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[82%] px-4 py-2.5 text-xs leading-relaxed ${
                          m.role === "user"
                            ? "chat-bubble-user"
                            : "chat-bubble-ai"
                        }`}
                        style={{
                          color:
                            m.role === "assistant" ? "#999" : "#0a0a0a",
                        }}
                      >
                        {m.role === "assistant"
                          ? renderMessageContent(m.content)
                          : m.content}
                        {/* Streaming cursor */}
                        {m.role === "assistant" &&
                          i === messages.length - 1 &&
                          isStreaming && (
                            <span className="chatbot-cursor" />
                          )}
                      </div>
                      {m.role === "user" && (
                        <div
                          className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-1"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}
                        >
                          <User className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Loading indicator (before first chunk) */}
                  {isStreaming &&
                    messages[messages.length - 1]?.role !== "assistant" && (
                      <div className="flex gap-2.5 justify-start chatbot-msg-enter">
                        <div
                          className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <Bot className="h-3.5 w-3.5 text-white" />
                        </div>
                        <div
                          className="chat-bubble-ai px-4 py-2.5 flex items-center gap-2 text-xs"
                          style={{ color: "#888" }}
                        >
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Thinking…
                        </div>
                      </div>
                    )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* ── Quick chips (when messages exist) ── */}
            {messages.length > 0 && !isStreaming && (
              <div
                className="px-3 py-2 flex gap-1.5 overflow-x-auto shrink-0 chatbot-chips-bar"
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(10,10,10,0.5)",
                }}
              >
                {chips.slice(0, 3).map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="chatbot-chip text-[10px] whitespace-nowrap px-2.5 py-1.5 rounded-lg border cursor-pointer shrink-0 transition-all"
                    style={{
                      background: "#1a1a1a",
                      borderColor: "rgba(255,255,255,0.06)",
                      color: "#666",
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* ── Input ── */}
            <div
              className="p-3 flex gap-2 shrink-0"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(10,10,10,0.8)",
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={
                  hasProfile
                    ? "Ask about your matched colleges…"
                    : "Ask about JEE admissions…"
                }
                disabled={isStreaming}
                className="flex-1 text-xs text-white h-10 rounded-xl px-4 outline-none transition-all"
                style={{
                  background: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#fff",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isStreaming}
                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200"
                style={{
                  background:
                    input.trim() && !isStreaming ? "#ffffff" : "#222",
                  opacity: input.trim() && !isStreaming ? 1 : 0.4,
                }}
              >
                <Send
                  className="h-4 w-4"
                  style={{
                    color:
                      input.trim() && !isStreaming ? "#0a0a0a" : "#555",
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
