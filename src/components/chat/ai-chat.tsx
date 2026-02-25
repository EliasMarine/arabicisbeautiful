"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChatBubble } from "./chat-bubble";
import { Send, RotateCcw, History, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ConversationSummary {
  id: number;
  title: string;
  createdAt: string;
}

const STARTERS: Record<number, string[]> = {
  1: ["مرحبا!", "كيفك؟", "شو اسمك؟", "Hello! Can we practice greetings?"],
  2: ["بدي أطلب أكل", "وين أقرب صيدلية؟", "I want to practice ordering food", "شو الطقس اليوم؟"],
  3: ["شو رأيك بالأكل اللبناني؟", "خبرني عن عيلتك", "Let's discuss weekend plans", "شو أحلى شي بلبنان؟"],
  4: ["بدي إحكي عن الشغل", "كيف الوضع السياسي؟", "Let's practice formal Arabic", "شو رأيك بالتكنولوجيا؟"],
  5: ["شو عم تتابع بالأخبار؟", "خلينا نحكي فلسفة", "يلا نحكي عن الغربة", "شو أحلى مسلسل لبناني؟"],
  6: ["خلينا نحكي شعر", "شو يعني الهوية اللبنانية؟", "Let's discuss diaspora life", "عندك أمثال لبنانية؟"],
};

interface AIChatProps {
  phaseId: number;
}

export function AIChat({ phaseId }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<ConversationSummary[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const starters = STARTERS[phaseId] || STARTERS[1];

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch history
  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/history?phaseId=${phaseId}`);
      const data = await res.json();
      if (data.conversations) {
        setHistory(data.conversations);
      }
    } catch {}
  }, [phaseId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMessage: Message = { role: "user", content: content.trim() };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput("");
      setIsStreaming(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phaseId,
            messages: newMessages,
            conversationId,
          }),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let assistantContent = "";

        // Add placeholder assistant message
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split("\n").filter((l) => l.startsWith("data: "));

          for (const line of lines) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantContent += parsed.content;
                // Update the last message (assistant) in place
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return updated;
                });
              }
            } catch {}
          }
        }
      } catch (err) {
        console.error("[Chat] Error:", err);
        setMessages((prev) => [
          ...prev.filter((m) => m.content !== ""),
          {
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
          },
        ]);
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming, phaseId, conversationId]
  );

  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setShowHistory(false);
    inputRef.current?.focus();
  }, []);

  const handleDeleteConversation = useCallback(
    async (id: number) => {
      try {
        await fetch(`/api/chat/history?id=${id}`, { method: "DELETE" });
        setHistory((prev) => prev.filter((c) => c.id !== id));
        if (conversationId === id) {
          handleNewConversation();
        }
      } catch {}
    },
    [conversationId, handleNewConversation]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage]
  );

  return (
    <div className="flex flex-col h-[500px] sm:h-[600px] bg-[var(--card-bg)] rounded-lg border border-[var(--sand)] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--sand)] bg-[var(--sand)]/30">
        <h3 className="text-sm font-semibold text-[var(--dark)]">
          AI Conversation Partner
        </h3>
        <div className="flex gap-1.5">
          <button
            onClick={() => {
              setShowHistory(!showHistory);
              if (!showHistory) loadHistory();
            }}
            className="p-1.5 rounded-lg hover:bg-[var(--sand)] text-[var(--muted)] transition-colors"
            title="History"
          >
            <History size={16} />
          </button>
          <button
            onClick={handleNewConversation}
            className="p-1.5 rounded-lg hover:bg-[var(--sand)] text-[var(--muted)] transition-colors"
            title="New conversation"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="border-b border-[var(--sand)] bg-[var(--cream)] px-3 py-2 max-h-40 overflow-y-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[var(--muted)]">
              Recent Conversations
            </span>
            <button
              onClick={() => setShowHistory(false)}
              className="text-[var(--muted)] hover:text-[var(--dark)]"
            >
              <X size={14} />
            </button>
          </div>
          {history.length === 0 ? (
            <p className="text-xs text-[var(--muted)] italic">
              No conversations yet
            </p>
          ) : (
            <div className="space-y-1">
              {history.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between gap-2 group"
                >
                  <button
                    onClick={() => {
                      // Load conversation - for now just start fresh
                      setShowHistory(false);
                      setConversationId(conv.id);
                    }}
                    className="text-xs text-[var(--dark)] hover:text-[var(--phase-color)] truncate flex-1 text-left"
                  >
                    {conv.title}
                  </button>
                  <button
                    onClick={() => handleDeleteConversation(conv.id)}
                    className="text-[var(--muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <p className="text-4xl mb-3">🇱🇧</p>
            <p className="text-sm font-semibold text-[var(--dark)] mb-1">
              Practice Lebanese Arabic
            </p>
            <p className="text-xs text-[var(--muted)] mb-4">
              Type in Arabic or English — I&apos;ll respond in Lebanese Arabic
              with transliteration and translation.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {starters.map((starter, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(starter)}
                  disabled={isStreaming}
                  className="px-3 py-1.5 text-xs bg-[var(--sand)] text-[var(--dark)] rounded-full hover:bg-[var(--gold)] hover:text-white transition-colors disabled:opacity-50"
                  dir={/[\u0600-\u06FF]/.test(starter) ? "rtl" : "ltr"}
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatBubble
              key={i}
              speaker={msg.role === "user" ? "You" : "AI"}
              isUser={msg.role === "user"}
              content={msg.content}
              isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
            />
          ))
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-2.5 border-t border-[var(--sand)] bg-[var(--cream)]"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type in Arabic or English..."
          disabled={isStreaming}
          className={cn(
            "flex-1 bg-[var(--card-bg)] border border-[var(--sand)] rounded-full px-4 py-2 text-sm",
            "text-[var(--dark)] placeholder:text-[var(--muted)]",
            "focus:outline-none focus:border-[var(--phase-color)]",
            "disabled:opacity-50"
          )}
          dir="auto"
        />
        <button
          type="submit"
          disabled={!input.trim() || isStreaming}
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center transition-all",
            "bg-[var(--phase-color)] text-white",
            "disabled:opacity-30 hover:opacity-80"
          )}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
