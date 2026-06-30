"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useChildSession } from "@/lib/child/ChildProvider";
import { useStreamingText } from "@/lib/child/useStreamingText";
import { t } from "@/lib/child/i18n";
import { getFigureAvatar } from "@/lib/design/avatars";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

interface ChatWindowProps {
  mode: "assistant" | "figure";
  figureSlug?: string;
  figureName?: string;
  headerEmoji?: string;
}

export function ChatWindow({ mode, figureSlug, figureName, headerEmoji = "🤖" }: ChatWindowProps) {
  const { profile, addStars } = useChildSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [streamTarget, setStreamTarget] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const avatarUrl = figureSlug ? getFigureAvatar(figureSlug) : undefined;
  const { displayed, isStreaming } = useStreamingText(streamTarget, !!streamingId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayed]);

  useEffect(() => {
    if (!streamingId || isStreaming) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === streamingId ? { ...m, content: streamTarget, streaming: false } : m
      )
    );
    setStreamingId(null);
  }, [isStreaming, streamingId, streamTarget]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);
    const userId = `u-${Date.now()}`;
    setMessages((prev) => [...prev, { id: userId, role: "user", content: text }]);
    setLoading(true);

    try {
      const url =
        mode === "figure" && figureSlug
          ? `/api/figures/${figureSlug}/chat`
          : "/api/chat";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: profile.childId,
          conversationId,
          message: text,
          age: profile.age,
          name: profile.name,
          language: profile.language,
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? t("error", profile.language));
        return;
      }

      setConversationId(json.data.conversationId);
      const reply: string = json.data.reply;
      const assistantId = `a-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ]);
      setStreamingId(assistantId);
      setStreamTarget(reply);
      addStars(1);
    } catch {
      setError(t("error", profile.language));
    } finally {
      setLoading(false);
    }
  }, [input, loading, mode, figureSlug, profile, conversationId, addStars]);

  const placeholder =
    mode === "figure"
      ? t("figurePlaceholder", profile.language)
      : t("placeholder", profile.language);

  const greeting =
    mode === "figure"
      ? `${figureName ?? ""} — ${t("figureGreeting", profile.language)}`
      : `${t("greeting", profile.language)} ${t("greetingHint", profile.language)}`;

  return (
    <div className="flex flex-col bg-white rounded-3xl shadow-heavy-blue border border-white overflow-hidden h-[calc(100dvh-180px)] max-h-[720px]">
      {mode === "figure" && figureName && (
        <div className="px-5 py-4 border-b border-surface-variant flex items-center gap-3 bg-white/80 backdrop-blur-md">
          <div className="relative">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={figureName}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                unoptimized
              />
            ) : (
              <span className="text-3xl">{headerEmoji}</span>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-tertiary-fixed-dim border-2 border-white rounded-full" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-primary">{figureName}</h3>
            <p className="text-xs text-outline font-semibold">AI Arena · onlayn</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-surface-container-low/30 hide-scrollbar">
        {messages.length === 0 && (
          <div className="text-center mt-8 px-4">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt=""
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-primary shadow-md"
                unoptimized
              />
            ) : (
              <span className="text-5xl">{headerEmoji}</span>
            )}
            <p className="text-outline mt-3 text-sm font-medium">{greeting}</p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const content =
            msg.id === streamingId && msg.streaming ? displayed : msg.content;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? "self-end flex-row-reverse" : "self-start"}`}
            >
              {!isUser && avatarUrl && (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-surface-variant mt-1"
                  unoptimized
                />
              )}
              <div className="flex flex-col gap-1">
                <div
                  className={`p-4 rounded-2xl shadow-sm font-medium text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? "bg-primary text-on-primary rounded-tr-none"
                      : "bg-white text-on-surface rounded-tl-none border border-surface-container-low"
                  }`}
                >
                  {content}
                  {msg.id === streamingId && isStreaming && (
                    <span className="inline-block w-2 h-4 bg-primary-fixed ml-0.5 animate-pulse align-middle" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && !streamingId && (
          <div className="self-start flex gap-3 items-center">
            {avatarUrl && (
              <Image src={avatarUrl} alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover" unoptimized />
            )}
            <div className="p-4 bg-white rounded-2xl rounded-tl-none border border-surface-container-low shadow-sm flex gap-1.5 items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" />
              <span className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="text-red-600 text-sm px-4 py-1 bg-red-50 mx-2 mb-1 rounded-xl">{error}</p>
      )}

      <div className="p-4 bg-white border-t border-surface-variant flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={placeholder}
          maxLength={2000}
          disabled={loading}
          className="flex-grow bg-brand-bg border-2 border-surface-variant focus:border-primary focus:bg-white rounded-full px-5 py-3 text-sm font-semibold outline-none transition-all disabled:opacity-50 min-h-[48px]"
          aria-label={placeholder}
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-primary text-on-primary hover:bg-primary-hover disabled:opacity-40 font-bold text-sm px-6 rounded-full transition-all cursor-pointer flex items-center justify-center shadow-md shadow-primary/20 min-h-[48px]"
        >
          {t("send", profile.language)}
        </button>
      </div>
    </div>
  );
}
