import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield01Icon as Shield, Add01Icon as Plus, Delete01Icon as Trash,
  Loading02Icon as Loader, ArrowLeft01Icon as ArrowLeft, SparklesIcon as Sparkles,
  DocumentCodeIcon as FileText, Time01Icon as Clock, FlashIcon as Zap,
  Settings01Icon as Settings, Notification01Icon as Bell, Target01Icon as Target,
  AnalyticsUpIcon as Analytics, UserGroupIcon as Users,
} from "hugeicons-react"
import { cn } from "@/lib/utils"
import { apiRequest } from "../lib/api"
import { useNavigate } from "react-router-dom"
import AdminSidebar, { type AdminTab } from "./admin/AdminSidebar"
import AdminDashboard from "./admin/AdminDashboard"
import NgoVerificationPanel from "./admin/NgoVerificationPanel"
import VolunteerPanel from "./admin/VolunteerPanel"

export default function AdminPanel() {
  const navigate = useNavigate()
  const [tab, setTab] = React.useState<AdminTab>('dashboard')
  const [tickets, setTickets] = React.useState<any[]>([])
  const [admins, setAdmins] = React.useState<any[]>([])
  const [stats, setStats] = React.useState<any>(null)
  const [feed, setFeed] = React.useState<any[]>([])
  const [auditLogs, setAuditLogs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [adminEmail, setAdminEmail] = React.useState('')
  const [actionLoading, setActionLoading] = React.useState(false)
  const [toast, setToast] = React.useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled([
        apiRequest('/admin/stats'),
        apiRequest('/admin/tickets?status=all'),
        apiRequest('/admin/admins'),
        apiRequest('/admin/activity-feed'),
        apiRequest('/admin/audit-logs?limit=30'),
      ])
      if (results[0].status === 'fulfilled') setStats(results[0].value.data?.stats || null)
      if (results[1].status === 'fulfilled') setTickets(results[1].value.data?.tickets || [])
      if (results[2].status === 'fulfilled') setAdmins(results[2].value.data?.admins || [])
      if (results[3].status === 'fulfilled') setFeed(results[3].value.data?.feed || [])
      if (results[4].status === 'fulfilled') setAuditLogs(results[4].value.data?.logs || [])
    } catch (err: any) { showToast(err.message || 'Failed to load') }
    finally { setLoading(false) }
  }, [])

  React.useEffect(() => { fetchData() }, [fetchData])

  const handleAddAdmin = async () => {
    if (!adminEmail.trim()) return
    setActionLoading(true)
    try {
      await apiRequest('/admin/admins/add', { method: 'POST', body: JSON.stringify({ email: adminEmail }) })
      showToast('Admin added!'); setAdminEmail(''); fetchData()
    } catch (err: any) { showToast(err.message) }
    finally { setActionLoading(false) }
  }

  const handleRemoveAdmin = async (email: string) => {
    if (!confirm(`Remove admin: ${email}?`)) return
    try {
      await apiRequest('/admin/admins/remove', { method: 'POST', body: JSON.stringify({ email }) })
      showToast('Admin removed'); fetchData()
    } catch (err: any) { showToast(err.message) }
  }

  const pendingCount = tickets.filter(t => t.status === 'pending').length

  const renderContent = () => {
    switch (tab) {
      case 'dashboard':
        return <AdminDashboard stats={stats} feed={feed} loading={loading} />
      case 'ngo':
        return <NgoVerificationPanel tickets={tickets} onRefresh={fetchData} showToast={showToast} />
      case 'volunteers':
        return <VolunteerPanel showToast={showToast} />
      case 'admins':
        return (
          <div className="space-y-6">
            <div><h2 className="text-3xl font-black tracking-tight">Admin Users</h2>
              <p className="text-sm text-muted-foreground/60 mt-1">Manage administrator access</p></div>
            <div className="flex gap-3">
              <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                placeholder="Enter email to add as admin..."
                className="flex-1 h-14 bg-card border border-border rounded-2xl px-5 text-sm font-medium outline-none focus:border-indigo-500 transition-all placeholder:text-muted-foreground/30" />
              <button onClick={handleAddAdmin} disabled={actionLoading}
                className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60">
                <Plus className="h-4 w-4" /> Add Admin
              </button>
            </div>
            <div className="space-y-3">
              {admins.map(admin => (
                <div key={admin._id} className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-violet-600/10 border border-violet-600/20 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-violet-500" />
                    </div>
                    <div><p className="font-bold text-sm">{admin.name}</p><p className="text-[10px] text-muted-foreground/60">{admin.email}</p></div>
                  </div>
                  {admin.email !== 'abhijeetpanda21@gmail.com' ? (
                    <button onClick={() => handleRemoveAdmin(admin.email)}
                      className="h-9 px-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all">Remove</button>
                  ) : (
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20">Super Admin</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      case 'audit':
        return (
          <div className="space-y-6">
            <div><h2 className="text-3xl font-black tracking-tight">Audit Logs</h2>
              <p className="text-sm text-muted-foreground/60 mt-1">Track all admin actions and system events</p></div>
            {auditLogs.length === 0 ? (
              <div className="p-12 text-center bg-card border border-border rounded-3xl">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                <p className="text-sm font-bold text-muted-foreground/40">No audit logs yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log: any, i: number) => (
                  <motion.div key={log._id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                    className="p-4 rounded-xl bg-card border border-border/60 flex items-center gap-4">
                    <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{log.details || log.action}</p>
                      <p className="text-[10px] text-muted-foreground/40">{log.performedBy?.name || 'System'} · {new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 shrink-0">{log.action}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-3xl bg-indigo-600/10 flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2">Coming Soon</h3>
            <p className="text-sm text-muted-foreground/60 max-w-sm">
              The <span className="font-bold text-foreground capitalize">{tab}</span> module is under development. Check back soon!
            </p>
          </div>
        )
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl bg-foreground text-background text-sm font-bold shadow-2xl"
          >{toast}</motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AdminSidebar activeTab={tab} onTabChange={setTab} pendingCount={pendingCount} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
