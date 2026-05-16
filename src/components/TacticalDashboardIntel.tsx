import * as React from "react"
import { motion } from "framer-motion"
import { Shield02Icon as Shield, AlertCircleIcon as Alert, ZapIcon as Zap, Target01Icon as Target, CpuIcon as Cpu, UserGroupIcon as Users, PackageIcon as Package } from 'hugeicons-react'
import { apiRequest } from "../lib/api"
import { cn } from "@/lib/utils"

export default function TacticalDashboardIntel() {
  const [readiness, setReadiness] = React.useState<any>(null)
  const [directive, setDirective] = React.useState({ focusSector: 'Sector Delta', directive: 'Focus deployments on Sector Delta. Medical resource utilization is peak.' })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchReadiness = async () => {
      try {
        const [taskRes, aiRes] = await Promise.all([
          apiRequest('/tasks'),
          apiRequest('/ai/dashboard-intelligence')
        ])

        if (taskRes.success) {
          const total = taskRes.data.length
          const ready = taskRes.data.filter((t: any) => t.status === 'In Progress' || t.status === 'Completed').length
          const critical = taskRes.data.filter((t: any) => t.priority === 'Critical' && t.status === 'Open').length
          
          setReadiness({
            percentage: total > 0 ? Math.round((ready / total) * 100) : 100,
            criticalTasks: critical,
            totalTasks: total
          })
        }

        if (aiRes.success) {
          setDirective(aiRes.data)
        }
      } catch (err) {
        console.error("Dashboard intel failed", err)
      } finally {
        setLoading(false)
      }
    }
    fetchReadiness()
  }, [])

  if (loading || !readiness) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* --- READINESS GAUGE --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-[2.5rem] p-8 flex items-center gap-8 relative overflow-hidden group shadow-xl shadow-black/5"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
          <Shield className="h-24 w-24" />
        </div>
        <div className="h-20 w-20 rounded-full border-[6px] border-emerald-500/10 flex items-center justify-center relative">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="44" 
              fill="none" stroke="currentColor" strokeWidth="6"
              className="text-emerald-500"
              strokeDasharray={`${readiness.percentage * 2.76} 276`}
            />
          </svg>
          <span className="text-xl font-black">{readiness.percentage}%</span>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Mission Readiness</h4>
          <p className="text-lg font-black uppercase italic">Operational</p>
        </div>
      </motion.div>

      {/* --- CRITICAL ALERTS --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={cn(
          "bg-card border rounded-[2.5rem] p-8 flex items-center gap-6 shadow-xl shadow-black/5",
          readiness.criticalTasks > 0 ? "border-rose-500/50 bg-rose-500/5" : "border-border"
        )}
      >
        <div className={cn(
          "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0",
          readiness.criticalTasks > 0 ? "bg-rose-500 text-white animate-pulse" : "bg-emerald-500/10 text-emerald-500"
        )}>
          {readiness.criticalTasks > 0 ? <Alert className="h-7 w-7" /> : <Zap className="h-7 w-7" />}
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Strategic Risk</h4>
          <p className="text-lg font-black uppercase italic">
            {readiness.criticalTasks > 0 ? `${readiness.criticalTasks} Critical Bottlenecks` : "No Immediate Threats"}
          </p>
        </div>
      </motion.div>

      {/* --- AI SECTOR INSIGHT --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900 text-white border border-white/5 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-2xl"
      >
        <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
          <Cpu className="h-7 w-7" />
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Neural Directive</h4>
          <p className="text-sm font-bold leading-tight mt-1">
            Focus deployments on <span className="text-indigo-400">{directive.focusSector}</span>. {directive.directive.split(directive.focusSector)[1] || directive.directive}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
