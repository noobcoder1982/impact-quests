import * as React from "react"
import { motion } from "framer-motion"
import {
  UserGroupIcon as Users,
  Shield01Icon as Shield,
  CheckmarkCircle01Icon as Check,
  Cancel01Icon as XIcon,
  FlashIcon as Zap,
  Target01Icon as Target,
  AnalyticsUpIcon as TrendingUp,
  SparklesIcon as Sparkles,
  Time01Icon as Clock,
  Loading02Icon as Loader,
} from "hugeicons-react"
import { cn } from "@/lib/utils"

const spring = { type: "spring" as const, stiffness: 340, damping: 28 }

type Stats = {
  totalUsers: number; totalNgos: number; totalVolunteers: number
  pendingTickets: number; approvedNgos: number; rejectedTickets: number
  totalTasks: number; activeTasks: number; suspendedUsers: number
  recentVolunteers: number; aiFlaggedActivities: number; emergencyMissions: number
  totalDonations: number; reportsFiled: number
}

type FeedItem = {
  id: string; type: string; action: string; details: string
  performer?: any; timestamp: string
}

const actionLabels: Record<string, { label: string; color: string }> = {
  ngo_approved: { label: 'NGO Verified', color: 'text-emerald-500' },
  ngo_rejected: { label: 'NGO Rejected', color: 'text-red-500' },
  ngo_submitted: { label: 'NGO Applied', color: 'text-amber-500' },
  ngo_review: { label: 'Under Review', color: 'text-blue-500' },
  volunteer_suspended: { label: 'User Suspended', color: 'text-red-500' },
  volunteer_unsuspended: { label: 'User Restored', color: 'text-emerald-500' },
  admin_added: { label: 'Admin Added', color: 'text-violet-500' },
  admin_removed: { label: 'Admin Removed', color: 'text-amber-500' },
}

export default function AdminDashboard({ stats, feed, loading }: {
  stats: Stats | null; feed: FeedItem[]; loading: boolean
}) {
  if (loading) return <div className="flex-1 flex items-center justify-center py-20"><Loader className="h-8 w-8 animate-spin text-indigo-500" /></div>

  const cards = [
    { label: 'Total NGOs', value: stats?.totalNgos || 0, icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { label: 'Pending Verifications', value: stats?.pendingTickets || 0, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Active Volunteers', value: stats?.totalVolunteers || 0, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Active Campaigns', value: stats?.activeTasks || 0, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Donations', value: stats?.totalDonations || 0, icon: Zap, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { label: 'Reports Filed', value: stats?.reportsFiled || 0, icon: XIcon, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'AI Flagged', value: stats?.aiFlaggedActivities || 0, icon: Sparkles, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Emergency Missions', value: stats?.emergencyMissions || 0, icon: Zap, color: 'text-red-500', bg: 'bg-red-500/10' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground/60 mt-1">Platform overview and real-time monitoring</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: i * 0.04 }}
              className="p-5 rounded-2xl bg-card border border-border/60 hover:border-indigo-500/30 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", card.bg)}>
                  <Icon className={cn("h-5 w-5", card.color)} />
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground/20 group-hover:text-emerald-500 transition-colors" />
              </div>
              <p className="text-3xl font-black tracking-tighter">{card.value.toLocaleString()}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mt-1">{card.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Charts + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Charts Placeholder */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.3 }}
          className="p-8 rounded-3xl bg-card border border-border/60 space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Growth Analytics</h3>
              <p className="text-[10px] text-muted-foreground/40 font-medium">Last 6 months</p>
            </div>
            <div className="flex gap-3">
              {['Volunteers', 'NGOs'].map(t => (
                <span key={t} className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-secondary/50 text-muted-foreground">{t}</span>
              ))}
            </div>
          </div>
          {/* Mini Bar Chart */}
          <div className="h-48 flex items-end gap-3">
            {Array.from({ length: 6 }).map((_, i) => {
              const h1 = 30 + Math.random() * 60
              const h2 = 10 + Math.random() * 30
              return (
                <div key={i} className="flex-1 flex items-end gap-1">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${h1}%` }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.6 }}
                    className="flex-1 bg-indigo-500/20 rounded-t-lg hover:bg-indigo-500/40 transition-colors cursor-crosshair relative group/bar"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 bg-foreground text-background px-2 py-1 rounded-lg text-[9px] font-bold whitespace-nowrap transition-opacity">
                      {Math.round(h1 * 2)} users
                    </div>
                  </motion.div>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${h2}%` }}
                    transition={{ delay: 0.6 + i * 0.08, duration: 0.6 }}
                    className="flex-1 bg-emerald-500/20 rounded-t-lg hover:bg-emerald-500/40 transition-colors cursor-crosshair"
                  />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => <span key={m}>{m}</span>)}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.4 }}
          className="p-6 rounded-3xl bg-card border border-border/60 space-y-4 max-h-[520px] overflow-y-auto"
        >
          <h3 className="text-lg font-bold sticky top-0 bg-card pb-2">Recent Activity</h3>
          {feed.length === 0 ? (
            <p className="text-sm text-muted-foreground/40 text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {feed.slice(0, 15).map((item, i) => {
                const meta = actionLabels[item.action] || { label: item.action, color: 'text-muted-foreground' }
                return (
                  <motion.div key={item.id + '-' + i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.03 }}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-all"
                  >
                    <div className={cn("h-2 w-2 rounded-full mt-1.5 shrink-0", meta.color.replace('text-', 'bg-'))} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.details || meta.label}</p>
                      <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                        {item.performer?.name || 'System'} · {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={cn("text-[8px] font-black uppercase tracking-widest shrink-0", meta.color)}>{meta.label}</span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
