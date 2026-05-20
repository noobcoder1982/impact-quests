import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AiChat01Icon as Bot,
  FlashIcon as Zap,
  SparklesIcon as Sparkles,
  UserIcon as User,
  Copy01Icon as Copy,
} from "hugeicons-react";
import {
  Plus,
  Menu,
  Search,
  Paperclip,
  Check,
  Edit2,
  RefreshCw,
  X,
  ArrowUp,
  ChevronDown,
  Trash2,
  MessageSquare,
  Settings,
} from "lucide-react";
import { apiRequest } from "../lib/api";
import { cn } from "@/lib/utils";

// --- Types ---
export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: number;
  mode: string;
  messages: Message[];
}

export interface ChatMode {
  id: string;
  name: string;
  description: string;
  icon: any;
  gradient: string;
  color: string;
}

// --- Constants ---
const CHAT_MODES: ChatMode[] = [
  {
    id: "balanced",
    name: "Balanced",
    description: "General volunteer & task assistance",
    icon: Bot,
    gradient: "from-blue-500 to-cyan-500",
    color: "text-blue-500",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Quest brainstorming & creative writing",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
    color: "text-purple-500",
  },
  {
    id: "precise",
    name: "Precise",
    description: "Skill matching & impact analytics",
    icon: Zap,
    gradient: "from-emerald-500 to-teal-500",
    color: "text-emerald-500",
  },
];

