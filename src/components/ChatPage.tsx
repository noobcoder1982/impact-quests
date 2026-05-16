import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search01Icon as Search, 
  SentIcon as Send, 
  AttachmentIcon as Paperclip, 
  More02Icon as MoreVertical, 
  Tag01Icon as Hash, 
  UserGroupIcon as Users, 
  Shield01Icon as ShieldCheck,
  FlashIcon as Zap,
  CallIcon as Phone,
  Video01Icon as Video,
  InformationCircleIcon as Info,
  CrownIcon as Crown,
  FavouriteIcon as Heart,
  GlobeIcon as Globe,
  Settings01Icon as Settings,
  CircleIcon as Circle,
  Add01Icon as Plus,
  DocumentCodeIcon as FileText,
  Cancel01Icon as X,
  Mic01Icon as Mic,
  Video01Icon as VideoIcon,
  CallIcon as PhoneOff,
  Maximize01Icon as Maximize2,
  VolumeHighIcon as Volume2,
  Delete01Icon as Trash2,
  Download01Icon as Download,
  CheckmarkCircle01Icon as CheckCircle2,
  UserCheck01Icon as UserCheck,
  AiChat01Icon as Bot
} from "hugeicons-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

// --- Custom Markdown Parser ---
const Markdown = ({ content, className }: { content: string, className?: string }) => {
  const parts = content.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i} className="bg-secondary px-1.5 py-0.5 rounded-md font-mono text-sm">{part.slice(1, -1)}</code>;
        }
        return part;
      })}
    </span>
  );
};

const initialChannels = [
  { id: '1', name: "global-outreach", type: "global", active: true, desc: "Primary coordination node for active volunteering missions." },
  { id: '2', name: "announcements", type: "system", active: false, desc: "System-wide broadcasts and mission alerts." },
  { id: '3', name: "emergency-response", type: "system", active: false, urgent: true, desc: "Critical crisis management channel." }
]

