"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  CircleAlert,
  Compass,
  Loader2,
  MessageSquareText,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useProfile } from "@/lib/ProfileContext";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function getChipsForPage(pathname: string, hasProfile: boolean, hasRecommendations: boolean) {
  if (pathname === "/dashboard") {
    return [
      "Why is my #1 college ranked highest?",
      "Which college has the best ROI?",
      "Compare my top two options",
      "Is my rank safe for these colleges?",
    ];
  }

  if (pathname === "/compare") {
    return [
      "Which option has stronger placements?",
      "Break down the fee difference",
      "Which college is stronger for coding?",
      "Which choice is safer for my rank?",
    ];
  }

  if (pathname === "/profile") {
    return [
      "What category should I select?",
      "How does budget affect my options?",
      "Which branches have the best placements?",
      "What career goal should I pick?",
    ];
  }

  if (hasProfile && hasRecommendations) {
    return [
      "Analyse my top matches",
      "Which is my best NIT option?",
      "How should I weigh branch versus college?",
      "How is my FIT score calculated?",
    ];
  }

  return [
    "What rank do I need for an NIT?",
    "How should I compare IITs and NITs?",
    "How does JoSAA counselling work?",
    "Which engineering branches should I consider?",
  ];
}

function renderMessageContent(content: string): ReactNode {
  return content.split("\n").map((line, index) => {
    if (!line.trim()) {
      return <div className="chatbot-message-space" key={`space-${index}`} />;
    }

    const isBullet = /^[-•]\s/.test(line.trim());
    const text = isBullet ? line.trim().replace(/^[-•]\s/, "") : line;
    const fragments = text.split(/(\*\*[^*]+\*\*)/g).map((fragment, fragmentIndex) => {
      if (fragment.startsWith("**") && fragment.endsWith("**")) {
        return (
          <strong className="chatbot-markdown-strong" key={`${index}-${fragmentIndex}`}>
            {fragment.slice(2, -2)}
          </strong>
        );
      }

      return fragment;
    });

    if (isBullet) {
      return (
        <div className="chatbot-message-line chatbot-message-line-bullet" key={`line-${index}`}>
          <span aria-hidden="true">•</span>
          <span>{fragments}</span>
        </div>
      );
    }

    return (
      <div className="chatbot-message-line" key={`line-${index}`}>
        {fragments}
      </div>
    );
  });
}

