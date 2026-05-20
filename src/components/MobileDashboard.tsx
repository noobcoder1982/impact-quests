import * as React from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import {
  AiChat01Icon as BotIcon,
  DashboardCircleIcon,
  FlashIcon as ZapIcon,
  Activity01Icon as ActivityIcon,
  SparklesIcon as SparklesIcon,
  ArrowRight01Icon as ArrowRightIcon,
  Add01Icon as PlusIcon,
  Notification01Icon as BellIcon,
  Calendar01Icon as CalendarIcon,
  ShoppingBasket01Icon as MarketIcon,
  PackageIcon as PackageIcon,
  Location01Icon as MapIcon,
  Comment01Icon as ChatIcon,
  CheckmarkCircle01Icon as CheckIcon,
} from "hugeicons-react"
import { cn } from "@/lib/utils"
import { apiRequest } from "../lib/api"

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, duration = 1.2 }: { to: number; duration?: number }) {
  const mv = useMotionValue(0)
  const rounded = useTransform(mv, (v) => Math.round(v).toLocaleString())
  const [display, setDisplay] = React.useState("0")
  React.useEffect(() => {
    const controls = animate(mv, to, { duration, ease: "easeOut" })
    const unsub = rounded.on("change", setDisplay)
    return () => { controls.stop(); unsub() }
  }, [to])
  return <span>{display}</span>
}

