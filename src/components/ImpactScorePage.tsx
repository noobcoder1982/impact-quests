import * as React from "react"
import { motion } from "framer-motion"
import { 
  AnalyticsUpIcon as TrendingUp, 
  FlashIcon as Zap, 
  Target01Icon as Target, 
  Activity01Icon as Activity, 
  Share02Icon as Share2, 
  ArrowUpRight01Icon as ArrowUpRight, 
  GlobeIcon as Globe, 
  UserGroupIcon as Users 
} from "hugeicons-react"
import { Button } from "./ui/button"

export default function ImpactScorePage() {
  const stats = [
    { label: "Community Value", value: "$4.2M", change: "+12.4%", icon: Globe },
    { label: "Volunteer Synergy", value: "98.2", change: "+5.1%", icon: Users },
    { label: "Operational Speed", value: "x2.4", change: "+24%", icon: Activity },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-10 font-body transition-all">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest mb-4">
               Real-time Operational Metrics
            </div>
            <h1 className="text-6xl font-display leading-[0.85] tracking-tighter italic font-light">
              Impact <span className="not-italic font-bold">Dynamics</span>
            </h1>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="rounded-full h-12 px-6 gap-2 font-bold shadow-sm">
                <Share2 className="h-4 w-4" /> Export Ledger
             </Button>
             <Button className="rounded-full h-12 px-8 font-black bg-foreground text-background shadow-xl hover:bg-accent hover:text-white transition-all">
                Sync Core Grid
             </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           {stats.map((stat, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="p-10 rounded-[3rem] border border-border bg-background shadow-xl relative overflow-hidden group hover:border-accent/40 transition-all"
             >
                <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-150 group-hover:rotate-12">
                   <stat.icon className="h-24 w-24" />
                </div>
                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center mb-10 group-hover:bg-accent/10 transition-colors">
                   <stat.icon className="h-6 w-6 text-muted-foreground group-hover:text-accent" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">{stat.label}</div>
                <div className="flex items-baseline gap-4">
                   <div className="text-4xl font-bold tracking-tighter">{stat.value}</div>
                   <div className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">{stat.change}</div>
                </div>
             </motion.div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-96 mb-20">
           <div className="p-10 rounded-[3.5rem] bg-secondary/10 border border-border/50 shadow-inner flex flex-col justify-between group">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-2xl font-bold tracking-tight">Kinetic Force Propensity</h3>
                 <Zap className="h-6 w-6 text-accent animate-pulse" />
              </div>
              <div className="flex-1 flex items-end gap-3 px-4">
                 {[60, 40, 90, 70, 45, 80, 55, 95, 40, 75, 50, 85].map((h, i) => (
                   <motion.div
                     key={i}
                     initial={{ height: 0 }}
                     animate={{ height: `${h}%` }}
                     transition={{ delay: i * 0.05, duration: 1 }}
                     className="flex-1 bg-accent/20 rounded-t-xl group-hover:bg-accent/40 transition-colors relative"
                   >
                      {i === 7 && <div className="absolute top-0 left-0 w-full h-1 bg-accent shadow-[0_0_15px_rgba(99,102,241,1)]" />}
                   </motion.div>
                 ))}
              </div>
              <div className="flex justify-between mt-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 px-2">
                 <span>Sector 1</span>
                 <span>Operational Peak</span>
                 <span>Sector 12</span>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-6">
              {[
                { label: "Target Accuracy", value: "99.4%", desc: "Precision in mission directives fulfillment.", color: "accent" },
                { label: "Deployment Velocity", value: "14.2m", desc: "Average time to full squad mobilization.", color: "emerald" },
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-[2.5rem] border border-border bg-background shadow-md flex items-center justify-between group cursor-default">
                   <div className="flex-1">
                      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{item.label}</div>
                      <div className={`text-4xl font-bold tracking-tighter mb-2 group-hover:text-${item.color === 'accent' ? 'accent' : 'emerald-600'} transition-colors`}>{item.value}</div>
                      <p className="text-xs text-muted-foreground font-medium max-w-[200px] leading-relaxed">{item.desc}</p>
                   </div>
                   <div className={`h-16 w-16 rounded-3xl bg-${item.color === 'accent' ? 'accent/5' : 'emerald-500/5'} border border-border flex items-center justify-center shrink-0`}>
                      <Target className={`h-8 w-8 ${item.color === 'accent' ? 'text-accent' : 'text-emerald-500'}`} />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}
