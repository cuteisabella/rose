import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircleHeart,
  Send,
  X,
  Minus,
  RotateCcw,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ISABELLA_AVATAR_IMG, resolveAssetUrl } from '../defaultStore';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface StoredChatState {
  messages: ChatMessage[];
  proactiveSent: boolean;
}

interface IsabellaChatWidgetProps {
  avatarImage?: string;
  currentPageLabel?: string;
  memberTier?: string;
  hasBackToTop?: boolean;
}

const STORAGE_KEY = 'isabella_ai_chat_memory_v1';
const MAX_LOCAL_MESSAGES = 60;
const MAX_CONTEXT_MESSAGES = 16;
const MAX_INPUT_CHARS = 1000;
const PROACTIVE_IDLE_DELAY_MS = 45_000;

const SUGGESTED_STARTERS = [
  "How's your evening going?",
  'Tell me about a late night in Paris',
  'Keep me company for a bit',
  "What's your favorite wine?",
];

function createWelcomeMessage(): ChatMessage {
  return {
    id: `msg-welcome-${Date.now()}`,
    role: 'assistant',
    content:
      "Hey there ✨ I was hoping you'd drop by. Come keep me company for a little while—what kind of mood are you in tonight?",
    timestamp: new Date().toISOString(),
  };
}

function formatMessageTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function loadStoredChat(): StoredChatState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { messages: [], proactiveSent: false };
    }
    const parsed = JSON.parse(raw) as Partial<StoredChatState>;
    const validMessages = Array.isArray(parsed.messages)
      ? parsed.messages
          .filter(
            (m): m is ChatMessage =>
              Boolean(m) &&
              typeof m.id === 'string' &&
              (m.role === 'user' || m.role === 'assistant') &&
              typeof m.content === 'string' &&
              m.content.trim().length > 0 &&
              typeof m.timestamp === 'string'
          )
          .slice(-MAX_LOCAL_MESSAGES)
      : [];
    return {
      messages: validMessages,
      proactiveSent: Boolean(parsed.proactiveSent),
    };
  } catch {
    return { messages: [], proactiveSent: false };
  }
}

