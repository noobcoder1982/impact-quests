import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield01Icon as Shield,
  CheckmarkCircle01Icon as CheckCircle,
  Cancel01Icon as X,
  Loading02Icon as LoadingSpinner,
  UserGroupIcon as Users,
  Mail01Icon as Mail,
  Add01Icon as Plus,
  Delete01Icon as Trash,
  ArrowRight01Icon as Eye,
  ArrowLeft01Icon as ArrowLeft,
  AnalyticsUpIcon as TrendingUp,
  Time01Icon as Clock,
  SparklesIcon as Sparkles,
  InformationCircleIcon as Info,
  Shield01Icon as ShieldCheck,
} from "hugeicons-react"
import { cn } from "@/lib/utils"
import { apiRequest } from "../lib/api"
import { useNavigate } from "react-router-dom"

type Ticket = {
  _id: string; status: string; organizationName: string; contactEmail: string;
  contactPhone?: string; answers: Record<string, string>; adminNotes?: string;
  createdAt: string; userId?: any; reviewedBy?: any; reviewedAt?: string;
}
type AdminUser = { _id: string; name: string; email: string; pfp?: string }
type Stats = { totalUsers: number; totalNgos: number; pendingTickets: number; approvedNgos: number; rejectedTickets: number }

export default function AdminPanel() {
  const navigate = useNavigate()
  const [tab, setTab] = React.useState<'tickets' | 'admins'>('tickets')
  const [tickets, setTickets] = React.useState<Ticket[]>([])
  const [admins, setAdmins] = React.useState<AdminUser[]>([])
  const [stats, setStats] = React.useState<Stats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [selectedTicket, setSelectedTicket] = React.useState<Ticket | null>(null)
  const [filterStatus, setFilterStatus] = React.useState('all')
  const [adminEmail, setAdminEmail] = React.useState('')
  const [actionLoading, setActionLoading] = React.useState(false)
  const [adminNotes, setAdminNotes] = React.useState('')
  const [toast, setToast] = React.useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [ticketRes, adminRes, statsRes] = await Promise.all([
        apiRequest(`/admin/tickets?status=${filterStatus}`),
        apiRequest('/admin/admins'),
        apiRequest('/admin/stats'),
      ])
      setTickets(ticketRes.data?.tickets || [])
      setAdmins(adminRes.data?.admins || [])
      setStats(statsRes.data?.stats || null)
    } catch (err: any) {
      showToast(err.message || 'Failed to load data')
    } finally { setLoading(false) }
  }, [filterStatus])

  React.useEffect(() => { fetchData() }, [fetchData])

  const handleReview = async (ticketId: string, action: string) => {
    setActionLoading(true)
    try {
      await apiRequest(`/admin/tickets/${ticketId}/review`, {
        method: 'PUT', body: JSON.stringify({ action, adminNotes }),
      })
      showToast(`Ticket ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'marked under review'}!`)
      setSelectedTicket(null); setAdminNotes(''); fetchData()
    } catch (err: any) { showToast(err.message) }
    finally { setActionLoading(false) }
  }

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

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    under_review: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  }

  const spring = { type: "spring" as const, stiffness: 340, damping: 28 }

  return (
    <div className="flex-1 overflow-y-auto bg-background pb-40">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl bg-foreground text-background text-sm font-bold shadow-2xl"
          >{toast}</motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Admin Panel</h1>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">NGO Verification System</p>
            </div>
          </div>
          <button onClick={() => navigate('/profile')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 space-y-8">
        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers, color: 'text-foreground' },
              { label: 'Total NGOs', value: stats.totalNgos, color: 'text-indigo-500' },
              { label: 'Pending', value: stats.pendingTickets, color: 'text-amber-500' },
              { label: 'Approved', value: stats.approvedNgos, color: 'text-emerald-500' },
              { label: 'Rejected', value: stats.rejectedTickets, color: 'text-red-500' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: i * 0.05 }}
                className="p-5 rounded-2xl bg-card border border-border shadow-sm"
              >
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">{s.label}</p>
                <p className={cn("text-3xl font-black tracking-tighter mt-1", s.color)}>{s.value}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-secondary/50 rounded-2xl border border-border/40 w-fit">
          {(['tickets', 'admins'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all capitalize",
                tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >{t === 'tickets' ? '🎫 Verification Tickets' : '👤 Manage Admins'}</button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : tab === 'tickets' ? (
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'under_review', 'approved', 'rejected'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                    filterStatus === s ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground"
                  )}
                >{s.replace('_', ' ')}</button>
              ))}
            </div>

            {tickets.length === 0 ? (
              <div className="p-12 text-center bg-card border border-border rounded-3xl">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
                <p className="text-sm font-bold text-muted-foreground/40">No tickets found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket, i) => (
                  <motion.div key={ticket._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: i * 0.03 }}
                    onClick={() => { setSelectedTicket(ticket); setAdminNotes(ticket.adminNotes || '') }}
                    className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-indigo-500/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center">
                          <Users className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-bold text-sm tracking-tight">{ticket.organizationName}</p>
                          <p className="text-[10px] text-muted-foreground/60 flex items-center gap-2 mt-0.5">
                            <Mail className="h-3 w-3" /> {ticket.contactEmail}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn("px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border", statusColor[ticket.status] || statusColor.pending)}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <span className="text-[9px] text-muted-foreground/40 font-medium hidden md:block">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                        <Eye className="h-4 w-4 text-muted-foreground/20 group-hover:text-indigo-500 transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Admins Tab */
          <div className="space-y-6">
            <div className="flex gap-3">
              <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                placeholder="Enter email to add as admin..."
                className="flex-1 h-14 bg-card border border-border rounded-2xl px-5 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-muted-foreground/30"
              />
              <button onClick={handleAddAdmin} disabled={actionLoading}
                className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-bold text-sm flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-60"
              >
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
                    <div>
                      <p className="font-bold text-sm">{admin.name}</p>
                      <p className="text-[10px] text-muted-foreground/60">{admin.email}</p>
                    </div>
                  </div>
                  {admin.email !== 'abhijeetpanda21@gmail.com' && (
                    <button onClick={() => handleRemoveAdmin(admin.email)}
                      className="h-9 px-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all"
                    >Remove</button>
                  )}
                  {admin.email === 'abhijeetpanda21@gmail.com' && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/20">Super Admin</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedTicket(null)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            />
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="fixed inset-4 md:inset-x-auto md:inset-y-8 md:w-full md:max-w-3xl md:mx-auto z-[101] bg-background border border-border rounded-3xl shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-background/90 backdrop-blur-xl border-b border-border/30 px-6 py-5 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-black tracking-tight">{selectedTicket.organizationName}</h2>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{selectedTicket.contactEmail} · {selectedTicket.contactPhone || 'No phone'}</p>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className={cn("inline-flex px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border", statusColor[selectedTicket.status])}>
                  {selectedTicket.status.replace('_', ' ')}
                </div>

                {/* Answers */}
                <div className="space-y-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Verification Answers</p>
                  {Object.entries(selectedTicket.answers || {}).map(([key, value]) => (
                    value ? (
                      <div key={key} className="p-4 rounded-2xl bg-card border border-border space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{value}</p>
                      </div>
                    ) : null
                  ))}
                </div>

                {/* Admin Notes */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Admin Notes</p>
                  <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this verification..."
                    rows={3}
                    className="w-full bg-card border border-border rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-muted-foreground/30 resize-none"
                  />
                </div>

                {/* Review actions */}
                {selectedTicket.status !== 'approved' && (
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => handleReview(selectedTicket._id, 'approve')} disabled={actionLoading}
                      className="flex-1 h-14 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-60"
                    >{actionLoading ? <LoadingSpinner className="h-5 w-5 animate-spin" /> : <><CheckCircle className="h-4 w-4" /> Approve NGO</>}</button>
                    <button onClick={() => handleReview(selectedTicket._id, 'under_review')} disabled={actionLoading}
                      className="h-14 px-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-500 font-bold text-sm hover:bg-blue-500/20 active:scale-95 transition-all disabled:opacity-60"
                    >Under Review</button>
                    <button onClick={() => handleReview(selectedTicket._id, 'reject')} disabled={actionLoading}
                      className="h-14 px-6 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500/20 active:scale-95 transition-all disabled:opacity-60"
                    >Reject</button>
                  </div>
                )}
                {selectedTicket.status === 'approved' && (
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                    <p className="text-sm font-bold text-emerald-500">This NGO has been verified</p>
                    {selectedTicket.reviewedBy && <p className="text-[10px] text-muted-foreground mt-1">Reviewed by {selectedTicket.reviewedBy.name || selectedTicket.reviewedBy.email}</p>}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
