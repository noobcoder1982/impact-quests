import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield01Icon as Shield, CheckmarkCircle01Icon as Check, Cancel01Icon as X,
  Loading02Icon as Loader, UserGroupIcon as Users, Mail01Icon as Mail,
  ArrowRight01Icon as Eye, SparklesIcon as Sparkles, Search01Icon as Search,
  Time01Icon as Clock,
} from "hugeicons-react"
import { cn } from "@/lib/utils"
import { apiRequest } from "../../lib/api"

type Ticket = {
  _id: string; status: string; organizationName: string; contactEmail: string
  contactPhone?: string; answers: Record<string, string>; adminNotes?: string
  createdAt: string; userId?: any; reviewedBy?: any; reviewedAt?: string
  aiAnalysis?: any; aiAnalyzedAt?: string
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  under_review: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export default function NgoVerificationPanel({ tickets, onRefresh, showToast }: {
  tickets: Ticket[]; onRefresh: () => void; showToast: (msg: string) => void
}) {
  const [selected, setSelected] = React.useState<Ticket | null>(null)
  const [filter, setFilter] = React.useState('all')
  const [search, setSearch] = React.useState('')
  const [notes, setNotes] = React.useState('')
  const [actionLoading, setActionLoading] = React.useState(false)
  const [aiLoading, setAiLoading] = React.useState(false)
  const [aiResult, setAiResult] = React.useState<any>(null)

  const filtered = tickets.filter(t =>
    (filter === 'all' || t.status === filter) &&
    (t.organizationName?.toLowerCase().includes(search.toLowerCase()) || t.contactEmail?.toLowerCase().includes(search.toLowerCase()))
  )

  const handleReview = async (id: string, action: string) => {
    setActionLoading(true)
    try {
      await apiRequest(`/admin/tickets/${id}/review`, { method: 'PUT', body: JSON.stringify({ action, adminNotes: notes }) })
      showToast(`Ticket ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'updated'}!`)
      setSelected(null); setNotes(''); onRefresh()
    } catch (err: any) { showToast(err.message) }
    finally { setActionLoading(false) }
  }

  const runAiAnalysis = async (id: string) => {
    setAiLoading(true)
    try {
      const res = await apiRequest(`/admin/tickets/${id}/ai-analyze`, { method: 'POST' })
      setAiResult(res.data?.analysis || null)
      showToast('AI Analysis complete')
    } catch (err: any) { showToast('AI analysis failed: ' + err.message) }
    finally { setAiLoading(false) }
  }

  const riskColors: Record<string, string> = {
    low: 'text-emerald-500 bg-emerald-500/10', medium: 'text-amber-500 bg-amber-500/10',
    high: 'text-orange-500 bg-orange-500/10', critical: 'text-red-500 bg-red-500/10',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">NGO Verification</h2>
          <p className="text-sm text-muted-foreground/60 mt-1">Review and approve NGO applications</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search NGOs..."
            className="h-11 pl-11 pr-4 bg-card border border-border rounded-xl text-sm outline-none focus:border-indigo-500 w-72" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'under_review', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
              filter === s ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground"
            )}>{s.replace('_', ' ')}</button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border rounded-3xl">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
          <p className="text-sm font-bold text-muted-foreground/40">No tickets found</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_100px] gap-4 px-6 py-3 border-b border-border/40 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
            <span>Organization</span><span>Location</span><span>Submitted</span><span>Status</span><span>Actions</span>
          </div>
          {filtered.map((t, i) => (
            <motion.div key={t._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              onClick={() => { setSelected(t); setNotes(t.adminNotes || ''); setAiResult(t.aiAnalysis || null) }}
              className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_100px] gap-4 px-6 py-4 border-b border-border/20 hover:bg-secondary/20 cursor-pointer transition-all group items-center"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600/10 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{t.organizationName}</p>
                  <p className="text-[10px] text-muted-foreground/50 truncate">{t.contactEmail}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground/60 hidden md:block">{t.answers?.areasOfOperation || '—'}</span>
              <span className="text-xs text-muted-foreground/60 hidden md:block">{new Date(t.createdAt).toLocaleDateString()}</span>
              <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit", statusColor[t.status])}>{t.status.replace('_',' ')}</span>
              <Eye className="h-4 w-4 text-muted-foreground/20 group-hover:text-indigo-500 transition-colors hidden md:block" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="fixed inset-4 md:inset-x-auto md:inset-y-6 md:w-full md:max-w-4xl md:mx-auto z-[101] bg-background border border-border rounded-3xl shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-background/90 backdrop-blur-xl border-b border-border/30 px-6 py-5 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-black tracking-tight">{selected.organizationName}</h2>
                  <p className="text-[10px] text-muted-foreground/60">{selected.contactEmail} · {selected.contactPhone || 'No phone'}</p>
                </div>
                <button onClick={() => setSelected(null)} className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80"><X className="h-5 w-5" /></button>
              </div>

              <div className="p-6 space-y-6">
                <div className={cn("inline-flex px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border", statusColor[selected.status])}>{selected.status.replace('_',' ')}</div>

                {/* Answers */}
                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Verification Answers</p>
                  {Object.entries(selected.answers || {}).map(([k, v]) => v ? (
                    <div key={k} className="p-4 rounded-2xl bg-card border border-border space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{v}</p>
                    </div>
                  ) : null)}
                </div>

                {/* AI Analysis */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">AI Trust Analysis</p>
                    <button onClick={() => runAiAnalysis(selected._id)} disabled={aiLoading}
                      className="px-4 py-2 rounded-xl bg-violet-600/10 border border-violet-600/20 text-violet-500 text-[10px] font-black uppercase tracking-widest hover:bg-violet-600/20 transition-all disabled:opacity-50 flex items-center gap-2">
                      {aiLoading ? <Loader className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      {aiLoading ? 'Analyzing...' : 'Run AI Analysis'}
                    </button>
                  </div>
                  {aiResult && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-card border border-border space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">Risk Score</p>
                          <p className={cn("text-2xl font-black", (aiResult.riskScore || 0) > 60 ? 'text-red-500' : (aiResult.riskScore || 0) > 30 ? 'text-amber-500' : 'text-emerald-500')}>{aiResult.riskScore || 0}%</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">Risk Level</p>
                          <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase", riskColors[aiResult.riskLevel] || riskColors.low)}>{aiResult.riskLevel || 'low'}</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">Scam Prob.</p>
                          <p className="text-2xl font-black">{aiResult.scamProbability || 0}%</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">Recommendation</p>
                          <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase",
                            aiResult.recommendation === 'approve' ? 'bg-emerald-500/10 text-emerald-500' :
                            aiResult.recommendation === 'reject' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                          )}>{aiResult.recommendation || 'review'}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">{aiResult.summary}</p>
                      {aiResult.positiveSignals?.length > 0 && (
                        <div className="flex flex-wrap gap-2">{aiResult.positiveSignals.map((s: string, i: number) => (
                          <span key={i} className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-bold">✓ {s}</span>
                        ))}</div>
                      )}
                      {aiResult.suspiciousPatterns?.length > 0 && (
                        <div className="flex flex-wrap gap-2">{aiResult.suspiciousPatterns.map((s: string, i: number) => (
                          <span key={i} className="px-2 py-1 rounded-lg bg-red-500/10 text-red-500 text-[9px] font-bold">⚠ {s}</span>
                        ))}</div>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Admin Notes */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Admin Notes</p>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add internal notes..."
                    rows={3} className="w-full bg-card border border-border rounded-2xl p-4 text-sm outline-none focus:border-indigo-500 resize-none" />
                </div>

                {/* Actions */}
                {selected.status !== 'approved' && (
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => handleReview(selected._id, 'approve')} disabled={actionLoading}
                      className="flex-1 h-14 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-60">
                      {actionLoading ? <Loader className="h-5 w-5 animate-spin" /> : <><Check className="h-4 w-4" /> Approve</>}
                    </button>
                    <button onClick={() => handleReview(selected._id, 'under_review')} disabled={actionLoading}
                      className="h-14 px-6 rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-500 font-bold text-sm active:scale-95 transition-all disabled:opacity-60">Review</button>
                    <button onClick={() => handleReview(selected._id, 'reject')} disabled={actionLoading}
                      className="h-14 px-6 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-500 font-bold text-sm active:scale-95 transition-all disabled:opacity-60">Reject</button>
                  </div>
                )}
                {selected.status === 'approved' && (
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <Check className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                    <p className="text-sm font-bold text-emerald-500">This NGO has been verified</p>
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