function saveStoredChat(state: StoredChatState): void {
  try {
    const trimmed: StoredChatState = {
      messages: state.messages.slice(-MAX_LOCAL_MESSAGES),
      proactiveSent: state.proactiveSent,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage quota or private-mode errors
  }
}

export const IsabellaChatWidget: React.FC<IsabellaChatWidgetProps> = ({
  avatarImage,
  currentPageLabel = 'Home',
  memberTier = 'Free',
  hasBackToTop = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadStoredChat().messages);
  const [proactiveSent, setProactiveSent] = useState<boolean>(() => loadStoredChat().proactiveSent);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [errorBanner, setErrorBanner] = useState<{ message: string; canRetry: boolean } | null>(null);
  const [lastFailedInput, setLastFailedInput] = useState<string | null>(null);
  const [isApiConfigured, setIsApiConfigured] = useState<boolean | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const resolvedAvatar = resolveAssetUrl(avatarImage, ISABELLA_AVATAR_IMG);

  // Sync chat history to browser localStorage
  useEffect(() => {
    saveStoredChat({ messages, proactiveSent });
  }, [messages, proactiveSent]);

  // Check server configuration status cleanly without exposing secrets
  useEffect(() => {
    if (!isOpen || isApiConfigured !== null) return;
    let active = true;
    fetch('/api/chat/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { configured?: boolean } | null) => {
        if (active && data && typeof data.configured === 'boolean') {
          setIsApiConfigured(data.configured);
        }
      })
      .catch(() => {
        // Defer error display until user tries to send
      });
    return () => {
      active = false;
    };
  }, [isOpen, isApiConfigured]);

  // Initialize Isabella's warm greeting the first time visitor opens an empty chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([createWelcomeMessage()]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to newest message
  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [isOpen, messages, isTyping, errorBanner]);

  // Keyboard Escape handler to minimize
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmClear) {
          setConfirmClear(false);
        } else {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, confirmClear]);

  // Focus input on desktop when opening
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && window.innerWidth >= 640) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 140);
      return () => window.clearTimeout(id);
    }
  }, [isOpen]);

  // Cleanup active request on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const requestReply = useCallback(
    async (
      conversationForApi: ChatMessage[],
      options?: { proactiveNudge?: boolean }
    ): Promise<string> => {
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const payloadMessages = conversationForApi
        .slice(-MAX_CONTEXT_MESSAGES)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: payloadMessages,
          proactiveNudge: Boolean(options?.proactiveNudge),
          context: {
            currentPage: currentPageLabel,
            memberTier,
          },
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
        code?: string;
      };

      if (!res.ok || !data.reply) {
        if (data.code === 'MISSING_API_KEY' || data.code === 'API_KEY_INVALID') {
          setIsApiConfigured(false);
        }
        const err = new Error(data.error || "I couldn't connect right now. Please try again in a moment.");
        (err as Error & { code?: string }).code = data.code;
        throw err;
      }

      setIsApiConfigured(true);
      return data.reply;
    },
    [currentPageLabel, memberTier]
  );

  // Single gentle proactive check-in while chat is open & visitor is idle (never loops)
  useEffect(() => {
    if (
      !isOpen ||
      proactiveSent ||
      isTyping ||
      errorBanner ||
      inputValue.trim().length > 0 ||
      isApiConfigured !== true ||
      messages.length === 0
    ) {
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'assistant') {
      return;
    }

    const timer = window.setTimeout(async () => {
      setProactiveSent(true);
      setIsTyping(true);
      try {
        const reply = await requestReply(messages, { proactiveNudge: true });
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-ai-${Date.now()}`,
            role: 'assistant',
            content: reply,
            timestamp: new Date().toISOString(),
          },
        ]);
      } catch {
        // Keep proactive follow-up quiet if interrupted or unreachable
      } finally {
        setIsTyping(false);
      }
    }, PROACTIVE_IDLE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [isOpen, proactiveSent, isTyping, errorBanner, inputValue, isApiConfigured, messages, requestReply]);

  const sendMessage = async (rawText: string, options?: { skipAddingUserMsg?: boolean }) => {
    const cleaned = rawText
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim();

    if (!cleaned || isTyping) return;
    if (cleaned.length > MAX_INPUT_CHARS) {
      setErrorBanner({
        message: `Please keep your message under ${MAX_INPUT_CHARS} characters.`,
        canRetry: false,
      });
      return;
    }

    setErrorBanner(null);
    setConfirmClear(false);

    let nextMessages = messages;
    if (!options?.skipAddingUserMsg) {
      const userMsg: ChatMessage = {
        id: `msg-user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'user',
        content: cleaned,
        timestamp: new Date().toISOString(),
      };
      nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInputValue('');
    }

    setLastFailedInput(null);
    setIsTyping(true);

    try {
      const reply = await requestReply(nextMessages);
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const typedErr = err as Error & { code?: string };
      setLastFailedInput(cleaned);
      setErrorBanner({
        message: typedErr.message || "I lost my connection for a second—mind trying again?",
        canRetry: typedErr.code !== 'MISSING_API_KEY',
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetryLast = () => {
    if (!lastFailedInput || isTyping) return;
    // Last user message is already in `messages` if added before failure
    const last = messages[messages.length - 1];
    const alreadyInHistory = Boolean(last && last.role === 'user' && last.content === lastFailedInput);
    void sendMessage(lastFailedInput, { skipAddingUserMsg: alreadyInHistory });
  };

  const handleClearChat = () => {
    abortControllerRef.current?.abort();
    setIsTyping(false);
    setErrorBanner(null);
    setLastFailedInput(null);
    setConfirmClear(false);
    setProactiveSent(false);
    const freshGreeting = createWelcomeMessage();
    setMessages([freshGreeting]);
    saveStoredChat({ messages: [freshGreeting], proactiveSent: false });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(inputValue);
    }
  };

  const hasVisitorSentMessage = messages.some((m) => m.role === 'user');

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <section
          aria-label="Chat with Isabella, Your Companion"
          className={`animate-toast-enter fixed inset-x-3 bottom-3 sm:inset-auto sm:right-5 z-50 w-auto sm:w-[390px] max-w-[calc(100vw-1.5rem)] h-[min(540px,80dvh)] flex flex-col rounded-3xl overflow-hidden bg-[#100a18]/95 backdrop-blur-xl border border-[#e5b36b]/30 shadow-[0_24px_70px_-15px_rgba(0,0,0,0.85),0_0_36px_-8px_rgba(184,75,110,0.35)] transition-[bottom] duration-200 ${
            hasBackToTop
              ? 'sm:bottom-36 sm:h-[min(540px,calc(100vh-10.5rem))]'
              : 'sm:bottom-24 sm:h-[min(570px,calc(100vh-7.5rem))]'
          }`}
        >
          {/* Ambient rose-gold top edge highlight */}
          <div className="h-[2px] w-full bg-gradient-to-r from-[#b84b6e] via-[#e7c792] to-[#9b59b6]" />

          {/* Header */}
          <header className="px-4 py-3.5 bg-gradient-to-r from-[#1a1124]/95 via-[#150e1e]/95 to-[#1f1224]/95 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {!avatarFailed ? (
                  <img
                    src={resolvedAvatar}
                    alt="Isabella Rose"
                    onError={() => setAvatarFailed(true)}
                    className="w-11 h-11 rounded-full object-cover object-top border-2 border-[#e5b36b]/60 shadow-md"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#e7c792] to-[#b84b6e] flex items-center justify-center text-stone-950 font-serif-display font-bold text-lg">
                    I
                  </div>
                )}
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#150e1e] shadow-sm"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif-display text-lg font-bold tracking-wide text-white leading-none truncate">
                    Isabella
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#b84b6e]/25 text-[#ff9ebb] border border-[#ff7eb3]/30 shrink-0">
                    Your Companion
                  </span>
                </div>
                <p className="text-[11px] text-[#e7c792]/80 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isTyping ? 'Typing to you...' : 'Online now'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setConfirmClear((v) => !v)}
                aria-label="Clear chat history"
                title="Clear chat memory"
                className="p-2 rounded-full text-stone-400 hover:text-[#ff9ebb] hover:bg-white/5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Minimize chat"
                title="Minimize chat"
                className="hidden sm:inline-flex p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                title="Close chat"
                className="p-2 rounded-full text-stone-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Inline Reset Confirmation */}
          {confirmClear && (
            <div
              role="alertdialog"
              aria-label="Confirm clearing chat history"
              className="px-4 py-2.5 bg-[#201329] border-b border-[#ff7eb3]/25 flex items-center justify-between gap-2 text-xs text-stone-200 shrink-0"
            >
              <span className="leading-snug">
                Reset chat memory saved in this browser?
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="px-2.5 py-1 rounded-lg bg-[#b84b6e] hover:bg-[#cc587d] text-white font-semibold transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Messages Viewport */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 scroll-smooth">
            <div className="text-center pb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-[10px] text-stone-400">
                <Sparkles className="w-3 h-3 text-[#e5b36b]" />
                <span>Saved locally in this browser · Virtual AI companion</span>
              </span>
            </div>

            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`animate-toast-enter flex items-end gap-2 ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isUser && (
                    <img
                      src={resolvedAvatar}
                      alt=""
                      aria-hidden="true"
                      className="w-7 h-7 rounded-full object-cover object-top border border-[#e5b36b]/40 shrink-0 mb-4"
                    />
                  )}

                  <div className={`max-w-[82%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap break-words shadow-md ${
                        isUser
                          ? 'bg-gradient-to-br from-[#b84b6e]/55 via-[#8e3660]/55 to-[#2c1733]/90 border border-[#ff7eb3]/35 text-[#fff6f9] rounded-2xl rounded-br-sm'
                          : 'bg-[#1b1326]/95 border border-[#e5b36b]/20 text-[#f5efe6] rounded-2xl rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-stone-500 mt-1 px-1">
                      {formatMessageTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Optional Suggested Starters for First-Time Visitors */}
            {!hasVisitorSentMessage && !isTyping && (
              <div className="pt-1 flex flex-wrap gap-1.5">
                {SUGGESTED_STARTERS.map((starter) => (
                  <button
                    key={starter}
                    type="button"
                    onClick={() => void sendMessage(starter)}
                    className="text-left text-xs px-3 py-1.5 rounded-full bg-[#1d1429]/90 hover:bg-[#2a1c3a] border border-[#e5b36b]/30 hover:border-[#ff7eb3]/50 text-[#e7c792] hover:text-white transition-all"
                  >
                    {starter}
                  </button>
                ))}
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-end gap-2 justify-start" aria-live="polite" aria-label="Isabella is typing">
                <img
                  src={resolvedAvatar}
                  alt=""
                  aria-hidden="true"
                  className="w-7 h-7 rounded-full object-cover object-top border border-[#e5b36b]/40 shrink-0"
                />
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-[#1b1326]/95 border border-[#e5b36b]/20 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e7c792] animate-bounce [animation-delay:-0.25s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff7eb3] animate-bounce [animation-delay:-0.12s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e7c792] animate-bounce" />
                </div>
              </div>
            )}

            {/* Friendly Error State */}
            {errorBanner && (
              <div
                role="alert"
                className="p-3 rounded-2xl bg-[#27131d]/95 border border-[#ff758c]/40 text-xs text-[#ffd2dc] flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-[#ff758c] shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="leading-relaxed">{errorBanner.message}</p>
                  <div className="flex items-center gap-2">
                    {errorBanner.canRetry && lastFailedInput && (
                      <button
                        type="button"
                        onClick={handleRetryLast}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#b84b6e] hover:bg-[#cf597f] text-white font-semibold transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Try again</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setErrorBanner(null)}
                      className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-stone-300 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendMessage(inputValue);
            }}
            className="p-3 bg-[#130d1d]/95 border-t border-white/10 shrink-0"
          >
            <div className="flex items-end gap-2 bg-[#1c1428] border border-white/10 focus-within:border-[#e5b36b]/55 rounded-2xl px-3 py-2 transition-colors">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value.slice(0, MAX_INPUT_CHARS))}
                onKeyDown={handleKeyDown}
                placeholder="Write to Isabella..."
                aria-label="Message Isabella"
                maxLength={MAX_INPUT_CHARS}
                className="flex-1 bg-transparent text-base sm:text-sm text-[#f7f1e5] placeholder:text-stone-500 resize-none overflow-y-auto focus:outline-none max-h-24 py-1 leading-snug"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                aria-label="Send message"
                className="shrink-0 w-9 h-9 rounded-xl gorgeous-btn-gradient text-stone-950 flex items-center justify-center shadow-md hover:opacity-95 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {inputValue.length > 750 && (
              <div className="text-[10px] text-right text-stone-400 mt-1 pr-1">
                {inputValue.length}/{MAX_INPUT_CHARS}
              </div>
            )}
          </form>
        </section>
      )}

      {/* Floating Bottom-Right Launcher Button (Positioned Above Back to Top) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Minimize Isabella chat' : 'Open chat with Isabella'}
        aria-expanded={isOpen}
        className={`fixed right-5 z-40 group flex items-center gap-3 p-1.5 sm:pr-4 rounded-full bg-[#161021]/95 backdrop-blur-md border border-[#e5b36b]/45 shadow-[0_12px_35px_-5px_rgba(184,75,110,0.45)] hover:border-[#ff7eb3]/70 hover:-translate-y-0.5 transition-all duration-200 ${
          hasBackToTop ? 'bottom-20' : 'bottom-5'
        } ${isOpen ? 'hidden sm:flex' : 'flex'}`}
      >
        <div className="relative">
          {!avatarFailed ? (
            <img
              src={resolvedAvatar}
              alt="Isabella"
              onError={() => setAvatarFailed(true)}
              className="w-11 h-11 rounded-full object-cover object-top border border-[#e5b36b]/60"
            />
          ) : (
            <div className="w-11 h-11 rounded-full gorgeous-btn-gradient flex items-center justify-center text-stone-950">
              <MessageCircleHeart className="w-5 h-5" />
            </div>
          )}
          <span
            aria-hidden="true"
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#161021]"
          />
        </div>

        <div className="hidden sm:flex flex-col items-start text-left pr-1">
          <span className="text-xs font-semibold text-white tracking-wide flex items-center gap-1">
            <span>{isOpen ? 'Minimize Chat' : 'Chat with Isabella'}</span>
            <Sparkles className="w-3 h-3 text-[#e7c792]" />
          </span>
          <span className="text-[10px] text-[#ff9ebb] font-medium">
            {isOpen ? 'Click to hide' : 'Your Companion · Online'}
          </span>
        </div>
      </button>
    </>
  );
};
