import * as React from "react"
import { motion } from "framer-motion"
import { Zap, Users, MapPin, Clock, ArrowUpRight, Shield, Target, Activity } from "lucide-react"
import { Button } from "./ui/button"

export default function TeamMissionsPage() {
  const missions = [
    { title: "Grid Restoration", sector: "Sector 4", urgency: "Critical", team: "Alpha-9", activity: "Active", progress: 75 },
    { title: "Supply Chain", sector: "Sector 2", urgency: "Standard", team: "Beta-3", activity: "Cooldown", progress: 100 },
    { title: "Education Relay", sector: "Sector 9", urgency: "Low", team: "Gamma-1", activity: "Deploying", progress: 20 },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-10 font-body transition-all">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4">
             <div className="h-8 w-8 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-accent" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Squad Coordination Hub</span>
          </div>
          <h1 className="text-6xl font-display italic font-light tracking-tighter leading-none mb-6">
            Team <span className="not-italic font-bold">Vector</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl font-medium leading-relaxed italic">
            "Strategic deployment of specialized squads across multi-disciplinary target zones."
          </p>
        </header>

        <div className="space-y-8">
           {missions.map((mission, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.1 }}
               className="group p-8 rounded-[3.5rem] border border-border bg-background hover:bg-secondary/10 transition-all cursor-pointer relative overflow-hidden"
             >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
                   <div className="flex items-center gap-8 flex-1">
                      <div className="h-20 w-20 rounded-3xl bg-secondary flex items-center justify-center border border-border group-hover:bg-accent/10 transition-colors shrink-0">
                         <Zap className={`h-10 w-10 ${mission.activity === 'Active' ? 'text-accent animate-pulse' : 'text-muted-foreground/30'}`} />
                      </div>
                      <div className="overflow-hidden">
                         <h3 className="text-3xl font-semibold tracking-tight transition-colors group-hover:text-accent truncate">{mission.title}</h3>
                         <div className="flex items-center gap-6 mt-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                               <MapPin className="h-3 w-3" /> {mission.sector}
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                               <Shield className="h-3 w-3" /> {mission.team}
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="flex flex-wrap items-center gap-12 shrink-0">
                      <div className="flex flex-col gap-1 min-w-[120px]">
                         <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Operational Status</span>
                         <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${mission.activity === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/50'}`} />
                            <span className="text-sm font-black">{mission.activity}</span>
                         </div>
                      </div>
                      
                      <div className="flex flex-col gap-1 min-w-[180px]">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 opacity-40">
                            <span>Mission Progress</span>
                            <span>{mission.progress}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden border border-border/50">
                            <div className={`h-full bg-accent rounded-full`} style={{ width: `${mission.progress}%` }} />
                         </div>
                      </div>

                      <Button className="rounded-full h-14 px-8 font-black tracking-tight text-lg shadow-xl shadow-black/5 hover:bg-foreground hover:text-background transition-all">
                         Join Ops <ArrowUpRight className="ml-2 h-5 w-5" />
                      </Button>
                   </div>
                </div>
                
                {/* Background Decoration */}
                <div className="absolute -bottom-10 -right-10 h-64 w-64 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Target className="h-full w-full rotate-12" />
                </div>
             </motion.div>
           ))}

           <button className="w-full p-8 rounded-[3rem] border-2 border-dashed border-border/50 text-muted-foreground/40 hover:text-accent hover:border-accent/40 transition-all font-display text-2xl italic tracking-tight">
              + Initialize New Team Mission Protocol
           </button>
        </div>
      </div>
    </div>
  )
}
