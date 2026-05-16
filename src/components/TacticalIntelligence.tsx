import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CpuIcon as Cpu, UserGroupIcon as Users, PackageIcon as Package, ZapIcon as Zap, Shield02Icon as Shield, AlertCircleIcon as Alert, Tick01Icon as Check } from 'hugeicons-react'
import { apiRequest } from "../lib/api"
import { cn } from "@/lib/utils"

interface TacticalIntelligenceProps {
  taskId: string;
}

export default function TacticalIntelligence({ taskId }: TacticalIntelligenceProps) {
  const [intel, setIntel] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchIntel = async () => {
      setLoading(true)
      try {
        const res = await apiRequest(`/ai/get-intelligence/${taskId}`)
        if (res.success) {
          setIntel(res.data)
        }
      } catch (err) {
        console.error("Failed to fetch tactical intelligence", err)
      } finally {
        setLoading(false)
      }
    }
    if (taskId) fetchIntel()
  }, [taskId])

  if (loading) {
    return (
      <div className="p-8 space-y-6 bg-secondary/10 rounded-[2rem] border border-dashed border-border animate-pulse">
        <div className="flex items-center gap-3">
          <Cpu className="h-5 w-5 text-indigo-500 animate-spin [animation-duration:3000ms]" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Neural Sync in Progress...</p>
        </div>
        <div className="space-y-4">
          <div className="h-20 bg-secondary/20 rounded-2xl w-full" />
          <div className="h-20 bg-secondary/20 rounded-2xl w-full" />
        </div>
      </div>
    )
  }

  if (!intel) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* --- SUGGESTED TEAM PROTOCOL --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Suggested Team</h3>
          </div>
          <div className="flex items-center gap-2">
             {intel.suggestedTeam?.tier && (
               <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-full">{intel.suggestedTeam.tier}</span>
             )}
             <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full">AI Verified</span>
          </div>
        </div>
        
        <div className="space-y-6">
          {intel.suggestedTeam?.is_split !== undefined ? (
             <>
               {['team_alpha', 'team_beta', 'team_gamma', 'team_delta'].map(teamKey => {
                 const team = intel.suggestedTeam[teamKey];
                 if (!team || team.length === 0) return null;
                 return (
                   <div key={teamKey} className="space-y-3">
                     <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-2">{teamKey.replace('_', ' ')}</h4>
                     {team.map((v: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4 group hover:border-emerald-500/50 transition-all cursor-default">
                          <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-[10px] font-black uppercase relative">
                            {idx + 1}
                            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
                              <Check className="h-1.5 w-1.5 text-slate-900" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-[11px] font-black uppercase tracking-tight truncate">Specialist ID: {v.volunteerId?.substring(0, 8)}</p>
                              <span className="text-[10px] font-black text-emerald-500">{v.matching_score}% Match</span>
                            </div>
                            <p className="text-[9px] font-medium text-muted-foreground/60 leading-relaxed mt-1 line-clamp-1 group-hover:line-clamp-none transition-all italic italic-font">"{v.reasoning}"</p>
                          </div>
                        </div>
                     ))}
                   </div>
                 );
               })}
             </>
          ) : (
             intel.suggestedTeam?.map((v: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-card border border-border flex items-center gap-4 group hover:border-emerald-500/50 transition-all cursor-default">
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-[10px] font-black uppercase relative">
                    {idx + 1}
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
                      <Check className="h-1.5 w-1.5 text-slate-900" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black uppercase tracking-tight truncate">Specialist ID: {v.volunteerId?.substring(0, 8)}</p>
                      <span className="text-[10px] font-black text-emerald-500">{v.matching_score}% Match</span>
                    </div>
                    <p className="text-[9px] font-medium text-muted-foreground/60 leading-relaxed mt-1 line-clamp-1 group-hover:line-clamp-none transition-all italic italic-font">"{v.reasoning}"</p>
                  </div>
                </div>
             ))
          )}
        </div>
      </div>

      {/* --- RECOMMENDED LOADOUT PROTOCOL --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-indigo-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Recommended Loadout</h3>
          </div>
          <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-full">Optimal Gear</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {intel.recommendedInventory?.map((item: any, idx: number) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-900 text-white border border-white/5 flex items-start gap-4">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest">{item.assetName}</p>
                  <p className="text-[10px] font-black text-indigo-400">QTY: {item.quantity}</p>
                </div>
                <p className="text-[9px] font-medium opacity-60 mt-1 leading-relaxed">{item.reasoning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- SYSTEM ALERT (AI-DRIVEN) --- */}
      {((intel.suggestedTeam?.is_split !== undefined && (!intel.suggestedTeam.team_alpha || intel.suggestedTeam.team_alpha.length === 0)) || 
        (intel.suggestedTeam?.is_split === undefined && intel.suggestedTeam?.length === 0)) && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-4 text-rose-500">
          <Alert className="h-5 w-5" />
          <p className="text-[9px] font-black uppercase tracking-widest">Critical Alert: No suitable specialists detected in sector Alpha.</p>
        </div>
      )}
    </motion.div>
  )
}
