"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Bot, Send, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import type { ChatMessage } from "@/types";

const TG_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "";

export function ChatWidget() {
  const ensureChatUserId = useAppStore((s) => s.ensureChatUserId);
  const [open, setOpen] = useState(false);
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

  // SSE stream for owner replies
  useEffect(() => {
    if (!userId) return;
    let eventSource: EventSource | null = null;

    const connect = () => {
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
              return [...prev, ...incoming.filter((m) => !seen.has(m.id))];
            });
            lastTs.current = incoming[incoming.length - 1].timestamp;
            const ownerReplies = incoming.filter((m) => m.sender === "owner");
            if (ownerReplies.length) setUnread((u) => u + ownerReplies.length);
            scrollToBottom();
          }
        } catch {
          // ignore
        }
      };
      eventSource.onerror = () => {
        eventSource?.close();
        setTimeout(connect, 3000);
      };
    };

    connect();
    return () => eventSource?.close();
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
        <div className="fixed bottom-36 sm:bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm h-[30rem] rounded-2xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="p-3 border-b border-border bg-muted/40 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">AI Chatbot</p>
              <p className="text-[10px] text-muted-foreground">Siap membantu 24/7</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground mt-8 px-4">
                <Bot className="h-10 w-10 mx-auto mb-2 text-primary/40" />
                <p>Halo! Ada yang bisa saya bantu?</p>
                <p className="text-xs mt-1 text-muted-foreground/70">Tanyakan apa saja tentang produk kami.</p>
              </div>
            )}
            {messages.map((m, idx) => {
              const isAi = m.sender === "ai";
              const isUser = m.sender === "user";
              const isOwner = m.sender === "owner";
              const isLastAi = isAi && messages.slice(idx + 1).every((n) => n.sender !== "ai");

              return (
                <div key={m.id} className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
                  {isOwner && (
                    <span className="text-[10px] font-semibold text-muted-foreground mb-0.5 ml-1">
                      👤 Owner
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                      isUser
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm",
                    )}
                  >
                    {m.message}
                  </div>
                  {/* Telegram button after last AI message */}
                  {isLastAi && TG_USERNAME && (
                    <a
                      href={`https://t.me/${TG_USERNAME}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 ml-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#229ED9]/10 border border-[#229ED9]/30 text-[#229ED9] text-[11px] font-medium hover:bg-[#229ED9]/20 active:scale-95 transition-all"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Hubungi Owner
                    </a>
                  )}
                </div>
              );
            })}
            {sending && (
              <div className="flex items-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-2 border-t border-border flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ketik pesan..."
              className="flex-1 h-10 px-3 rounded-full bg-muted text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <Button size="icon" className="rounded-full h-10 w-10" onClick={send} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
