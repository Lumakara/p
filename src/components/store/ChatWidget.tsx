"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Bot, User2, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import type { ChatMessage } from "@/types";

type Mode = "ai" | "owner";

export function ChatWidget() {
  const ensureChatUserId = useAppStore((s) => s.ensureChatUserId);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("ai");
  const [userId, setUserId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const lastTs = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserId(ensureChatUserId());
  }, [ensureChatUserId]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    });
  };

  // Connect to SSE stream for new messages
  useEffect(() => {
    if (!userId) return;
    
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      const url = new URL("/api/chat/messages", window.location.origin);
      url.searchParams.set("userId", userId);
      if (lastTs.current) url.searchParams.set("since", lastTs.current);
      
      eventSource = new EventSource(url.toString());

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const incoming: ChatMessage[] = data.messages || [];
          if (incoming.length) {
            setMessages((prev) => {
              const seen = new Set(prev.map((m) => m.id));
              const merged = [...prev, ...incoming.filter((m) => !seen.has(m.id))];
              return merged;
            });
            lastTs.current = incoming[incoming.length - 1].timestamp;
            
            // Wait for next tick so `open` state might be evaluated properly
            // However, due to closure over `open`, this might use stale `open` value.
            // So we rely on a separate useEffect to handle `unread` or use function updater.
            const ownerReplies = incoming.filter((m) => m.sender === "owner");
            if (ownerReplies.length) {
              setUnread((u) => {
                // If we want to check `open` inside setter, we can't directly here
                // We'll manage it by resetting unread when open becomes true.
                return u + ownerReplies.length;
              });
            }
            scrollToBottom();
          }
        } catch (err) {
          console.warn("[chat] failed parsing SSE:", err);
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        setTimeout(connectSSE, 3000); // Reconnect after 3s on error
      };
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [userId]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending || !userId) return;
    setSending(true);
    const localMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      sender: "user",
      message: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, localMsg]);
    setInput("");
    scrollToBottom();

    try {
      if (mode === "ai") {
        const res = await fetch("/api/chat/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, message: text }),
        });
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              sender: "ai",
              message: data.message,
              source: data.source,
              timestamp: data.timestamp || new Date().toISOString(),
            },
          ]);
        }
      } else {
        const res = await fetch("/api/chat/owner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, message: text }),
        });
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: "owner",
            message:
              data.note || "Pesan terkirim. Owner akan segera merespons.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          message: "Terjadi kesalahan. Coba lagi nanti.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
      scrollToBottom();
    }
  };

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat"
        className="fixed bottom-20 sm:bottom-6 right-4 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-36 sm:bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm h-[28rem] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          {/* Header / mode toggle */}
          <div className="p-2 border-b border-border flex gap-1 bg-muted/50">
            <button
              onClick={() => setMode("ai")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 h-9 rounded-lg text-sm font-medium transition",
                mode === "ai" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <Bot className="h-4 w-4" /> AI Chatbot
            </button>
            <button
              onClick={() => setMode("owner")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1 h-9 rounded-lg text-sm font-medium transition",
                mode === "owner" ? "bg-primary text-primary-foreground" : "hover:bg-muted",
              )}
            >
              <User2 className="h-4 w-4" /> Chat Owner
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground mt-8">
                {mode === "ai"
                  ? "Halo! Ada yang bisa saya bantu?"
                  : "Hubungkan dengan owner. Tulis pesanmu di bawah."}
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                  m.sender === "user"
                    ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                    : "mr-auto bg-muted rounded-bl-sm",
                )}
              >
                {m.sender === "owner" && (
                  <span className="block text-[10px] font-semibold opacity-70 mb-0.5">
                    👤 Owner
                  </span>
                )}
                {m.message}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-2 border-t border-border flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ketik pesan..."
              className="flex-1 h-10 px-3 rounded-full bg-muted text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <Button size="icon" className="rounded-full" onClick={send} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