const initialMessages = [
  { user: "System", role: "ImpactQuest", content: "Welcome to ImpactQuest Secure Comms. Type `**bold**`, `*italic*`, or `` `code` `` to test Markdown support.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), avatar: "IQ", isSystem: true }
]

export default function ChatPage() {
  const [channels, setChannels] = React.useState(initialChannels)
  const [messages, setMessages] = React.useState(initialMessages)
  const [activeChannel, setActiveChannel] = React.useState(initialChannels[0])
  const [input, setInput] = React.useState("")
  const [user, setUser] = React.useState<any>(null)
  const navigate = useNavigate()
  
  // States
  const [showNewChannel, setShowNewChannel] = React.useState(false)
  const [newChannelName, setNewChannelName] = React.useState("")
  const [activeCall, setActiveCall] = React.useState<'voice' | 'video' | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [uploadedFiles, setUploadedFiles] = React.useState<any[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(JSON.parse(storedUser))
  }, [])

  const [isTyping, setIsTyping] = React.useState(false)
  
  const handleSend = async () => {
    if (!input.trim()) return;

    const isVolunteer = user?.role === 'volunteer';

    const userMessage = {
      user: user?.name || "Member",
      role: user?.role === 'ngo' ? 'Organizer' : (user?.role === 'customer' ? 'Customer' : 'Volunteer'),
      content: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: user?.name || "Default",
      status: "online"
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input; // Capture input before clearing
    setInput("")

    // ── AI Observer Logic (For Volunteers) ─────────────────
    const taskKeywords = ['work', 'task', 'help with', 'do this', 'volunteer for', 'organize', 'possible work'];
    const mentionsWork = taskKeywords.some(kw => currentInput.toLowerCase().includes(kw));

    if (isVolunteer && mentionsWork) {
      setIsTyping(true);
      setTimeout(() => {
        const aiProposal = {
          user: "ImpactQuest AI",
          role: "Intelligence Coordinator",
          content: `I noticed you mentioned a potential task: "${currentInput}". Would you like me to register this as a new **Team Task** for your squad?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: "AI",
          isAI: true,
          status: "online",
          showActions: true // UI will show "Add Task" button
        };
        setMessages(prev => [...prev, aiProposal]);
        setIsTyping(false);
      }, 1500);
      return;
    }

    setIsTyping(true)

    try {
      const res = await apiRequest('/ai/chat', {
        method: 'POST',
        body: { 
          message: currentInput,
          context: {
            channel: activeChannel.name,
            channel_type: activeChannel.type,
            user_role: user?.role
          }
        }
      })

      if (res.success) {
        const aiMessage = {
          user: "ImpactQuest AI",
          role: "Intelligence Coordinator",
          content: res.data.content,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: "AI",
          isAI: true,
          status: "online"
        }
        setMessages(prev => [...prev, aiMessage])
      }
    } catch (err) {
      console.error("AI Chat failed", err)
    } finally {
      setIsTyping(false)
    }
  }

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) return
    const newChannel = { 
      id: Date.now().toString(), 
      name: newChannelName.toLowerCase().replace(/\s+/g, '-'), 
      type: "group", 
      active: false,
      desc: "New mission squad channel."
    }
    setChannels(prev => [...prev, newChannel])
    setNewChannelName("")
    setShowNewChannel(false)
  }

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isImage = file.type.startsWith('image/')
    const localPreview = isImage ? URL.createObjectURL(file) : undefined
    
    // 1. Create temporary system message with local preview
    const tempId = Date.now().toString()
    const sysMsg = {
      id: tempId,
      user: user?.name || "Member",
      role: user?.role === 'ngo' ? 'Organizer' : 'Volunteer',
      content: `Synchronizing Intel: **${file.name}**...`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: user?.name || "Member",
      isImage: isImage,
      preview: localPreview,
      isUploading: true
    }
    setMessages(prev => [...prev, sysMsg])

    try {
      let finalUrl = localPreview
      
      // 2. If it's an image, push to Cloudinary
      if (isImage) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default')
        
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        )
        const data = await response.json()
        if (data.secure_url) {
          finalUrl = data.secure_url
        }
      }

      // 3. Update message and file log with permanent URL
      setMessages(prev => prev.map(m => m.id === tempId ? { 
        ...m, 
        content: `Attached Intel: **${file.name}**`, 
        preview: finalUrl, 
        isUploading: false 
      } : m))

      const newFile = {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: file.type,
        preview: finalUrl,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setUploadedFiles(prev => [newFile, ...prev])

    } catch (err) {
      console.error("Cloudinary Upload Failed", err)
      setMessages(prev => prev.map(m => m.id === tempId ? { 
        ...m, 
        content: `❌ Upload Failed: **${file.name}**`, 
        isUploading: false 
      } : m))
    }
  }

  const filteredChannels = channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredMessages = messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="h-full bg-background flex overflow-hidden font-body selection:bg-indigo-500/10 relative">
      
      {/* HIDDEN FILE INPUT — outside desktop gate so mobile can use it too */}
      <input type="file" ref={fileInputRef} className="hidden" onChange={onFileUpload} accept="image/*,.pdf,.doc,.docx,.txt" />

      {/* 2. CHANNEL CREATION MODAL */}
      <AnimatePresence>
        {showNewChannel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-card border border-border rounded-[2.5rem] p-10 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black tracking-tight">Create Group Chat</h3>
                <button onClick={() => setShowNewChannel(false)} className="h-10 w-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4 italic">Group Identity</label>
                  <input 
                    autoFocus
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="Enter group name..."
                    className="w-full bg-secondary/30 border border-border/60 rounded-3xl py-4 px-6 text-lg font-bold outline-none focus:border-indigo-600 transition-all"
                  />
                </div>
                <Button 
                  onClick={handleCreateChannel}
                  className="w-full h-16 rounded-3xl bg-indigo-600 text-white font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl shadow-indigo-600/20"
                >
                  Create Group
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. LIVE CALL INTERFACE */}
      <AnimatePresence>
        {activeCall && (
          <motion.div 
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-x-6 top-6 z-[100] h-[calc(100%-48px)] bg-indigo-950/95 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-3xl flex flex-col items-center justify-between p-12 overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.5),transparent)]" />
            <header className="w-full flex justify-between items-center relative z-10">
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-2 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Secure Connection Established</span>
              </div>
              <span className="text-white font-mono text-sm">00:12</span>
            </header>

            <div className="flex flex-col items-center gap-12 relative z-10">
               <div className="space-y-2 text-center">
                  <h4 className="text-6xl font-black text-white tracking-tighter lowercase italic">#{activeChannel.name}</h4>
                  <p className="text-indigo-400 font-black uppercase tracking-[0.4em] text-xs">Synchronizing {activeCall} Feed...</p>
               </div>
               <div className="flex items-center gap-4">
                  {[1,2,3].map(i => <motion.div key={i} animate={{ opacity: [0.1, 0.5, 0.1] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }} className="h-2 w-2 rounded-full bg-white" />)}
               </div>
            </div>

            <footer className="w-full flex items-center justify-center gap-8 relative z-10 pb-10">
              <button className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"><Mic className="h-8 w-8" /></button>
              <button onClick={() => setActiveCall(null)} className="h-28 w-28 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"><PhoneOff className="h-10 w-10" /></button>
              <button className="h-20 w-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"><Volume2 className="h-8 w-8" /></button>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      
      {/* ════════════════════════════════════════════════════════════════
          MOBILE CHAT  (md:hidden)
      ════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden absolute inset-0 flex flex-col bg-background z-10">

        {/* sticky header */}
        <div className="shrink-0 flex items-center justify-between px-5 pt-12 pb-4 border-b border-border/40 bg-background">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-400 font-black text-base uppercase">
              {activeChannel.name[0]}
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.35em] text-muted-foreground/40">Channel</p>
              <h2 className="text-sm font-black tracking-tight text-foreground">#{activeChannel.name}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCall('voice')}
              className="h-9 w-9 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground active:scale-90 transition-all"
            >
              <Phone className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowNewChannel(true)}
              className="h-9 w-9 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground active:scale-90 transition-all"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* channel pills */}
        <div className="shrink-0 flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide border-b border-border/30">
          {channels.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveChannel(c)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                activeChannel.id === c.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-secondary/40 text-muted-foreground border border-border/40"
              )}
            >#{c.name}</button>
          ))}
        </div>

        {/* messages — flex-1 scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-4 space-y-4">
          {(searchQuery ? filteredMessages : messages).map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className={cn(
                "flex gap-3",
                msg.isSystem || msg.isAI
                  ? "bg-indigo-600/5 border border-indigo-600/10 rounded-[1.5rem] p-4"
                  : ""
              )}
            >
              <div className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 font-black text-sm uppercase border",
                msg.isAI
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20"
                  : "bg-secondary border-border"
              )}>
                {msg.isAI ? <Bot size={16} /> : msg.user[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-foreground">{msg.user}</span>
                  {msg.isAI && (
                    <span className="bg-indigo-600 text-white text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase">AI</span>
                  )}
                  <span className="text-[9px] text-muted-foreground/30 ml-auto">{msg.time}</span>
                </div>
                <Markdown
                  content={msg.content}
                  className={cn(
                    "text-sm leading-relaxed",
                    msg.isSystem || msg.isAI ? "text-foreground font-medium italic" : "text-muted-foreground"
                  )}
                />
                {msg.preview && (
                  <div className={cn("mt-2 rounded-2xl overflow-hidden border border-border max-w-[200px] relative", msg.isUploading && "opacity-50 grayscale")}>
                    <img src={msg.preview} alt="attachment" className="w-full h-auto object-cover" />
                    {msg.isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                          <Zap className="h-5 w-5 text-white" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                )}
                {msg.showActions && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
                    <button
                      onClick={() => navigate('/mission-lab', { state: { autoFill: msg.content } })}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      <Plus className="h-3 w-3" /> Register Task
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 opacity-60">
              <div className="h-9 w-9 rounded-xl bg-indigo-600/20 border border-indigo-600/20 flex items-center justify-center text-indigo-400 font-black text-xs shrink-0">AI</div>
              <div className="flex items-center gap-1.5 py-2">
                {[0, 0.2, 0.4].map((d, i) => (
                  <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: d }} className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* input — pinned above pill nav */}
        <div className="shrink-0 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] bg-background border-t border-border/40">
          <div className="flex items-end gap-2 bg-card border border-border/50 rounded-[1.5rem] p-2 focus-within:border-indigo-600/40 transition-all">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-10 w-10 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground active:scale-90 transition-all shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <textarea
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder={`Message #${activeChannel.name}...`}
              className="flex-1 bg-transparent border-none outline-none py-2 text-sm resize-none max-h-28 min-h-[40px] font-medium leading-snug placeholder:text-muted-foreground/40"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 disabled:opacity-30 active:scale-90 transition-all shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. CHANNELS SIDEBAR */}
      <aside className="w-80 border-r border-border bg-card/30 flex flex-col shrink-0 hidden md:flex transition-colors duration-300">
         <div className="p-8 border-b border-border/50 bg-background/50">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold tracking-tight text-foreground">Communication</h2>
               <div 
                  onClick={() => setShowNewChannel(true)}
                  className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center cursor-pointer hover:bg-indigo-600/10 transition-all"
               >
                  <Plus className="h-4 w-4 text-muted-foreground" />
               </div>
            </div>
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-indigo-600 transition-colors" />
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search Intel..." 
                 className="w-full bg-secondary/40 border border-border/60 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-600/50 transition-all"
               />
            </div>
         </div>

         <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-8">
            <div>
               <span className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-4 block">Navigation Nodes</span>
               <div className="space-y-1.5">
                  {filteredChannels.map((c, i) => (
                    <div 
                      key={i} 
                      onClick={() => setActiveChannel(c)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all group",
                        activeChannel.id === c.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-secondary/60 text-muted-foreground hover:text-foreground'
                    )}>
                      <div className="flex items-center gap-3 font-bold truncate">
                        <Hash className="h-4 w-4 opacity-40 shrink-0" />
                        <span className="text-sm tracking-tight truncate">{c.name}</span>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </aside>

      {/* 5. MAIN COMMUNICATION AREA */}
      <main className="flex-1 flex flex-col bg-background relative h-full min-w-0">
         <header className="h-24 border-b border-border flex items-center justify-between px-10 bg-background/50 backdrop-blur-3xl z-10 shrink-0">
            <div className="flex items-center gap-5 min-w-0">
               <div className="h-14 w-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 border border-indigo-600/20 shrink-0">
                  <span className="text-xl font-black uppercase">{activeChannel.name[0]}</span>
               </div>
               <div className="min-w-0">
                  <h3 className="text-2xl font-bold tracking-tight text-foreground leading-none truncate">{activeChannel.name}</h3>
                  <p className="mt-2 text-[10px] font-black uppercase text-emerald-500 tracking-widest flex items-center gap-1.5">
                     <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Now
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <Button onClick={() => setActiveCall('voice')} variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-muted-foreground hover:bg-secondary hover:text-indigo-600 border border-transparent hover:border-border/50"><Phone className="h-5 w-5" /></Button>
               <Button onClick={() => setActiveCall('video')} variant="ghost" size="icon" className="h-11 w-11 rounded-2xl text-muted-foreground hover:bg-secondary hover:text-indigo-600 border border-transparent hover:border-border/50"><Video className="h-5 w-5" /></Button>
               <div className="h-8 w-[1px] bg-border/40 mx-2" />
               <Button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                variant="ghost" size="icon" className={cn("h-11 w-11 rounded-2xl border border-transparent hover:border-border/50 transition-all", isSidebarOpen ? "bg-indigo-600/10 text-indigo-600" : "text-muted-foreground hover:bg-secondary")}
               >
                 <Info className="h-5 w-5" />
               </Button>
            </div>
         </header>

         {/* Messages Feed */}
         <div className="flex-1 overflow-y-auto scrollbar-hide p-10 space-y-10">
            {(searchQuery ? filteredMessages : messages).map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn("flex gap-6 max-w-4xl", (msg.isSystem || msg.isAI) ? 'bg-indigo-600/[0.03] p-8 rounded-[2.5rem] border border-indigo-600/10 shadow-sm relative overflow-hidden' : '')}
                  >
                     <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center border shrink-0 font-black uppercase transition-all",
                        msg.isAI ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20" : "bg-secondary border-border"
                     )}>
                        {msg.isAI ? <Bot size={28} /> : msg.user[0]}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2.5">
                           <span className="text-base font-bold text-foreground flex items-center gap-2">
                              {msg.user}
                              {msg.isAI && (
                                 <span className="bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded-full tracking-widest font-black uppercase shadow-sm">AI</span>
                              )}
                           </span>
                           <span className="text-[9px] font-black uppercase bg-secondary/60 text-muted-foreground/60 px-2.5 py-1 rounded-full">{msg.role}</span>
                           <span className="text-[10px] font-bold text-muted-foreground/30 ml-auto uppercase tracking-widest">{msg.time}</span>
                        </div>
                        <div className="space-y-4">
                           <Markdown content={msg.content} className={cn("text-base leading-relaxed tracking-tight", (msg.isSystem || msg.isAI) ? 'text-foreground font-semibold italic' : 'text-muted-foreground font-medium')} />
                           
                           {msg.showActions && (
                              <motion.div 
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 className="pt-2"
                              >
                                 <Button 
                                    size="sm" 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest px-4 h-10 shadow-lg shadow-indigo-600/20"
                                    onClick={() => navigate('/mission-lab', { state: { autoFill: msg.content } })}
                                 >
                                    <Plus size={14} /> Register Team Task
                                 </Button>
                              </motion.div>
                           )}
                        </div>
                        
                        {msg.preview && (
                          <div className={cn(
                            "mt-4 rounded-2xl overflow-hidden border border-border shadow-sm max-w-sm relative group",
                            msg.isUploading ? "opacity-50 grayscale" : ""
                          )}>
                            <img src={msg.preview} alt="Attached Intel" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />
                            {msg.isUploading && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                  <Zap className="h-8 w-8 text-white fill-white" />
                                </motion.div>
                              </div>
                            )}
                          </div>
                        )}
                     </div>
                  </motion.div>
            ))}
             {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-6 max-w-4xl opacity-50"
                >
                   <div className="h-14 w-14 rounded-2xl bg-indigo-600/20 flex items-center justify-center border border-indigo-600/20 shrink-0 font-black uppercase text-indigo-600">
                      AI
                   </div>
                   <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="text-sm font-black uppercase tracking-widest text-indigo-600">Neural Synthesis</span>
                      <div className="flex gap-1">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }} className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                      </div>
                   </div>
                </motion.div>
             )}
          </div>

         {/* Input Block */}
         <div className="p-10 pt-0 shrink-0">
             <div className="bg-card border border-border rounded-3xl p-3 focus-within:ring-[8px] focus-within:ring-indigo-600/5 focus-within:border-indigo-600/30 transition-all duration-300 flex items-end gap-3 shadow-xl">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-12 w-12 rounded-2xl hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-indigo-600 transition-all"
                >
                   <Paperclip className="h-6 w-6" />
                </button>
                <textarea 
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder={`Send intel to #${activeChannel.name}...`}
                  className="flex-1 bg-transparent border-0 outline-none py-3 text-lg resize-none max-h-40 min-h-[48px] font-medium tracking-tight"
                />
                <button onClick={handleSend} className="h-12 px-8 rounded-2xl bg-indigo-600 text-white font-bold flex items-center gap-3 hover:scale-[1.02] transition-all">
                   Transmit <Send className="h-5 w-5" />
                </button>
             </div>
         </div>
      </main>

      {/* 6. INTELLIGENCE SIDEBAR (Group Management) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 384, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l border-border bg-card/10 flex flex-col shrink-0 transition-all duration-300 overflow-hidden"
          >
             <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="p-10 text-center border-b border-border/50 bg-background/50">
                   <div className="h-32 w-32 rounded-[2rem] bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center mx-auto mb-8 relative font-black text-4xl uppercase text-indigo-600">
                      {activeChannel.name[0]}
                      <button className="absolute -bottom-2 -right-2 h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg border-4 border-card"><Plus className="h-5 w-5" /></button>
                   </div>
                   <h4 className="text-2xl font-black mb-2 tracking-tight">#{activeChannel.name}</h4>
                   <p className="text-sm text-muted-foreground font-medium leading-relaxed px-4 italic">{activeChannel.desc}</p>
                </div>

                <div className="p-8 space-y-12">
                   {/* Personnel Section */}
                   <div className="space-y-6">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Personnel</span>
                        <Users className="h-4 w-4 text-muted-foreground/40" />
                      </div>
                      <div className="space-y-3">
                          <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-600/5 border border-indigo-600/10 group">
                             <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20"><Bot className="h-5 w-5" /></div>
                             <div className="flex-1">
                                <div className="text-xs font-bold flex items-center gap-2">
                                   ImpactQuest AI
                                   <span className="bg-indigo-600 text-white text-[7px] px-1.5 py-0.5 rounded-full tracking-tighter font-black uppercase">System</span>
                                </div>
                                <div className="text-[9px] font-black text-indigo-600 uppercase">Intelligence Admin</div>
                             </div>
                          </div>
                         <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary transition-all cursor-pointer">
                            <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center font-bold">V</div>
                            <div className="flex-1">
                               <div className="text-xs font-bold">{user?.name || "Member"}</div>
                               <div className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Admin Operator</div>
                            </div>
                            <UserCheck className="h-4 w-4 text-emerald-500" />
                         </div>
                      </div>
                   </div>

                   {/* Tactical Intel (Uploaded Files) */}
                   <div className="space-y-6">
                      <div className="flex justify-between items-center px-2">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">Tactical Intel</span>
                         <Plus className="h-4 w-4 text-muted-foreground/40 cursor-pointer" onClick={() => fileInputRef.current?.click()} />
                      </div>
                      <div className="space-y-3">
                         {uploadedFiles.length === 0 ? (
                           <div className="text-center py-10 px-6 border-2 border-dashed border-border rounded-3xl">
                             <FileText className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                             <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Intel Feed Empty</p>
                           </div>
                         ) : (
                           uploadedFiles.map((file, i) => (
                              <div key={i} className="flex flex-col gap-3 p-4 rounded-2xl bg-indigo-600/5 border border-indigo-600/10 group">
                                 <div className="flex items-center gap-4">
                                   {file.preview ? (
                                     <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-border">
                                       <img src={file.preview} className="h-full w-full object-cover" />
                                     </div>
                                   ) : (
                                     <FileText className="h-6 w-6 text-indigo-600 shrink-0" />
                                   )}
                                   <div className="flex-1 min-w-0">
                                      <div className="text-[11px] font-bold truncate">{file.name}</div>
                                      <div className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">{file.size} • {file.time}</div>
                                   </div>
                                   <Download className="h-4 w-4 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:text-indigo-600" />
                                 </div>
                                 {file.preview && (
                                   <div className="aspect-video w-full rounded-xl overflow-hidden border border-border/50">
                                      <img src={file.preview} className="w-full h-full object-cover" />
                                   </div>
                                 )}
                              </div>
                           ))
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