// ── Quick-action pill ─────────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, to, accent }: { icon: any; label: string; to: string; accent?: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-2.5 flex-1 group">
      <div className={cn(
        "h-12 w-12 rounded-full border flex items-center justify-center transition-all duration-300 active:scale-90",
        accent 
          ? "bg-orange-500/10 border-orange-500/30 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]" 
          : "bg-zinc-950/80 border-zinc-900 text-zinc-400 group-hover:text-white group-hover:border-zinc-800"
      )}>
        <Icon size={18} className="transition-transform duration-300 group-hover:scale-105" />
      </div>
      <span className="text-[8px] font-mono font-medium uppercase tracking-[0.16em] text-zinc-500 group-hover:text-zinc-300 transition-colors text-center leading-none">
        {label}
      </span>
    </Link>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className={cn(
      "rounded-2xl border p-4 flex flex-col justify-between gap-4 bg-zinc-950/60 backdrop-blur-md relative overflow-hidden transition-all duration-300",
      accent ? "border-orange-500/20" : "border-zinc-900/60"
    )}>
      {/* Subtle blueprint dot grid */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
           style={{
             backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
             backgroundSize: '8px 8px'
           }}
      />
      <div className="flex flex-col gap-1 relative z-10">
        <span className="text-[8px] font-mono font-medium uppercase tracking-[0.2em] text-zinc-500">
          {label}
        </span>
        <span className="text-3xl font-light tracking-tighter text-white">
          {value}
        </span>
      </div>
      {sub && (
        <div className="flex items-center gap-1.5 mt-1 relative z-10">
          <span className="h-1 w-1 rounded-full bg-orange-500" />
          <span className="text-[8px] font-mono font-medium uppercase tracking-wider text-zinc-400">
            {sub}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Mission create sheet ──────────────────────────────────────────────────────
function CreateMissionSheet({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = React.useState({ title: "", category: "General", description: "" })
  const [loading, setLoading] = React.useState(false)

  const submit = async () => {
    if (!form.title.trim()) return
    setLoading(true)
    try {
      const res = await apiRequest("/tasks", { method: "POST", body: { ...form, status: "Open", date: new Date() } })
      if (res.success) { onCreated(); onClose(); setForm({ title: "", category: "General", description: "" }) }
    } catch {}
    setLoading(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[140] bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed bottom-0 left-0 right-0 z-[150] bg-zinc-950 border-t border-zinc-900 rounded-t-[2.5rem] p-6 pb-12 space-y-6 text-white"
          >
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-2 opacity-50" />
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <div>
                <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-500">Task Allocation</p>
                <h3 className="text-xl font-medium tracking-tight text-white mt-0.5">Initialize Mission</h3>
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-full border border-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors text-sm font-light">×</button>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">Mission Name</span>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Clean Energy Audit Sector 4"
                  className="w-full h-12 bg-zinc-900/50 border border-zinc-900 rounded-xl px-4 text-xs font-light text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">Mission Category</span>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full h-12 bg-zinc-900/50 border border-zinc-900 rounded-xl px-4 text-xs font-light text-white focus:outline-none focus:border-orange-500/50 transition-colors appearance-none"
                  >
                    {["General","Emergency Response","Rescue Mission","Medical Camp","Food Drive","Shelter Support"].map(c => (
                      <option key={c} value={c} className="bg-zinc-950">{c}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-xs">▼</div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">Operational Log Details</span>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Provide precise coordinates, required resources, and tactical instructions..."
                  rows={3}
                  className="w-full bg-zinc-900/50 border border-zinc-900 rounded-xl px-4 py-3 text-xs font-light text-white focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                />
              </div>
            </div>

            <button
              onClick={submit}
              disabled={loading || !form.title.trim()}
              className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-900 text-white font-mono text-xs font-bold uppercase tracking-widest disabled:text-zinc-650 transition-all duration-300 active:scale-[0.98] shadow-[0_4px_20px_rgba(249,115,22,0.15)]"
            >
              {loading ? "Allocating Node..." : "Deploy Active Mission"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Swipeable Notification Card ──────────────────────────────────────────────
function SwipeableNotificationCard({ notification, onMarkRead, onDismiss, index }: { notification: any; onMarkRead: (id: number) => void; onDismiss: (id: number) => void; index: number }) {
  const x = useMotionValue(0)
  const dragTriggerThreshold = 90

  // Track swipe direction for final ejection animation
  const [swipedDir, setSwipedDir] = React.useState<'left' | 'right' | null>(null)

  const handleDragEnd = (_event: any, info: any) => {
    if (info.offset.x < -dragTriggerThreshold) {
      setSwipedDir('left')
      setTimeout(() => {
        onMarkRead(notification.id)
      }, 200)
    } else if (info.offset.x > dragTriggerThreshold) {
      setSwipedDir('right')
      setTimeout(() => {
        onDismiss(notification.id)
      }, 200)
    }
  }

  // Dynamic opacity overlays mapped to the drag offset
  const bgOpacityRight = useTransform(x, [-80, 0], [1, 0])
  const bgOpacityLeft = useTransform(x, [0, 80], [1, 0])

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 30, delay: index * 0.05 }}
      className="relative overflow-visible w-full shrink-0 select-none touch-pan-y"
    >
      {/* Underlying Actions Layer */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden bg-zinc-950/90 flex justify-between items-center pointer-events-none z-0 border border-zinc-900/60">
        {/* Swipe Right Underlay (Dismiss - Red Gradient) */}
        <motion.div
          style={{ opacity: bgOpacityLeft }}
          className="absolute inset-0 bg-gradient-to-r from-red-950/80 via-red-900/20 to-transparent flex items-center justify-start pl-5 gap-2 text-red-400 font-mono text-[8px] uppercase tracking-widest font-black"
        >
          <span>✕ Dismiss</span>
        </motion.div>

        {/* Swipe Left Underlay (Mark Read - Indigo Gradient) */}
        <motion.div
          style={{ opacity: bgOpacityRight }}
          className="absolute inset-0 bg-gradient-to-l from-indigo-950/80 via-indigo-900/20 to-transparent flex items-center justify-end pr-5 gap-2 text-indigo-400 font-mono text-[8px] uppercase tracking-widest font-black"
        >
          <span>Mark Read ✓</span>
        </motion.div>
      </div>

      {/* Main Draggable Notification Card */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.5, right: 0.5 }}
        style={{ x }}
        onDragEnd={handleDragEnd}
        animate={swipedDir === 'left' ? { x: -450, opacity: 0 } : swipedDir === 'right' ? { x: 450, opacity: 0 } : { x: 0, opacity: 1 }}
        transition={swipedDir ? { duration: 0.2, ease: "easeOut" } : { type: "spring", stiffness: 350, damping: 28 }}
        className={cn(
          "flex items-start gap-4 p-3.5 rounded-2xl border bg-zinc-950/80 transition-colors z-10 relative cursor-grab active:cursor-grabbing",
          notification.active 
            ? "border-zinc-800 shadow-[0_4px_15px_rgba(0,0,0,0.4)]" 
            : "border-zinc-950 opacity-40"
        )}
      >
        <span className={cn("text-base font-mono w-5 text-center pt-0.5", notification.active ? "text-orange-500" : "text-zinc-650")}>
          {notification.icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <p className={cn("text-xs font-medium leading-normal", notification.active ? "text-white font-bold" : "text-zinc-400")}>
              {notification.title}
            </p>
            {notification.active && (
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0 mt-1 shadow-[0_0_6px_rgba(249,115,22,0.9)] animate-pulse" />
            )}
          </div>
          <p className="text-[10px] text-zinc-500 truncate mt-0.5">{notification.sub}</p>
        </div>
        <span className="text-[8px] font-mono text-zinc-650 shrink-0 self-center">{notification.time}</span>
      </motion.div>
    </motion.div>
  )
}

// ── Main mobile dashboard ─────────────────────────────────────────────────────
export default function MobileDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = React.useState<any>(null)
  const [tasks, setTasks] = React.useState<any[]>([])
  const [weather, setWeather] = React.useState<any>(null)
  const [showCreate, setShowCreate] = React.useState(false)
  const [showNotifs, setShowNotifs] = React.useState(false)
  const [notifications, setNotifications] = React.useState<any[]>([
    { id: 1, icon: "✓", title: "Initiative Approved", sub: "Sector 4 deployment validated", time: "2m ago", active: true },
    { id: 2, icon: "✉", title: "New Message", sub: "Coordinated logs for Sector 7", time: "1h ago", active: true },
    { id: 3, icon: "⚡", title: "XP Earned", sub: "+150 points from last mission", time: "3h ago", active: true },
  ])

  const handleMarkNotifRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, active: false } : n).filter(n => n.id !== id))
  }

  const handleDismissNotif = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }
  const now = new Date()

  React.useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}")
    setUser(stored)
    apiRequest("/auth/me").then(r => {
      if (r.success) { setUser(r.data.user); localStorage.setItem("user", JSON.stringify(r.data.user)) }
    }).catch(() => {})
    apiRequest("/tasks").then(r => { if (r.success) setTasks(r.data) }).catch(() => {})

    // weather
    const cached = localStorage.getItem("tactical_weather")
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < 15 * 60 * 1000) { setWeather(data); return }
    }
    const API_KEY = "dummy_weather_key"
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=51.5074&lon=-0.1278&appid=${API_KEY}&units=metric`)
      .then(r => r.json()).then(d => {
        if (d.main) {
          const w = { temp: Math.round(d.main.temp), status: d.weather[0].main, city: d.name, aqi: 75 }
          setWeather(w)
          localStorage.setItem("tactical_weather", JSON.stringify({ data: w, timestamp: Date.now() }))
        }
      }).catch(() => setWeather({ temp: "18", status: "Clear", city: "Hub", aqi: 75 }))
  }, [])

  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening"
  const level = Math.floor((user?.points || 0) / 1000) + 1
  const xpProgress = ((user?.points || 0) % 1000) / 10
  const todayTasks = tasks.filter(t => {
    const d = new Date(t.date)
    return d.toDateString() === now.toDateString()
  })

  return (
    <div className="md:hidden flex flex-col h-full bg-zinc-950 text-white overflow-y-auto scrollbar-hide mobile-page pb-24">
      {/* Structural blueprint grid lines */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '3rem 3rem',
        }}
      />

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 pt-10 pb-4 relative z-10 border-b border-zinc-900/60">
        <div>
          <p className="text-[9px] font-mono font-medium uppercase tracking-[0.2em] text-zinc-500">{greeting}</p>
          <h1 className="text-2xl font-light tracking-tight text-white mt-0.5">
            {user?.name?.split(" ")[0] || "Operative"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="relative h-10 w-10 rounded-full border border-zinc-900 bg-zinc-950 flex items-center justify-center active:scale-95 transition-all"
          >
            <BellIcon size={18} className="text-zinc-400 hover:text-white transition-colors" />
            {notifications.some(n => n.active) && (
              <span className="absolute top-3 right-3 h-1.5 w-1.5 bg-orange-500 rounded-full shadow-[0_0_5px_rgba(249,115,22,0.8)]" />
            )}
          </button>
          <Link to="/profile" className="active:scale-95 transition-transform">
            <div className="h-10 w-10 rounded-full border border-zinc-800 bg-zinc-900 overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "User"}&backgroundColor=f8faff`}
                alt="avatar" className="w-full h-full object-cover"
              />
            </div>
          </Link>
        </div>
      </div>

      {/* ── Notification sheet ── */}
      <AnimatePresence>
        {showNotifs && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNotifs(false)} className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed bottom-0 left-0 right-0 z-[130] bg-zinc-950 border-t border-zinc-900 rounded-t-[2.5rem] p-6 pb-12 space-y-5 text-white"
            >
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-2 opacity-50" />
              <div className="flex items-center justify-between pb-2 border-b border-zinc-900">
                <div>
                  <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-500">System Telemetry</p>
                  <h3 className="text-lg font-medium tracking-tight">Notifications</h3>
                </div>
                <button onClick={() => setShowNotifs(false)} className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 hover:text-white">Close</button>
              </div>
              <div className="space-y-2 pt-2 overflow-x-hidden max-h-[400px] overflow-y-auto scrollbar-hide">
                <AnimatePresence>
                  {notifications.map((n, i) => (
                    <SwipeableNotificationCard
                      key={n.id}
                      notification={n}
                      onMarkRead={handleMarkNotifRead}
                      onDismiss={handleDismissNotif}
                      index={i}
                    />
                  ))}
                  {notifications.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-10 bg-zinc-950/40 border border-zinc-900 rounded-[2rem]"
                    >
                      <span className="text-emerald-500 text-base">✓</span>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-550 mt-2">
                        All telemetry nominal • No unread signals
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Hero card: Tactical Instrument Panel ── */}
      <div className="px-6 mt-6 mb-5 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-6 text-white relative overflow-hidden"
        >
          {/* Blueprint style wireframe decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 border-b border-l border-zinc-900/40 pointer-events-none opacity-50" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-t border-r border-zinc-900/40 pointer-events-none opacity-50" />
          <span className="absolute top-4 right-5 font-mono text-[9px] text-zinc-800 tracking-widest font-black select-none">NODE // 01</span>

          <div className="relative z-10">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-500">Cumulative Impact score</p>
                <p className="text-5xl font-light tracking-tighter text-white mt-1">
                  <Counter to={user?.points || 0} />
                </p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                <p className="text-[9px] font-mono font-medium uppercase tracking-wider text-zinc-300">Level {level}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-900/60">
              <div className="flex justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-[0.25em]">
                <span>telemetry threshold</span>
                <span className="text-zinc-400">{xpProgress.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Quick actions grid ── */}
      <div className="px-6 mb-6 relative z-10">
        <div className="flex items-center justify-between mb-3.5">
          <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-500">Dynamic Modules</p>
        </div>
        <div className="flex gap-2">
          <QuickAction icon={BotIcon}    label="AI Console"  to="/ai-console" accent="bg-orange-500" />
          <QuickAction icon={MarketIcon} label="Market"      to="/marketplace" />
          <QuickAction icon={MapIcon}    label="Strategic Map" to="/map" />
          <QuickAction icon={PackageIcon} label="Inventory"   to="/inventory" />
          <QuickAction icon={ChatIcon}   label="Messages"    to="/chat" />
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="px-6 mb-6 relative z-10">
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard label="Missions Log" value={tasks.length} sub="synchronous" />
          <StatCard label="Today Active" value={todayTasks.length} sub="allocated" />
          <StatCard
            label="Ambient temp"
            value={weather ? `${weather.temp}°` : "18°"}
            sub={weather?.status || "Clear"}
          />
        </div>
      </div>

      {/* ── Today's missions ── */}
      <div className="px-6 mb-6 relative z-10">
        <div className="flex items-center justify-between mb-3.5">
          <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-500">Missions Allocated Today</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 border border-zinc-900 bg-zinc-950 text-white rounded-full px-3 py-1.5 hover:border-zinc-800 active:scale-95 transition-all"
          >
            <PlusIcon size={12} className="text-orange-500" />
            <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-400">New Mission</span>
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="border border-zinc-900 bg-zinc-950/40 rounded-[2rem] p-8 text-center flex flex-col items-center justify-center">
            <CalendarIcon size={24} className="mb-2 text-zinc-700" />
            <p className="text-xs font-medium text-zinc-450">No operational directives today</p>
            <p className="text-[9px] font-mono text-zinc-600 mt-1 uppercase tracking-wider">Deploy a new mission block to begin</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.slice(0, 4).map((t, i) => (
              <motion.div
                key={t._id || i}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3.5 border border-zinc-900 bg-zinc-950/60 rounded-2xl p-4"
              >
                <div className={cn(
                  "h-9 w-9 rounded-full border flex items-center justify-center shrink-0",
                  t.status === "Completed" ? "bg-emerald-950/40 border-emerald-900/60 text-emerald-500" : "bg-orange-950/40 border-orange-900/60 text-orange-500"
                )}>
                  {t.status === "Completed"
                    ? <CheckIcon size={14} />
                    : <ZapIcon size={14} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{t.title}</p>
                  <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">{t.category}</p>
                </div>
                <span className={cn(
                  "text-[8px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border",
                  t.status === "Completed" 
                    ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-500" 
                    : "bg-orange-950/20 border-orange-900/30 text-orange-500"
                )}>{t.status}</span>
              </motion.div>
            ))}
            {todayTasks.length > 4 && (
              <button className="w-full py-2.5 border border-zinc-900/60 hover:bg-zinc-900/10 rounded-xl text-[9px] font-mono font-medium uppercase tracking-[0.2em] text-zinc-400 text-center transition-colors">
                + {todayTasks.length - 4} more allocated missions
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── AI Console CTA ── */}
      <div className="px-6 mb-6 relative z-10">
        <Link to="/ai-console">
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="bg-zinc-950 border border-zinc-900 rounded-[2rem] p-5 flex items-center gap-4 relative overflow-hidden group"
          >
            <div className="absolute inset-0 opacity-[0.01] bg-gradient-to-r from-orange-500 to-amber-500 pointer-events-none group-hover:opacity-[0.03] transition-opacity" />
            <div className="h-11 w-11 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
              <BotIcon size={20} className="text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500">Autonomous planning</p>
              <p className="text-sm font-medium text-white mt-0.5">Initialize AI Assistant Console</p>
            </div>
            <div className="h-7 w-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-colors group-hover:bg-zinc-850">
              <ArrowRightIcon size={12} className="text-zinc-500 group-hover:text-white transition-colors" />
            </div>
          </motion.div>
        </Link>
      </div>

      {/* ── Recent activity ── */}
      <div className="px-6 mb-4 relative z-10">
        <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-3.5">Recent Activity Log</p>
        <div className="space-y-4 relative pl-4 border-l border-zinc-900">
          {[
            { icon: "⚡", text: "Water Logistics Completed", time: "12m ago", xp: "+450 XP" },
            { icon: "🏅", text: "Advanced Contributor Status", time: "2h ago", xp: "Badge Allocated" },
            { icon: "✉", text: "New message from strategic team", time: "5h ago", xp: "Unread Signal" },
          ].map((a, i) => (
            <div key={i} className="relative flex items-center justify-between gap-4">
              {/* Timeline marker */}
              <span className="absolute -left-[21.5px] top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center">
                <span className="h-1 w-1 rounded-full bg-orange-500" />
              </span>
              
              <div className="flex-1 min-w-0 pl-1">
                <p className="text-xs font-medium text-zinc-300 truncate">{a.text}</p>
                <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">{a.time}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[9px] font-mono font-medium uppercase tracking-wider text-orange-500">{a.xp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Create mission sheet ── */}
      <CreateMissionSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => apiRequest("/tasks").then(r => { if (r.success) setTasks(r.data) }).catch(() => {})}
      />
    </div>
  )
}