const SUGGESTED_PROMPTS = [
  { icon: "💡", text: "Brainstorm 5 engaging gamification quests for youth volunteers", mode: "creative" },
  { icon: "📝", text: "Draft a welcome message for new community cleanup volunteers", mode: "balanced" },
  { icon: "🤝", text: "Match software engineering volunteers to a food security dashboard", mode: "precise" },
  { icon: "🌱", text: "Write a short proposal for a local park restoration initiative", mode: "balanced" },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

// --- Subcomponents ---

const MarkdownContent = React.memo(({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => <h1 className="text-base font-bold mt-4 mb-2 text-white" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-sm font-semibold mt-3 mb-2 text-white" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-xs font-semibold mt-2 mb-1 text-white" {...props} />,
        p: ({ node, ...props }) => <p className="mb-2 text-zinc-300 leading-relaxed text-[13px]" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 space-y-1 text-zinc-300 text-[13px]" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-zinc-300 text-[13px]" {...props} />,
        li: ({ node, ...props }) => <li className="ml-1" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
        em: ({ node, ...props }) => <em className="italic" {...props} />,
        code: ({ node, inline, ...props }: any) =>
          inline ? (
            <code className="bg-zinc-800/80 px-1.5 py-0.5 rounded text-[11px] font-mono text-purple-300" {...props} />
          ) : (
            <div className="relative group my-3">
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1 bg-zinc-800 rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                  onClick={() => navigator.clipboard.writeText(String(props.children).replace(/\n$/, ""))}
                  title="Copy code"
                >
                  <Copy size={12} />
                </button>
              </div>
              <code className="block bg-zinc-950/80 p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto border border-zinc-900 text-zinc-350 shadow-inner" {...props} />
            </div>
          ),
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-2 border-purple-500/50 pl-3 italic my-2.5 text-zinc-400 bg-purple-950/10 py-1.5 rounded-r-lg text-[13px]" {...props} />
        ),
        a: ({ node, ...props }) => <a className="text-indigo-400 hover:text-indigo-300 underline decoration-indigo-400/30 underline-offset-2 transition-colors" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

MarkdownContent.displayName = "MarkdownContent";

const ChatMessageItem = React.memo(({
  message,
  mode,
  onCopy,
  onEdit,
  onRegenerate,
  isLast,
}: {
  message: Message;
  mode: ChatMode;
  onCopy: (msg: string) => void;
  onEdit?: (msg: Message) => void;
  onRegenerate?: () => void;
  isLast?: boolean;
}) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(message.content);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleCopy = React.useCallback(() => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content, onCopy]);

  const handleSaveEdit = React.useCallback(() => {
    if (editValue.trim() && editValue !== message.content && onEdit) {
      onEdit({ ...message, content: editValue });
    }
    setIsEditing(false);
  }, [editValue, message, onEdit]);

  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.focus();
    }
  }, [isEditing]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3 md:gap-4 w-full group", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center border transition-all duration-300 shadow-md select-none",
        isUser
          ? "bg-zinc-900 border-zinc-800 text-zinc-400"
          : "bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 border-transparent text-white"
      )}>
        {isUser ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
      </div>

      {/* Message Content */}
      <div className={cn("flex flex-col gap-1 max-w-[85%] md:max-w-[75%]", isUser ? "items-end" : "items-start")}>
        <div className={cn(
          "relative px-4 py-3.5 rounded-2xl border text-sm transition-all duration-300",
          isUser
            ? "bg-zinc-900/50 border-zinc-900 text-zinc-100 rounded-tr-sm"
            : "gemini-gradient-bg gemini-gradient-border border-transparent text-zinc-150 rounded-tl-sm shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
        )}>
          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[240px] md:min-w-[400px]">
              <textarea
                ref={textareaRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-3 text-sm text-white outline-none resize-none min-h-[80px]"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className="px-2.5 py-1 text-xs font-mono bg-zinc-900 hover:bg-zinc-850 rounded-lg text-zinc-400 hover:text-white transition-colors border border-zinc-900">Cancel</button>
                <button onClick={handleSaveEdit} className="px-2.5 py-1 text-xs font-mono bg-indigo-650 hover:bg-indigo-600 rounded-lg text-white transition-colors">Save & Resend</button>
              </div>
            </div>
          ) : (
            isUser ? (
              <div className="whitespace-pre-wrap leading-relaxed text-[13px]">{message.content}</div>
            ) : (
              <MarkdownContent content={message.content} />
            )
          )}
        </div>

        {/* Actions (visible on hover) */}
        {!isEditing && (
          <div className={cn("flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1 select-none", isUser ? "flex-row-reverse" : "flex-row")}>
            <button onClick={handleCopy} className="p-1 text-zinc-550 hover:text-zinc-300 hover:bg-zinc-900 rounded transition-colors" title="Copy">
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
            {isUser && onEdit && (
              <button onClick={() => setIsEditing(true)} className="p-1 text-zinc-550 hover:text-zinc-300 hover:bg-zinc-900 rounded transition-colors" title="Edit">
                <Edit2 size={12} />
              </button>
            )}
            {!isUser && isLast && onRegenerate && (
              <button onClick={onRegenerate} className="p-1 text-zinc-550 hover:text-zinc-300 hover:bg-zinc-900 rounded transition-colors" title="Regenerate">
                <RefreshCw size={12} />
              </button>
            )}
            <span className="text-[9px] font-mono text-zinc-600 px-2">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
});

ChatMessageItem.displayName = "ChatMessageItem";


