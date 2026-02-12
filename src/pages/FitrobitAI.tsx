import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Bot, Send, Trash2, Download, Loader2, Copy, Check, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import Request from "@/lib/api/client";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface HistoryItem {
  user: string;
  assistant: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content: `Hello! I'm **Fitrobit AI**, your intelligent gym assistant. 🏋️

I can help you with:
- 📊 **Revenue analytics** & financial insights
- 👥 **Member trends** & attendance patterns
- 📅 **Class scheduling** optimization
- 🔄 **Membership renewal** predictions
- 💡 **Smart suggestions** to grow your gym

Ask me anything about your gym operations!`,
};

const QUICK_PROMPTS = [
  "📊 Revenue summary this month",
  "👥 Member growth trends",
  "📅 Optimize my class schedule",
  "💡 Tips to reduce churn",
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function FitrobitAI() {
  const location = useLocation();
  const initialQuery = (location.state as any)?.initialQuery || "";
  const authUser = useAppSelector((state) => state.auth.user);

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitialQuery = useRef(false);

  const currentUser = {
    name: authUser?.ownerName || authUser?.name || "User",
    initials: (authUser?.ownerName || authUser?.name || "U")
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    avatarUrl: authUser?.logo || null,
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
  }, []);

  const buildHistory = (msgs: ChatMessage[]): HistoryItem[] => {
    const history: HistoryItem[] = [];
    for (let i = 0; i < msgs.length - 1; i += 2) {
      const userMsg = msgs[i];
      const assistantMsg = msgs[i + 1];
      if (userMsg?.role === "user" && assistantMsg?.role === "assistant") {
        history.push({ user: userMsg.content, assistant: assistantMsg.content });
      }
    }
    return history;
  };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: ChatMessage = { role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsLoading(true);
      scrollToBottom();

      // Reset textarea height
      if (inputRef.current) inputRef.current.style.height = "auto";

      try {
        const conversationMessages = messages.filter(
          (m) => m !== WELCOME_MESSAGE
        );
        const history = buildHistory(conversationMessages);

        const response = await Request.post<{ response: string; error?: string }>(
          "/ai/chat",
          { message: text.trim(), history }
        );

        const aiContent =
          (response as any)?.response ||
          (response as any)?.data?.response ||
          (response as any)?.message ||
          "I couldn't process that request. Please try again.";

        const aiMessage: ChatMessage = { role: "assistant", content: aiContent };
        setMessages((prev) => [...prev, aiMessage]);
      } catch (error: any) {
        console.error("AI Chat error:", error);
        const errorContent =
          error?.response?.data?.message ||
          error?.message ||
          "Sorry, I encountered an error. Please try again.";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ ${errorContent}` },
        ]);
        toast.error("Failed to get AI response");
      } finally {
        setIsLoading(false);
        scrollToBottom();
      }
    },
    [isLoading, messages, scrollToBottom]
  );

  useEffect(() => {
    if (initialQuery && !hasProcessedInitialQuery.current) {
      hasProcessedInitialQuery.current = true;
      window.history.replaceState({}, document.title);
      sendMessage(initialQuery);
    }
  }, [initialQuery, sendMessage]);

  useEffect(() => {
    if (!initialQuery) {
      inputRef.current?.focus();
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleTextareaInput = () => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
  };

  const handleClearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    toast.success("Chat cleared");
  };

  const handleExportChat = () => {
    const text = messages
      .map((m) => `${m.role === "user" ? "You" : "Fitrobit AI"}: ${m.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fitrobit-ai-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exported");
  };

  const isOnlyWelcome = messages.length === 1 && messages[0] === WELCOME_MESSAGE;

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  return (
    <div className="relative flex flex-col h-[calc(100vh-theme(spacing.14))] sm:h-[calc(100vh-theme(spacing.16))] bg-background overflow-hidden">
      {/* Fixed header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-2 border-b border-border/30 bg-background shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              Fitrobit AI
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handleExportChat} className="h-8 w-8 text-muted-foreground hover:text-foreground" title="Export">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleClearChat} className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Clear">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable messages area */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={cn("flex gap-3 animate-fade-in", msg.role === "user" ? "justify-end" : "justify-start")}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              <div className="group flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]">
                <div
                  className={cn(
                    "text-[13px] sm:text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5"
                      : "text-foreground"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ul]:space-y-1 [&>p:last-child]:mb-0 [&>ul:last-child]:mb-0 [&_li]:text-[13px] sm:[&_li]:text-sm [&_strong]:text-foreground">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === "assistant" && msg !== WELCOME_MESSAGE && (
                  <div className="flex items-center ml-0.5">
                    <CopyButton text={msg.content} />
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1 text-[10px] font-bold text-muted-foreground overflow-hidden">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-contain p-0.5" />
                  ) : (
                    currentUser.initials
                  )}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex items-center gap-1 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {isOnlyWelcome && !isLoading && (
            <div className="pt-2 animate-fade-in">
              <p className="text-xs text-muted-foreground mb-2 ml-10">Try asking:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-10">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left text-xs sm:text-[13px] px-3 py-2.5 rounded-xl border border-border/40 hover:border-primary/30 hover:bg-accent/40 text-foreground transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Invisible anchor for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Scroll to bottom FAB */}
      {showScrollDown && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-accent transition-colors z-20"
        >
          <ArrowDown className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      {/* Fixed bottom input */}
      <div className="sticky bottom-0 z-20 shrink-0 border-t border-border/30 bg-background px-4 sm:px-6 py-3">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex items-end gap-2">
          <div className="flex-1 relative rounded-xl border border-border/50 bg-muted/30 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all overflow-hidden">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); handleTextareaInput(); }}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              disabled={isLoading}
              rows={1}
              className="w-full px-4 py-2.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50 resize-none min-h-[40px] max-h-[120px]"
            />
          </div>
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            size="icon"
            className="rounded-xl h-10 w-10 shrink-0 disabled:opacity-40"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground/40 text-center mt-1.5">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}