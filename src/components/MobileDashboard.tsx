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
    <Link to={to} className="flex flex-col items-center gap-2 flex-1">
      <div className={cn(
        "h-14 w-14 rounded-2xl flex items-center justify-center transition-all active:scale-90",
        accent ?? "bg-secondary"
      )}>
        <Icon size={22} className={accent ? "text-white" : "text-foreground"} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
    </Link>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className={cn("rounded-2xl p-4 flex flex-col gap-1", accent ?? "bg-secondary/40")}>
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{label}</span>
      <span className={cn("text-2xl font-black tracking-tighter", accent ? "text-white" : "text-foreground")}>{value}</span>
      {sub && <span className={cn("text-[10px] font-medium", accent ? "text-white/60" : "text-muted-foreground/50")}>{sub}</span>}
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
      if (res.success) { onCreated(); onClose() }
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
            className="fixed inset-0 z-[80] bg-black/40"
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed bottom-0 left-0 right-0 z-[90] bg-background rounded-t-3xl p-6 pb-10 space-y-5"
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black tracking-tight">New Mission</h3>
              <button onClick={onClose} className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground text-lg">×</button>
            </div>

            <div className="space-y-3">
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Mission title..."
                className="w-full h-14 bg-secondary/40 rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 border border-border/40"
              />
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full h-14 bg-secondary/40 rounded-2xl px-4 text-sm font-medium focus:outline-none border border-border/40 appearance-none"
              >
                {["General","Emergency Response","Rescue Mission","Medical Camp","Food Drive","Shelter Support"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Details (optional)..."
                rows={3}
                className="w-full bg-secondary/40 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none border border-border/40 resize-none"
              />
            </div>

            <button
              onClick={submit}
              disabled={loading || !form.title.trim()}
              className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-black text-sm uppercase tracking-widest disabled:opacity-40 active:scale-95 transition-all"
            >
              {loading ? "Creating..." : "Deploy Mission"}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
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
    const API_KEY = "[REDACTED]"
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=51.5074&lon=-0.1278&appid=${API_KEY}&units=metric`)
      .then(r => r.json()).then(d => {
        if (d.main) {
          const w = { temp: Math.round(d.main.temp), status: d.weather[0].main, city: d.name, aqi: 75 }
          setWeather(w)
          localStorage.setItem("tactical_weather", JSON.stringify({ data: w, timestamp: Date.now() }))
        }
      }).catch(() => setWeather({ temp: "--", status: "Clear", city: "Hub", aqi: 75 }))
  }, [])

  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening"
  const level = Math.floor((user?.points || 0) / 1000) + 1
  const xpProgress = ((user?.points || 0) % 1000) / 10
  const todayTasks = tasks.filter(t => {
    const d = new Date(t.date)
    return d.toDateString() === now.toDateString()
  })

  return (
    <div className="md:hidden flex flex-col h-full bg-background overflow-y-auto scrollbar-hide mobile-page">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">{greeting}</p>
          <h1 className="text-xl font-black tracking-tight text-foreground mt-0.5">
            {user?.name?.split(" ")[0] || "Operative"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotifs(v => !v)}
            className="relative h-11 w-11 rounded-2xl bg-secondary flex items-center justify-center active:scale-90 transition-all"
          >
            <BellIcon size={20} className="text-foreground" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-rose-500 rounded-full" />
          </button>
          <Link to="/profile">
            <div className="h-11 w-11 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 overflow-hidden">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "User"}&backgroundColor=f8faff`}
                alt="av" className="w-full h-full object-cover"
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
              onClick={() => setShowNotifs(false)} className="fixed inset-0 z-[70] bg-black/30" />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed bottom-0 left-0 right-0 z-[80] bg-background rounded-t-3xl p-6 pb-10 space-y-4"
            >
              <div className="w-10 h-1 bg-border rounded-full mx-auto" />
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black">Notifications</h3>
                <button onClick={() => setShowNotifs(false)} className="text-xs font-bold text-indigo-600">Clear all</button>
              </div>
              {[
                { icon: "✅", title: "Initiative Approved", sub: "Sector 4 deployment validated", time: "2m ago" },
                { icon: "💬", title: "New Message", sub: "Coordinated logs for Sector 7", time: "1h ago" },
                { icon: "⚡", title: "XP Earned", sub: "+150 points from last mission", time: "3h ago" },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-secondary/30">
                  <span className="text-xl">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{n.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{n.sub}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0">{n.time}</span>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Hero card: XP + level ── */}
      <div className="px-5 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-indigo-600 rounded-3xl p-5 text-white relative overflow-hidden"
        >
          {/* bg decoration */}
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/5" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Impact Score</p>
                <p className="text-4xl font-black tracking-tighter mt-0.5">
                  <Counter to={user?.points || 0} />
                </p>
              </div>
              <div className="bg-white/15 rounded-2xl px-3 py-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest">Lvl {level}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-white/50 uppercase tracking-widest">
                <span>Next tier</span>
                <span>{xpProgress.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Quick actions ── */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Quick Access</p>
        </div>
        <div className="flex gap-2">
          <QuickAction icon={BotIcon}    label="AI"       to="/ai-console" accent="bg-indigo-600" />
          <QuickAction icon={MarketIcon} label="Market"   to="/marketplace" />
          <QuickAction icon={MapIcon}    label="Map"      to="/map" />
          <QuickAction icon={PackageIcon} label="Inventory" to="/inventory" />
          <QuickAction icon={ChatIcon}   label="Chat"     to="/chat" />
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Missions" value={tasks.length} sub="total" />
          <StatCard label="Today" value={todayTasks.length} sub="active" />
          <StatCard
            label="Weather"
            value={weather ? `${weather.temp}°` : "--"}
            sub={weather?.status || "Loading"}
          />
        </div>
      </div>

      {/* ── Today's missions ── */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Today's Missions</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-indigo-600 text-white rounded-full px-3 py-1.5 active:scale-90 transition-all"
          >
            <PlusIcon size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">New</span>
          </button>
        </div>

        {todayTasks.length === 0 ? (
          <div className="bg-secondary/30 rounded-2xl p-6 text-center">
            <CalendarIcon size={28} className="mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm font-bold text-muted-foreground/50">No missions today</p>
            <p className="text-xs text-muted-foreground/30 mt-1">Tap + New to create one</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.slice(0, 4).map((t, i) => (
              <motion.div
                key={t._id || i}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 bg-secondary/30 rounded-2xl p-4"
              >
                <div className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                  t.status === "Completed" ? "bg-emerald-500/15" : "bg-indigo-600/10"
                )}>
                  {t.status === "Completed"
                    ? <CheckIcon size={16} className="text-emerald-500" />
                    : <ZapIcon size={16} className="text-indigo-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{t.title}</p>
                  <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">{t.category}</p>
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full",
                  t.status === "Completed" ? "bg-emerald-500/10 text-emerald-500" : "bg-indigo-600/10 text-indigo-600"
                )}>{t.status}</span>
              </motion.div>
            ))}
            {todayTasks.length > 4 && (
              <button className="w-full py-3 text-[11px] font-black uppercase tracking-widest text-indigo-600 text-center">
                +{todayTasks.length - 4} more missions
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── AI Console CTA ── */}
      <div className="px-5 mb-6">
        <Link to="/ai-console">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="bg-[#0f0f0f] dark:bg-secondary/40 rounded-3xl p-5 flex items-center gap-4 border border-white/5"
          >
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0">
              <BotIcon size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white dark:text-foreground">AI Console</p>
              <p className="text-[11px] text-white/40 dark:text-muted-foreground/50 mt-0.5">Ask anything, plan missions</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
              <ArrowRightIcon size={14} className="text-white/60" />
            </div>
          </motion.div>
        </Link>
      </div>

      {/* ── Recent activity ── */}
      <div className="px-5 mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-3">Recent Activity</p>
        <div className="space-y-2">
          {[
            { icon: "⚡", text: "Water Logistics Completed", time: "12m ago", xp: "+450 XP" },
            { icon: "🏅", text: "Advanced Contributor Status", time: "2h ago", xp: "Badge" },
            { icon: "💬", text: "New message from team", time: "5h ago", xp: "Unread" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-border/30 last:border-0">
              <span className="text-lg">{a.icon}</span>
              <p className="flex-1 text-sm font-medium text-foreground/80 truncate">{a.text}</p>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-black text-indigo-600">{a.xp}</p>
                <p className="text-[9px] text-muted-foreground/40">{a.time}</p>
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
