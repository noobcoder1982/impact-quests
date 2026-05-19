import * as React from "react"
import { motion } from "framer-motion"
import {
  UserGroupIcon as Users, Search01Icon as Search, Loading02Icon as Loader,
  Shield01Icon as Shield, Cancel01Icon as Ban, CheckmarkCircle01Icon as Check,
  AnalyticsUpIcon as TrendingUp, Time01Icon as Clock,
} from "hugeicons-react"
import { cn } from "@/lib/utils"
import { apiRequest } from "../../lib/api"

type Volunteer = {
  _id: string; name: string; email: string; pfp?: string
  points: number; level: number; trustScore: number; reliabilityScore: number
  tasksCompleted: number; createdAt: string; isSuspended?: boolean
  isOnboarded: boolean; currentStreak: number
}

export default function VolunteerPanel({ showToast }: { showToast: (msg: string) => void }) {
  const [volunteers, setVolunteers] = React.useState<Volunteer[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [sort, setSort] = React.useState('points')
  const [statusFilter, setStatusFilter] = React.useState('all')
  const [page, setPage] = React.useState(1)
  const [pagination, setPagination] = React.useState<any>(null)

  const fetchVolunteers = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '30', sort })
      if (search) params.set('search', search)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await apiRequest(`/admin/volunteers?${params}`)
      setVolunteers(res.data?.volunteers || [])
      setPagination(res.data?.pagination || null)
    } catch (err: any) { showToast(err.message) }
    finally { setLoading(false) }
  }, [page, sort, search, statusFilter])

  React.useEffect(() => { fetchVolunteers() }, [fetchVolunteers])

  const handleSuspend = async (userId: string, name: string) => {
    if (!confirm(`Suspend ${name}?`)) return
    try {
      await apiRequest('/admin/volunteers/suspend', { method: 'POST', body: JSON.stringify({ userId, reason: 'Suspended by admin' }) })
      showToast(`${name} suspended`); fetchVolunteers()
    } catch (err: any) { showToast(err.message) }
  }

  const handleUnsuspend = async (userId: string) => {
    try {
      await apiRequest('/admin/volunteers/unsuspend', { method: 'POST', body: JSON.stringify({ userId }) })
      showToast('Volunteer restored'); fetchVolunteers()
    } catch (err: any) { showToast(err.message) }
  }

  const trustColor = (score: number) => score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500'

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Volunteers</h2>
          <p className="text-sm text-muted-foreground/60 mt-1">Manage and moderate volunteer accounts</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search..."
              className="h-11 pl-11 pr-4 bg-card border border-border rounded-xl text-sm outline-none focus:border-indigo-500 w-60" />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="h-11 px-4 bg-card border border-border rounded-xl text-sm outline-none appearance-none cursor-pointer">
            <option value="points">Top Points</option>
            <option value="trust">Trust Score</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        {['all', 'active', 'suspended'].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
            className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all capitalize",
              statusFilter === s ? "bg-foreground text-background" : "bg-card border-border text-muted-foreground hover:text-foreground"
            )}>{s}</button>
        ))}
        {pagination && <span className="ml-auto text-[10px] font-bold text-muted-foreground/40 self-center">{pagination.total} total</span>}
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader className="h-8 w-8 animate-spin text-indigo-500" /></div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-4 px-6 py-3 border-b border-border/40 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
            <span>Volunteer</span><span>Level / XP</span><span>Trust Score</span><span>Tasks</span><span>Joined</span><span>Actions</span>
          </div>
          {volunteers.map((v, i) => (
            <motion.div key={v._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
              className={cn("grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-4 px-6 py-4 border-b border-border/20 items-center transition-all",
                v.isSuspended ? "bg-red-500/5 opacity-60" : "hover:bg-secondary/20"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                  {v.pfp ? <img src={v.pfp} className="h-full w-full object-cover" /> : <Users className="h-4 w-4 text-muted-foreground/40" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm truncate">{v.name}</p>
                    {v.isSuspended && <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[8px] font-black uppercase">Suspended</span>}
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 truncate">{v.email}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold">Lv.{v.level}</p>
                <p className="text-[10px] text-muted-foreground/40">{v.points.toLocaleString()} XP</p>
              </div>
              <p className={cn("text-lg font-black", trustColor(v.trustScore))}>{v.trustScore}</p>
              <p className="text-sm font-medium">{v.tasksCompleted}</p>
              <p className="text-xs text-muted-foreground/50">{new Date(v.createdAt).toLocaleDateString()}</p>
              <div>
                {v.isSuspended ? (
                  <button onClick={() => handleUnsuspend(v._id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase hover:bg-emerald-500/20 transition-all">Restore</button>
                ) : (
                  <button onClick={() => handleSuspend(v._id, v.name)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-[9px] font-black uppercase hover:bg-red-500/20 transition-all">Suspend</button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: Math.min(pagination.pages, 5) }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={cn("h-10 w-10 rounded-xl text-sm font-bold transition-all",
                page === i + 1 ? "bg-indigo-600 text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              )}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  )
}
