import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FavouriteIcon as Heart, 
  GiftIcon as Gift, 
  Share02Icon as Share2, 
  Calendar01Icon as Calendar, 
  ArrowUpRight01Icon as ArrowUpRight, 
  Add01Icon as Plus, 
  TimeScheduleIcon as History, 
  AnalyticsUpIcon as TrendingUp, 
  SparklesIcon as Sparkles,
  FlashIcon as Zap,
  Package01Icon as Package,
  Time01Icon as Clock,
  Share01Icon as ExternalLink
} from "hugeicons-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
}

const stats = [
  { label: "Items Contributed", value: "248", sub: "+14 this month", icon: Package, color: "text-indigo-600", bg: "bg-indigo-600/10" },
  { label: "Mission Hours", value: "1,240", sub: "Sector Top 5%", icon: Clock, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Social Outreach", value: "89", sub: "High Resilience", icon: Share2, color: "text-rose-500", bg: "bg-rose-500/10" }
]

const activities = [
  { title: "Tactical Equipment - Sector 4", date: "Oct 14, 2026", type: "Heavy Material", impact: "High", xp: "+500", color: "bg-indigo-600" },
  { title: "Strategic Mentorship: Logic Design", date: "Oct 12, 2026", type: "Intelligence Service", impact: "Medium", xp: "+250", color: "bg-emerald-500" },
  { title: "Community Kitchen Deployment", date: "Oct 10, 2026", type: "Tactical Field Ops", impact: "Critical", xp: "+1,200", color: "bg-rose-500" },
  { title: "Reforestation Sync: Peak Hill", date: "Oct 08, 2026", type: "Environmental Resto", impact: "Standard", xp: "+400", color: "bg-amber-500" },
  { title: "Urban Safety Audit Hub", date: "Oct 04, 2026", type: "Administrative Grid", impact: "Low", xp: "+150", color: "bg-blue-500" }
]

export default function ContributionsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-background font-body text-foreground pb-32 h-screen scrollbar-hide py-10 px-8">
      <main className="max-w-[1700px] mx-auto space-y-12">
        
        {/* Cinematic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16">
           <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                 <div className="h-10 w-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 border border-indigo-600/20 shadow-inner">
                    <Heart className="h-5 w-5" />
                 </div>
                 <span className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 leading-none">Social Impact Protocol</span>
              </motion.div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-none">
                Active <span className="font-display italic font-medium text-indigo-600">Contributions</span>
              </h1>
           </div>
           <Button className="h-16 px-10 rounded-[2rem] bg-indigo-600 text-white font-bold gap-3 shadow-2xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all mb-2">
              <Plus className="h-5 w-5" /> Register Protocol
           </Button>
        </div>

        {/* Dynamic Impact Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {stats.map((stat, i) => (
             <motion.div 
               key={i} 
               {...fadeInUp}
               transition={{ delay: i * 0.1 }}
               className="p-10 rounded-[3rem] border border-border/60 bg-card group hover:border-indigo-600/30 hover:shadow-2xl transition-all relative overflow-hidden"
             >
                <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-600/0 rounded-full blur-3xl group-hover:bg-indigo-600/[0.03] transition-colors" />
                <div className={cn("h-16 w-16 rounded-[2rem] flex items-center justify-center mb-8 border border-border/40 group-hover:scale-110 transition-transform shadow-inner", stat.bg)}>
                   <stat.icon className={cn("h-8 w-8", stat.color)} />
                </div>
                <div className="space-y-1">
                   <div className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 leading-none mb-2">{stat.label}</div>
                   <div className="text-5xl font-black text-foreground tracking-tight italic">{stat.value}</div>
                   <div className="text-[10px] font-bold text-indigo-600/60 uppercase tracking-widest pt-2 flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" /> {stat.sub}
                   </div>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Detailed Strategic Log */}
        <div className="pt-20">
           <div className="flex justify-between items-end mb-12 px-2">
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-indigo-600">
                    <History className="h-5 w-5" />
                    <h3 className="text-2xl font-bold tracking-tight">Recent Strategic Syncs</h3>
                 </div>
                 <p className="text-sm font-medium text-muted-foreground">Detailed history of deployed resources and tactical support.</p>
              </div>
              <div className="flex bg-secondary/30 p-1 rounded-2xl border border-border">
                {['Live', 'History', 'Archives'].map(t => <button key={t} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${t === 'Live' ? 'bg-foreground text-background shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>)}
              </div>
           </div>

           <div className="space-y-6">
              {activities.map((item, i) => (
                <motion.div 
                  key={i} 
                  {...fadeInUp}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="group relative p-8 rounded-[2.5rem] border border-border/60 bg-card hover:bg-secondary/20 hover:border-indigo-600/20 transition-all flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm overflow-hidden"
                >
                   <div className="absolute top-0 left-0 w-2 h-full group-hover:bg-indigo-600 transition-colors" />
                   <div className="flex items-center gap-8 w-full md:w-auto">
                      <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center border border-border text-2xl font-black text-foreground group-hover:bg-indigo-600 group-hover:text-white transition-all italic shadow-inner">
                         0{activities.length - i}
                      </div>
                      <div className="min-w-0 flex-1">
                         <h4 className="font-bold text-xl text-foreground tracking-tight group-hover:text-indigo-600 mb-1 transition-colors">{item.title}</h4>
                         <div className="flex flex-wrap items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600/60">{item.type}</span>
                            <div className="h-1 w-1 bg-border rounded-full" />
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                               <Calendar className="h-3 w-3" /> {item.date}
                            </div>
                            <div className="h-1 w-1 bg-border rounded-full" />
                            <div className={cn("px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase border", "text-" + item.color.split('-')[1] + "-600 border-" + item.color.split('-')[1] + "-600/20")}>
                               {item.impact} IMPACT
                            </div>
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-6 md:pt-0 border-border/40">
                      <div className="text-right">
                         <div className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest mb-1 leading-none">Protocol Reward</div>
                         <div className="text-2xl font-black text-foreground italic">{item.xp} <span className="text-xs text-indigo-600/60 ml-0.5">XP</span></div>
                      </div>
                      <button className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm group/btn">
                         <ExternalLink className="h-6 w-6 group-hover/btn:scale-110 transition-transform" />
                      </button>
                   </div>
                </motion.div>
              ))}
           </div>
           
           <button className="w-full mt-12 py-8 rounded-[2.5rem] border border-dashed border-border/60 hover:border-indigo-600/40 hover:bg-indigo-600/[0.02] flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.4em] text-muted-foreground/40 hover:text-indigo-600 transition-all">
              <Plus className="h-4 w-4" /> Load Strategic Archive <Sparkles className="h-4 w-4" />
           </button>
        </div>
      </main>
    </div>
  )
}
