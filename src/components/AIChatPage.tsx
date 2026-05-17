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
    description: "Helpful everyday assistant",
    icon: Bot,
    gradient: "from-blue-500 to-cyan-500",
    color: "text-blue-500",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Brainstorming & ideas",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
    color: "text-purple-500",
  },
  {
    id: "precise",
    name: "Precise",
    description: "Factual & analytical",
    icon: Zap,
    gradient: "from-emerald-500 to-teal-500",
    color: "text-emerald-500",
  },
];

const SUGGESTED_PROMPTS = [
  { icon: "💡", text: "Brainstorm marketing ideas for a new app", mode: "creative" },
  { icon: "📊", text: "Explain quantum computing in simple terms", mode: "balanced" },
  { icon: "💻", text: "Write a React hook for local storage", mode: "precise" },
  { icon: "📝", text: "Help me draft a professional email", mode: "balanced" },
];

const generateId = () => Math.random().toString(36).substring(2, 9);

// --- Subcomponents ---

const MarkdownContent = React.memo(({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2 text-white" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mt-3 mb-2 text-white" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-md font-semibold mt-2 mb-1 text-white" {...props} />,
        p: ({ node, ...props }) => <p className="mb-3 text-zinc-200 leading-relaxed" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 space-y-1 text-zinc-200" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-zinc-200" {...props} />,
        li: ({ node, ...props }) => <li className="ml-2" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
        em: ({ node, ...props }) => <em className="italic" {...props} />,
        code: ({ node, inline, ...props }: any) =>
          inline ? (
            <code className="bg-zinc-800/80 px-1.5 py-0.5 rounded-md text-[13px] font-mono text-blue-300" {...props} />
          ) : (
            <div className="relative group my-3">
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1.5 bg-zinc-800 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                  onClick={() => navigator.clipboard.writeText(String(props.children).replace(/\n$/, ""))}
                  title="Copy code"
                >
                  <Copy size={14} />
                </button>
              </div>
              <code className="block bg-zinc-900/80 p-4 rounded-xl text-[13px] font-mono overflow-x-auto border border-white/5 text-zinc-300 shadow-inner" {...props} />
            </div>
          ),
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-blue-500/50 pl-4 italic my-3 text-zinc-400 bg-blue-500/5 py-2 rounded-r-lg" {...props} />
        ),
        a: ({ node, ...props }) => <a className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 underline-offset-2 transition-colors" {...props} />,
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
        "flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center shadow-lg border",
        isUser
          ? "bg-gradient-to-br from-zinc-700 to-zinc-900 border-zinc-700"
          : `bg-gradient-to-br ${mode.gradient} border-white/10`
      )}>
        {isUser ? <User className="h-4 w-4 md:h-5 md:w-5 text-white" /> : <mode.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />}
      </div>

      {/* Message Content */}
      <div className={cn("flex flex-col gap-1 max-w-[85%] md:max-w-[75%]", isUser ? "items-end" : "items-start")}>
        <div className={cn(
          "relative px-5 py-4 rounded-3xl shadow-sm text-sm md:text-[15px]",
          isUser
            ? "bg-zinc-800 text-white rounded-tr-sm"
            : "bg-zinc-900 border border-white/5 text-zinc-100 rounded-tl-sm"
        )}>
          {isEditing ? (
            <div className="flex flex-col gap-3 min-w-[250px] md:min-w-[400px]">
              <textarea
                ref={textareaRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl p-3 text-white outline-none resize-none min-h-[100px]"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors">Cancel</button>
                <button onClick={handleSaveEdit} className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors">Save & Resend</button>
              </div>
            </div>
          ) : (
            isUser ? (
              <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
            ) : (
              <MarkdownContent content={message.content} />
            )
          )}
        </div>

        {/* Actions (visible on hover) */}
        {!isEditing && (
          <div className={cn("flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1", isUser ? "flex-row-reverse" : "flex-row")}>
            <button onClick={handleCopy} className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors" title="Copy">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            {isUser && onEdit && (
              <button onClick={() => setIsEditing(true)} className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors" title="Edit">
                <Edit2 size={14} />
              </button>
            )}
            {!isUser && isLast && onRegenerate && (
              <button onClick={onRegenerate} className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors" title="Regenerate">
                <RefreshCw size={14} />
              </button>
            )}
            <span className="text-[10px] text-zinc-600 px-2">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
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
  const [isTyping, setIsTyping] = React.useState(false); // To simulate streaming effect briefly

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
    let isNewSession = false;

    // Create session if none exists
    if (!sessionId) {
      sessionId = generateId();
      isNewSession = true;
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
    
    // Optimistic update
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
      // Request sent immediately

      // Get context
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
          timestamp: Date.now(),
          metadata: res.data.metadata
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

    // Truncate history up to the edited message (exclusive)
    const newHistory = activeSession.messages.slice(0, msgIndex);
    handleSend(editedMsg.content, activeSession.id, newHistory);
  }, [activeSession, handleSend]);

  const handleRegenerate = React.useCallback(() => {
    if (!activeSession || activeSession.messages.length < 2) return;
    // Remove last assistant message
    const messages = activeSession.messages;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;

    const userMsgIndex = messages.lastIndexOf(lastUserMsg);
    const newHistory = messages.slice(0, userMsgIndex);
    
    handleSend(lastUserMsg.content, activeSession.id, newHistory);
  }, [activeSession, handleSend]);


  // --- Render ---
  return (
    <div className="flex h-[100dvh] w-full bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      
      {/* Background Ambient Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
      </div>

      {/* --- Sidebar --- */}
      <AnimatePresence>
        {(isSidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed md:relative z-40 flex flex-col w-[280px] h-full bg-[#0f0f13] border-r border-white/5 shadow-2xl md:shadow-none",
              !isSidebarOpen && "hidden md:flex"
            )}
          >
            <div className="p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-wide text-zinc-100 flex items-center gap-2">
                  <Bot size={18} className="text-indigo-400" /> AI Assistant
                </h2>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <button
                onClick={() => createNewSession(currentModeId)}
                className="flex items-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 px-4 font-semibold text-sm transition-all active:scale-95 shadow-lg shadow-indigo-900/20"
              >
                <Plus size={16} /> New Chat
              </button>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1 custom-scrollbar">
              {filteredSessions.length === 0 ? (
                <div className="text-center px-4 py-8 text-xs text-zinc-500">No chats found.</div>
              ) : (
                filteredSessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => { setActiveSessionId(session.id); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group",
                      activeSessionId === session.id
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare size={14} className={cn("shrink-0", activeSessionId === session.id ? "text-indigo-400" : "text-zinc-600")} />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">{session.title}</span>
                        <span className="text-[10px] text-zinc-500">{new Date(session.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-red-400 rounded-md hover:bg-zinc-800 transition-all shrink-0"
                    >
                      <Trash2 size={14} />
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
            className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* --- Main Chat Area --- */}
      <div className="flex-1 flex flex-col relative z-10 w-full min-w-0 h-[100dvh]">
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors md:hidden"
            >
              <Menu size={20} />
            </button>

            {/* Mode Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowModeMenu(!showModeMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 hover:bg-zinc-800 transition-colors group"
              >
                <div className={cn("w-2 h-2 rounded-full bg-gradient-to-r", currentMode.gradient)} />
                <span className="text-sm font-semibold text-zinc-200">{currentMode.name}</span>
                <ChevronDown size={14} className="text-zinc-500 group-hover:text-zinc-300" />
              </button>

              <AnimatePresence>
                {showModeMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 p-2"
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
                          "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors",
                          (activeSession?.mode || currentModeId) === mode.id ? "bg-zinc-800" : "hover:bg-zinc-800/50"
                        )}
                      >
                        <div className={cn("p-2 rounded-lg bg-gradient-to-br bg-opacity-20", mode.gradient)}>
                          <mode.icon size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white leading-tight">{mode.name}</p>
                          <p className="text-xs text-zinc-500 leading-tight mt-0.5">{mode.description}</p>
                        </div>
                        {(activeSession?.mode || currentModeId) === mode.id && (
                          <Check size={14} className="ml-auto text-indigo-400" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <button className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <Settings size={20} />
          </button>
        </header>

        {/* Messages List / Empty State */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative px-4 md:px-8">
          <div className="max-w-3xl mx-auto w-full pb-[10rem] md:pb-32 pt-8 flex flex-col min-h-full">
            
            {(!activeSession || activeSession.messages.length === 0) ? (
              // Empty State
              <div className="m-auto flex flex-col items-center justify-center w-full max-w-2xl py-12">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="mb-8 relative"
                >
                  <div className={cn("absolute -inset-4 bg-gradient-to-br blur-2xl opacity-20 rounded-full", currentMode.gradient)} />
                  <div className="relative h-20 w-20 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl">
                    <currentMode.icon size={36} className="text-white" />
                  </div>
                </motion.div>
                
                <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 text-center mb-3">
                  How can I help you today?
                </h1>
                <p className="text-zinc-400 text-center text-sm mb-12">
                  Select a prompt below or type your own question to get started.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => {
                        if (currentModeId !== prompt.mode && !activeSession) {
                          setCurrentModeId(prompt.mode);
                        }
                        handleSend(prompt.text);
                      }}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-800 hover:border-white/10 transition-all text-left group"
                    >
                      <div className="p-2 rounded-xl bg-zinc-800 group-hover:scale-110 transition-transform">
                        <span className="text-xl leading-none">{prompt.icon}</span>
                      </div>
                      <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{prompt.text}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              // Chat Messages
              <div className="space-y-6 md:space-y-8 flex flex-col w-full">
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
                    <div className={cn("flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center shadow-lg border bg-gradient-to-br border-white/10", currentMode.gradient)}>
                      <currentMode.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div className="bg-zinc-900 border border-white/5 rounded-3xl rounded-tl-sm px-5 py-4 max-w-[85%] md:max-w-[75%] flex items-center gap-1.5 h-[52px]">
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="h-2 w-2 bg-zinc-500 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="h-2 w-2 bg-zinc-500 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="h-2 w-2 bg-zinc-500 rounded-full" />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/90 to-transparent pt-10 pb-[5.5rem] md:pb-8 px-4 z-20">
          <div className="max-w-3xl mx-auto w-full relative">
            <div className="relative flex items-end gap-2 p-2 bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl shadow-black">
              
              {/* Attachment Button */}
              <button className="p-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors shrink-0 mb-0.5">
                <Paperclip size={20} />
              </button>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${currentMode.name}...`}
                disabled={isLoading}
                className="flex-1 max-h-[200px] min-h-[44px] bg-transparent border-none resize-none outline-none py-3 text-[15px] text-white placeholder:text-zinc-500 disabled:opacity-50 custom-scrollbar leading-relaxed"
                rows={1}
              />

              {/* Send Button */}
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-3 rounded-full flex items-center justify-center transition-all shrink-0 mb-0.5",
                  input.trim() && !isLoading
                    ? cn("bg-gradient-to-br text-white shadow-lg hover:scale-105 active:scale-95", currentMode.gradient)
                    : "bg-zinc-800 text-zinc-500"
                )}
              >
                <ArrowUp size={20} strokeWidth={3} />
              </button>
            </div>
            <div className="text-center mt-3">
              <p className="text-[10px] text-zinc-600">AI models can make mistakes. Consider verifying important information.</p>
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #52525b; }
      `}} />
    </div>
  );
}
