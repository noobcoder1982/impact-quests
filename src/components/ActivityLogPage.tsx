import * as React from "react"
import { motion } from "framer-motion"
import { 
  Search01Icon as Search, 
  FilterIcon as Filter, 
  Download01Icon as Download, 
  ArrowRight01Icon as ChevronRight, 
  UserIcon as User, 
  Time01Icon as Clock, 
  Target01Icon as Target, 
  CheckmarkCircle01Icon as CheckCircle2, 
  AlertCircleIcon as AlertCircle,
  More02Icon as MoreVertical,
  Activity01Icon as ActivityIcon,
  FlashIcon as Zap,
  FavouriteIcon as Heart,
  UserGroupIcon as Users
} from "hugeicons-react"
import { Button } from "./ui/button"

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
}

const mockLogs = [
  { id: 1, user: "Alex Grey", activity: "Completed Mentor Check-in", time: "2m ago", type: "Mission", status: "Verified", xp: "+500", color: "text-emerald-500", icon: CheckCircle2 },
  { id: 2, user: "Emma Park", activity: "Requested Forest Restoration Slot", time: "12m ago", type: "Shift", status: "Pending", xp: "+0", color: "text-amber-500", icon: Clock },
  { id: 3, user: "Tom Hunt", activity: "Verified 3 new volunteer applications", time: "1h ago", type: "Admin", status: "Verified", xp: "+150", color: "text-emerald-500", icon: CheckCircle2 },
  { id: 4, user: "Systems", activity: "Critical Sync: Sector 4 Data recalculated", time: "2h ago", type: "System", status: "Auto", xp: "+0", color: "text-blue-500", icon: Zap },
  { id: 5, user: "Sarah Connor", activity: "Started 'Crisis Response' Training", time: "3h ago", type: "Training", status: "Active", xp: "+50", color: "text-indigo-500", icon: PlayIcon }, // I'll use ActivityIcon as fallback
  { id: 6, user: "John Doe", activity: "Abandoned Park Cleanup Shift", time: "5h ago", type: "Penalty", status: "Failed", xp: "-200", color: "text-rose-500", icon: AlertCircle },
]

function PlayIcon({ className }: { className?: string }) {
    return <ActivityIcon className={className} />
}

export default function ActivityLogPage() {
  return (
    <div className="flex-1 bg-background font-body overflow-y-auto transition-colors duration-500 selection:bg-indigo-500/10 h-screen scrollbar-hide py-10 px-8">
      <main className="max-w-[1700px] mx-auto space-y-10 pb-32">
        
        {/* Activity Log Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
           <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <div className="h-10 w-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-600/20">
                    <ActivityIcon className="h-5 w-5 text-indigo-600" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 leading-none">Strategic Systems</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                Activity <span className="font-display italic font-medium text-indigo-600">Protocol</span>
              </h1>
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                 <input 
                   type="text" 
                   placeholder="Search tactical logs..." 
                   className="w-full h-11 bg-card/50 border border-border/60 rounded-full pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-600/50 transition-all shadow-sm"
                 />
              </div>
              <Button variant="outline" className="h-11 px-5 rounded-full border-border/60 bg-card/50 text-foreground font-bold gap-2 hover:bg-secondary transition-all">
                 <Filter className="h-4 w-4" /> Filter
              </Button>
              <Button variant="outline" className="h-11 px-5 rounded-full border-border/60 bg-card/50 text-foreground font-bold gap-2 hover:bg-secondary transition-all">
                 <Download className="h-4 w-4" /> Export
              </Button>
           </div>
        </div>

        {/* Tactical Log Grid */}
        <div className="grid grid-cols-1 gap-6">
           <motion.div 
             {...fadeInUp}
             className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm"
           >
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-border/30 bg-secondary/10">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Timestamp</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Initiator</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Strategic Activity</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Protocol</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Status</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Impact XP</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                       {mockLogs.map((log, i) => (
                         <motion.tr 
                           key={log.id} 
                           initial={{ opacity: 0, x: -10 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: i * 0.05 }}
                           className="group hover:bg-secondary/20 transition-all cursor-pointer"
                         >
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-3">
                                  <Clock className="h-3.5 w-3.5 text-muted-foreground/40" />
                                  <span className="text-xs font-bold text-muted-foreground/60">{log.time}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-secondary overflow-hidden border border-border/50">
                                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user}`} alt="U" />
                                  </div>
                                  <span className="text-sm font-bold text-foreground group-hover:text-indigo-600 transition-colors">{log.user}</span>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className="text-sm font-medium text-muted-foreground leading-snug">{log.activity}</span>
                            </td>
                            <td className="px-8 py-6">
                               <span className="text-[10px] font-black uppercase tracking-widest bg-secondary/40 px-3 py-1 rounded-full border border-border/40 text-muted-foreground/70">
                                  {log.type}
                               </span>
                            </td>
                            <td className="px-8 py-6">
                               <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${log.color}`}>
                                  <log.icon className="h-3.5 w-3.5" />
                                  {log.status}
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className={`text-sm font-black tracking-tight ${log.xp.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {log.xp}
                               </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <button className="h-8 w-8 rounded-full hover:bg-card flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </td>
                         </motion.tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <div className="bg-secondary/10 px-8 py-5 flex items-center justify-between border-t border-border/30">
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Showing 6 of 14,208 Log Entities</span>
                 <div className="flex items-center gap-2">
                    <button className="h-8 w-16 rounded-full border border-border text-[9px] font-black uppercase tracking-widest hover:bg-card transition-all disabled:opacity-30" disabled>Prev</button>
                    <button className="h-8 w-16 rounded-full border border-border text-[9px] font-black uppercase tracking-widest hover:bg-card transition-all">Next</button>
                 </div>
              </div>
           </motion.div>
        </div>

        {/* Global Analytics Overview (Bottom Row) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: "Deployment Velocity", val: "1.4m/s", icon: Zap, color: "text-indigo-600" },
             { label: "Network Reliability", val: "99.9%", icon: Target, color: "text-emerald-500" },
             { label: "Community Entropy", val: "Low", icon: Users, color: "text-amber-500" }
           ].map((stat, i) => (
             <motion.div 
               key={i} 
               {...fadeInUp}
               transition={{ delay: 0.3 + i * 0.1 }}
               className="bg-card border border-border rounded-[2rem] p-8 flex items-center gap-6 group hover:border-indigo-500/30 transition-all shadow-sm"
             >
                <div className={`h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-indigo-600/10 transition-all`}>
                   <stat.icon className={`h-7 w-7 ${stat.color} group-hover:scale-110 transition-transform`} />
                </div>
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">{stat.label}</div>
                   <div className="text-2xl font-black text-foreground">{stat.val}</div>
                </div>
             </motion.div>
           ))}
        </div>

      </main>
    </div>
  )
}