export default function AIChatbot() {
  const pathname = usePathname();
  const { profile, recommendations } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [serviceNotice, setServiceNotice] = useState<"unavailable" | "error" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const hasProfile = Boolean(profile);
  const hasRecommendations = recommendations.length > 0;
  const chips = getChipsForPage(pathname, hasProfile, hasRecommendations);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    conversationEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [messages, isStreaming, serviceNotice]);

  const sendMessage = useCallback(
    async (customText?: string) => {
      const text = customText ?? input;
      if (!text.trim() || isStreaming) return;

      const userMessage: ChatMessage = { role: "user", content: text.trim() };
      const updatedMessages = [...messages, userMessage];
      const collegeContext = hasRecommendations
        ? recommendations.slice(0, 10).map((recommendation, index) => ({
            rank: index + 1,
            name: recommendation.college.name,
            type: recommendation.college.type,
            city: recommendation.college.city,
            state: recommendation.college.state,
            branch: recommendation.matchedBranch.name,
            overallScore: recommendation.overallScore,
            fees: recommendation.college.fees,
            avgPackageLPA: recommendation.college.avgPackageLPA,
            hostelRating: recommendation.college.hostelRating,
            codingCultureRating: recommendation.college.codingCultureRating,
            placementRating: recommendation.college.placementRating,
            breakdown: recommendation.breakdown,
            topReasons: recommendation.topReasons,
          }))
        : undefined;

      setInput("");
      setMessages(updatedMessages);
      setIsStreaming(true);
      setServiceNotice(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
            profile: hasProfile ? profile : undefined,
            colleges: collegeContext,
          }),
        });

        const contentType = response.headers.get("content-type") ?? "";
        if (!response.ok || contentType.includes("application/json")) {
          const data = await response.json().catch(() => ({}));
          const error = typeof data.error === "string" ? data.error : "Unable to reach Ask EduCompass.";
          const unavailable = /not configured/i.test(error);
          setServiceNotice(unavailable ? "unavailable" : "error");
          setMessages((current) => [
            ...current,
            {
              role: "assistant",
              content: unavailable
                ? "Ask EduCompass is not configured in this preview yet. You can keep exploring your shortlist while guidance is set up."
                : error,
            },
          ]);
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("The response stream was unavailable.");

        const decoder = new TextDecoder();
        let assistantContent = "";
        setMessages((current) => [...current, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          assistantContent += decoder.decode(value, { stream: true });
          setMessages((current) => [
            ...current.slice(0, -1),
            { role: "assistant", content: assistantContent },
          ]);
        }

        if (!assistantContent.trim()) {
          setMessages((current) => [
            ...current.slice(0, -1),
            {
              role: "assistant",
              content: "I could not prepare a response just now. Please try that question again.",
            },
          ]);
        }
      } catch {
        setServiceNotice("error");
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: "I could not connect to Ask EduCompass just now. Please try again in a moment.",
          },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [hasProfile, hasRecommendations, input, isStreaming, messages, profile, recommendations],
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const clearConversation = () => {
    setMessages([]);
    setServiceNotice(null);
    setInput("");
  };

  return (
    <>
      {!isOpen ? (
        <button
          aria-label="Open Ask EduCompass"
          className="chatbot-launcher"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          <MessageSquareText aria-hidden="true" size={17} strokeWidth={1.8} />
          <span>Ask EduCompass</span>
        </button>
      ) : (
        <aside className="chatbot-panel chatbot-panel-enter" aria-labelledby="ask-educompass-title">
          <header className="chatbot-panel-header">
            <div className="chatbot-panel-identity">
              <span className="chatbot-panel-mark" aria-hidden="true">
                <Compass size={18} strokeWidth={1.8} />
              </span>
              <div>
                <h2 id="ask-educompass-title">Ask EduCompass</h2>
                <p>Context-aware guidance for your shortlist</p>
              </div>
            </div>
            <div className="chatbot-panel-actions">
              {messages.length > 0 ? (
                <button
                  aria-label="Clear conversation"
                  className="chatbot-icon-button"
                  onClick={clearConversation}
                  title="Clear conversation"
                  type="button"
                >
                  <Trash2 aria-hidden="true" size={16} strokeWidth={1.7} />
                </button>
              ) : null}
              <button
                aria-label="Close Ask EduCompass"
                className="chatbot-icon-button"
                onClick={() => setIsOpen(false)}
                title="Close Ask EduCompass"
                type="button"
              >
                <X aria-hidden="true" size={18} strokeWidth={1.8} />
              </button>
            </div>
          </header>

          <div className="chatbot-conversation" ref={chatBodyRef}>
            {serviceNotice ? (
              <div className="chatbot-service-notice" data-kind={serviceNotice} role="status">
                <CircleAlert aria-hidden="true" size={17} strokeWidth={1.8} />
                <div>
                  <strong>
                    {serviceNotice === "unavailable"
                      ? "Guidance is unavailable in this preview"
                      : "Guidance needs another moment"}
                  </strong>
                  <p>
                    {serviceNotice === "unavailable"
                      ? "Your dashboard and shortlist remain available while this service is connected."
                      : "You can retry your question whenever you are ready."}
                  </p>
                </div>
              </div>
            ) : null}

            {messages.length === 0 ? (
              <div className="chatbot-empty-state">
                <span className="chatbot-empty-mark" aria-hidden="true">
                  <Compass size={21} strokeWidth={1.65} />
                </span>
                <div>
                  <h3>Start with a question</h3>
                  <p>
                    {hasProfile
                      ? "I can help you make sense of your profile, priorities, and college matches."
                      : "I can help you understand admissions before you build your shortlist."}
                  </p>
                </div>
                <div className="chatbot-chip-grid">
                  {chips.map((chip) => (
                    <button
                      className="chatbot-chip"
                      key={chip}
                      onClick={() => void sendMessage(chip)}
                      type="button"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="chatbot-message-list">
                {messages.map((message, index) => (
                  <div className="chatbot-message-row" data-role={message.role} key={`${message.role}-${index}`}>
                    {message.role === "assistant" ? (
                      <span className="chatbot-message-mark" aria-hidden="true">
                        <Compass size={14} strokeWidth={1.8} />
                      </span>
                    ) : null}
                    <div className="chatbot-bubble" data-role={message.role}>
                      {message.content ? renderMessageContent(message.content) : <Loader2 className="chatbot-inline-loader" size={16} />}
                    </div>
                  </div>
                ))}

                {isStreaming && messages[messages.length - 1]?.role !== "assistant" ? (
                  <div className="chatbot-loading" role="status">
                    <Loader2 aria-hidden="true" size={16} />
                    Thinking through your options
                  </div>
                ) : null}

                {!isStreaming ? (
                  <div className="chatbot-followups">
                    {chips.slice(0, 2).map((chip) => (
                      <button
                        className="chatbot-chip"
                        key={chip}
                        onClick={() => void sendMessage(chip)}
                        type="button"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
            <div ref={conversationEndRef} />
          </div>

          <form className="chatbot-input-form" onSubmit={submit}>
            <label className="sr-only" htmlFor="ask-educompass-input">
              Ask EduCompass a question
            </label>
            <input
              autoComplete="off"
              className="chatbot-input"
              id="ask-educompass-input"
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about your matches…"
              ref={inputRef}
              value={input}
            />
            <button
              aria-label="Send question"
              className="chatbot-send-button"
              disabled={!input.trim() || isStreaming}
              type="submit"
            >
              {isStreaming ? <Loader2 aria-hidden="true" className="chatbot-send-loader" size={17} /> : <Send aria-hidden="true" size={17} />}
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
