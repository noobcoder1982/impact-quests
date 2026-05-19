import * as React from "react"
import { motion } from "framer-motion"
import {
  DashboardCircleIcon as Dashboard,
  Shield01Icon as Shield,
  UserGroupIcon as Users,
  Target01Icon as Target,
  AnalyticsUpIcon as Analytics,
  SparklesIcon as Sparkles,
  Notification01Icon as Bell,
  Settings01Icon as Settings,
  DocumentCodeIcon as FileText,
  FlashIcon as Zap,
} from "hugeicons-react"
import { cn } from "@/lib/utils"

export type AdminTab = 'dashboard' | 'ngo' | 'volunteers' | 'campaigns' | 'analytics' | 'ai' | 'notifications' | 'audit' | 'admins' | 'settings'

const navItems: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Dashboard },
  { id: 'ngo', label: 'NGO Verification', icon: Shield },
  { id: 'volunteers', label: 'Volunteers', icon: Users },
  { id: 'campaigns', label: 'Campaigns', icon: Target },
  { id: 'analytics', label: 'Analytics', icon: Analytics },
  { id: 'ai', label: 'AI Moderation', icon: Sparkles },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'audit', label: 'Audit Logs', icon: FileText },
  { id: 'admins', label: 'Admin Users', icon: Zap },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar({ activeTab, onTabChange, pendingCount }: {
  activeTab: AdminTab
  onTabChange: (tab: AdminTab) => void
  pendingCount: number
}) {
  return (
    <div className="w-72 border-r border-border/40 bg-card/50 backdrop-blur-xl flex flex-col h-full overflow-hidden shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">Command Center</h1>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">Admin Panel v2.0</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const showBadge = item.id === 'ngo' && pendingCount > 0
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative group",
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="truncate">{item.label}</span>
              {showBadge && (
                <span className={cn(
                  "ml-auto px-2 py-0.5 rounded-full text-[9px] font-black",
                  isActive ? "bg-white/20 text-white" : "bg-amber-500/10 text-amber-500"
                )}>{pendingCount}</span>
              )}
              {isActive && (
                <motion.div layoutId="admin-tab" className="absolute inset-0 bg-indigo-600 rounded-xl -z-10" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/30">
        <div className="p-3 rounded-xl bg-indigo-600/5 border border-indigo-600/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">System Online</span>
          </div>
          <p className="text-[10px] text-muted-foreground/50">All services operational</p>
        </div>
      </div>
    </div>
  )
}