// --- Main Component ---
export default function AIChatPage() {
  // State
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = React.useState<string | null>(null);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showModeMenu, setShowModeMenu] = React.useState(false);
  const [currentModeId, setCurrentModeId] = React.useState<string>("balanced");
  const [isTyping, setIsTyping] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Derived
  const activeSession = React.useMemo(() => sessions.find(s => s.id === activeSessionId) || null, [sessions, activeSessionId]);
  const currentMode = React.useMemo(() => CHAT_MODES.find(m => m.id === (activeSession?.mode || currentModeId)) || CHAT_MODES[0], [activeSession, currentModeId]);
  const filteredSessions = React.useMemo(() => sessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => b.updatedAt - a.updatedAt), [sessions, searchQuery]);

  // Load from local storage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("ai_chat_sessions");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) setActiveSessionId(parsed[0].id);
      }
    } catch (e) {
      console.error("Failed to load sessions", e);
    }
  }, []);

  // Save to local storage (debounced)
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (sessions.length > 0) {
        localStorage.setItem("ai_chat_sessions", JSON.stringify(sessions));
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [sessions]);

  // Scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isTyping]);

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const createNewSession = (modeId = "balanced") => {
    setCurrentModeId(modeId);
    setActiveSessionId(null);
    setInput("");
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const updateSession = React.useCallback((sessionId: string, updates: Partial<ChatSession>) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updates, updatedAt: Date.now() } : s));
  }, []);

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
  };

  const handleSend = React.useCallback(async (overrideInput?: string, overrideSessionId?: string, overrideMessages?: Message[]) => {
    const textToSend = overrideInput !== undefined ? overrideInput : input;
    if (!textToSend.trim() || isLoading) return;

    let sessionId = overrideSessionId || activeSessionId;

    if (!sessionId) {
      sessionId = generateId();
      const newSession: ChatSession = {
        id: sessionId,
        title: textToSend.length > 30 ? textToSend.substring(0, 30) + "..." : textToSend,
        updatedAt: Date.now(),
        mode: currentModeId,
        messages: []
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(sessionId);
    }

    const userMsg: Message = { id: generateId(), role: "user", content: textToSend, timestamp: Date.now() };
    
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          messages: overrideMessages ? [...overrideMessages, userMsg] : [...s.messages, userMsg],
          updatedAt: Date.now()
        };
      }
      return s;
    }));

    if (overrideInput === undefined) setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const currentSession = sessions.find(s => s.id === sessionId);
      const history = overrideMessages || (currentSession?.messages || []);

      const res = await apiRequest("/ai/chat", {
        method: "POST",
        body: {
          message: textToSend,
          context: {
            mode: currentSession?.mode || currentModeId,
            conversationHistory: history.slice(-6),
            source: "ai-console"
          }
        }
      });

      setIsTyping(false);

      if (res.success) {
        const assistantMsg: Message = {
          id: generateId(),
          role: "assistant",
          content: res.data.content,
          timestamp: Date.now()
        };
        updateSession(sessionId, {
          messages: overrideMessages 
            ? [...overrideMessages, userMsg, assistantMsg] 
            : [...(currentSession?.messages || []), userMsg, assistantMsg]
        });
      } else {
        throw new Error(res.error || "Failed to get response");
      }
    } catch (err: any) {
      console.error("AI Chat Error:", err);
      setIsTyping(false);
      const errorMsg: Message = {
        id: generateId(),
        role: "assistant",
        content: `**Connection Error:** ${err.message || "Failed to reach AI services. Please try again."}`,
        timestamp: Date.now()
      };
      const session = sessions.find(s => s.id === sessionId);
      updateSession(sessionId, {
        messages: [...(session?.messages || []), userMsg, errorMsg]
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, activeSessionId, sessions, currentModeId, updateSession]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEditMessage = React.useCallback((editedMsg: Message) => {
    if (!activeSession) return;
    const msgIndex = activeSession.messages.findIndex(m => m.id === editedMsg.id);
    if (msgIndex === -1) return;

    const newHistory = activeSession.messages.slice(0, msgIndex);
    handleSend(editedMsg.content, activeSession.id, newHistory);
  }, [activeSession, handleSend]);

  const handleRegenerate = React.useCallback(() => {
    if (!activeSession || activeSession.messages.length < 2) return;
    const messages = activeSession.messages;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;

    const userMsgIndex = messages.lastIndexOf(lastUserMsg);
    const newHistory = messages.slice(0, userMsgIndex);
    
    handleSend(lastUserMsg.content, activeSession.id, newHistory);
  }, [activeSession, handleSend]);

  return (
    <div className="flex h-[100dvh] w-full bg-zinc-950 text-zinc-100 overflow-hidden font-sans relative">
      
      {/* Structural Blueprint Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '2.5rem 2.5rem',
        }}
      />

      {/* --- Sidebar --- */}
      <AnimatePresence>
        {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed md:relative z-40 flex flex-col w-[280px] h-full bg-zinc-950 border-r border-zinc-900/80 shadow-2xl md:shadow-none",
              !isSidebarOpen && "hidden md:flex"
            )}
          >
            <div className="p-4 flex flex-col gap-4 border-b border-zinc-900/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold tracking-widest text-zinc-400 font-mono flex items-center gap-2 uppercase select-none">
                  <Bot size={14} className="text-purple-400 animate-slow-pulse" /> AI Mission Copilot
                </h2>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <button
                onClick={() => createNewSession(currentModeId)}
                className="flex items-center justify-center gap-2 w-full bg-zinc-900 hover:bg-zinc-850 hover:text-white border border-zinc-800 text-zinc-300 rounded-xl py-2 px-4 font-mono text-[10px] uppercase tracking-widest transition-all active:scale-[0.98]"
              >
                <Plus size={12} /> New Session
              </button>

              <div className="relative">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-650" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/30 border border-zinc-900/80 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder:text-zinc-650 outline-none focus:border-zinc-800/85 focus:bg-zinc-900/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 custom-scrollbar">
              {filteredSessions.length === 0 ? (
                <div className="text-center px-4 py-8 text-xs font-mono text-zinc-650 uppercase">No sessions found</div>
              ) : (
                filteredSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => { setActiveSessionId(session.id); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group border",
                      activeSessionId === session.id
                        ? "bg-zinc-900/60 border-zinc-800 text-white shadow-sm"
                        : "text-zinc-500 border-transparent hover:bg-zinc-900/25 hover:text-zinc-300"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare size={13} className={cn("shrink-0", activeSessionId === session.id ? "text-purple-400" : "text-zinc-700")} />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-semibold truncate leading-normal">{session.title}</span>
                        <span className="text-[9px] font-mono text-zinc-600 uppercase mt-0.5">{new Date(session.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 rounded transition-all shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/70 z-30 backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      {/* --- Main Chat Area --- */}
      <div className="flex-1 flex flex-col relative z-10 w-full min-w-0 h-[100dvh]">
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-zinc-950/40 backdrop-blur-xl border-b border-zinc-900/80 z-20 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900/40 transition-colors md:hidden"
            >
              <Menu size={20} />
            </button>

            {/* Mode Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowModeMenu(!showModeMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/40 border border-zinc-900/80 hover:bg-zinc-900/80 transition-colors group"
              >
                <div className={cn("w-2 h-2 rounded-full bg-gradient-to-r", currentMode.gradient)} />
                <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-300">{currentMode.name} Mode</span>
                <ChevronDown size={12} className="text-zinc-550 group-hover:text-zinc-350" />
              </button>

              <AnimatePresence>
                {showModeMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-50 p-2"
                  >
                    {CHAT_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          if (activeSession) {
                            updateSession(activeSession.id, { mode: mode.id });
                          } else {
                            setCurrentModeId(mode.id);
                          }
                          setShowModeMenu(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors border",
                          (activeSession?.mode || currentModeId) === mode.id ? "bg-zinc-900/60 border-zinc-800 text-white" : "border-transparent hover:bg-zinc-900/40"
                        )}
                      >
                        <div className={cn("p-2 rounded-lg bg-gradient-to-br bg-opacity-20", mode.gradient)}>
                          <mode.icon size={14} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-wider leading-tight">{mode.name}</p>
                          <p className="text-[9px] text-zinc-500 leading-tight mt-1">{mode.description}</p>
                        </div>
                        {(activeSession?.mode || currentModeId) === mode.id && (
                          <Check size={12} className="ml-auto text-purple-400" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Fine monospaced stamp */}
            <span className="hidden sm:inline font-mono text-[9px] text-zinc-650 uppercase tracking-widest">
              ImpactQuest // Copilot Online
            </span>
          </div>
          
          <button className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900/40 transition-colors">
            <Settings size={18} />
          </button>
        </header>

        {/* Messages List / Empty State */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative px-4 md:px-8">
          <div className="max-w-3xl mx-auto w-full pb-[10rem] md:pb-32 pt-8 flex flex-col min-h-full">
            
            {(!activeSession || activeSession.messages.length === 0) ? (
              // Empty State (Refactored Bento Layout)
              <div className="m-auto flex flex-col items-center justify-center w-full max-w-xl py-8">
                
                {/* AI Core Shimmer Hologram */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  className="mb-8 relative"
                >
                  <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-blue-500/20 blur-2xl opacity-60 rounded-full animate-slow-pulse" />
                  <div className="relative h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl">
                    <currentMode.icon size={28} className="text-indigo-400 animate-slow-pulse" />
                  </div>
                </motion.div>
                
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white text-center mb-2 uppercase select-none font-sans">
                  How can I support your mission?
                </h1>
                <p className="text-zinc-550 text-center text-[11px] font-medium leading-relaxed mb-8 max-w-sm">
                  Your AI assistant for volunteer matching, quest creation, and community coordination.
                </p>

                {/* 2x2 Bento Grid suggested prompts */}
                <div className="grid grid-cols-2 gap-3 w-full mt-4">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, ease: "easeOut" }}
                      onClick={() => {
                        if (currentModeId !== prompt.mode && !activeSession) {
                          setCurrentModeId(prompt.mode);
                        }
                        handleSend(prompt.text);
                      }}
                      className="col-span-2 sm:col-span-1 relative flex flex-col justify-between p-4 bg-zinc-950 border border-zinc-900/80 hover:border-zinc-800 hover:bg-zinc-900/20 rounded-2xl transition-all duration-300 text-left cursor-pointer overflow-hidden min-h-[96px] group"
                    >
                      {/* Top label / Monospace index */}
                      <div className="w-full flex items-center justify-between font-mono text-[9px] text-zinc-550 select-none">
                        <span>[ 0{i + 1} ]</span>
                        <span className="uppercase tracking-widest">{prompt.mode} Mode</span>
                      </div>
                      
                      {/* Text */}
                      <span className="text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors duration-300 mt-2 pr-4 leading-normal">
                        {prompt.text}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              // Chat Messages
              <div className="space-y-6 flex flex-col w-full">
                {activeSession.messages.map((msg, index) => (
                  <ChatMessageItem
                     key={msg.id}
                     message={msg}
                     mode={currentMode}
                     onCopy={(text) => navigator.clipboard.writeText(text)}
                     onEdit={handleEditMessage}
                     onRegenerate={handleRegenerate}
                     isLast={index === activeSession.messages.length - 1}
                  />
                ))}

                {/* Loading / Typing Indicator */}
                {(isLoading || isTyping) && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 md:gap-4 w-full">
                    <div className="flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center border border-zinc-850 bg-zinc-900 text-zinc-450">
                      <currentMode.icon className="h-4.5 w-4.5 animate-slow-pulse" />
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-900 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] md:max-w-[75%] flex items-center gap-1.5 h-[48px]">
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0 }} className="h-1.5 w-1.5 bg-zinc-650 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }} className="h-1.5 w-1.5 bg-zinc-650 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }} className="h-1.5 w-1.5 bg-zinc-650 rounded-full" />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent pt-10 pb-[6.5rem] md:pb-8 px-4 z-20">
          <div className="max-w-3xl mx-auto w-full relative">
            <div className="relative flex items-end gap-2 p-2 bg-zinc-900/40 backdrop-blur-2xl border border-zinc-900 rounded-2xl shadow-2xl">
              
              {/* Attachment Button */}
              <button className="p-3 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors shrink-0 mb-0.5">
                <Paperclip size={18} />
              </button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Instruct ${currentMode.name}...`}
                disabled={isLoading}
                className="flex-1 max-h-[160px] min-h-[40px] bg-transparent border-none resize-none outline-none py-2.5 text-sm text-white placeholder:text-zinc-600 disabled:opacity-50 custom-scrollbar leading-relaxed"
                rows={1}
              />

              {/* Send Button */}
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-2.5 rounded-xl flex items-center justify-center transition-all shrink-0 mb-0.5",
                  input.trim() && !isLoading
                    ? "bg-purple-650 text-white shadow-lg hover:scale-105 active:scale-95"
                    : "bg-zinc-900 border border-zinc-850 text-zinc-600"
                )}
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            </div>
            <div className="text-center mt-3 select-none">
              <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">AI can make mistakes. Verify critical mission and impact details.</p>
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f1f23; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2d2d30; }
      `}} />
    </div>
  );
}
