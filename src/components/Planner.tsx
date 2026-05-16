import * as React from "react"
import { motion } from "framer-motion"
import { 
  History, 
  Calendar, 
  MoreHorizontal, 
  Clock, 
  Activity, 
  Users, 
  Settings, 
  Zap, 
  ArrowRight,
  ChevronDown
} from "lucide-react"

const timelineTasks = [
  { label: "Data Pipeline R&D", color: "#10b981", startAt: "12%", width: "25%", avatars: 3 },
  { label: "Logic Validation", color: "#06b6d4", startAt: "24%", width: "33%", avatars: 2 },
  { label: "Usability Testing", color: "#06b6d4", startAt: "75%", width: "25%", avatars: 1 },
  { label: "Model Training", color: "#8b5cf6", startAt: "0%", width: "25%", avatars: 2 },
  { label: "Edge Deployment", color: "#8b5cf6", startAt: "45%", width: "28%", avatars: 4, spotlight: true },
  { label: "Syncing & Optimization", color: "#f97316", startAt: "66%", width: "22%", avatars: 1 }
]

export default function Planner() {
  return (
    <div className="min-h-screen bg-background font-body text-foreground pb-20 pt-24 overflow-x-hidden">
      <div className="max-w-[1700px] mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-20 lg:w-48 shrink-0 flex flex-col gap-6 pt-8">
          <div className="flex flex-col gap-2">
             <div className="p-3 bg-foreground text-background rounded-2xl w-fit mb-4">
                <Zap className="h-6 w-6" />
             </div>
             <div className="flex flex-col gap-1">
                {[
                  { icon: Activity, label: "Overview", active: false },
                  { icon: Users, label: "Agents", active: false },
                  { icon: Calendar, label: "Schedule", active: true },
                  { icon: History, label: "History", active: false },
                  { icon: Settings, label: "Control", active: false }
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${item.active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/40'}`}>
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium hidden lg:block">{item.label}</span>
                  </div>
                ))}
             </div>
          </div>
        </aside>

        {/* Main Timeline Area */}
        <main className="flex-1 min-w-0 flex flex-col pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                <span>Infrastructure</span>
                <span className="opacity-30">/</span>
                <span>Node Clusters</span>
                <span className="opacity-30">/</span>
                <span className="text-foreground">Execution Graph</span>
              </div>
              <h2 className="font-display text-5xl leading-none">Agent <span className="italic font-light">Roadmap</span></h2>
            </div>

            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 pr-6 border-r border-border/50">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">Status:</span>
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(idx => (
                      <div key={idx} className="h-8 w-8 rounded-full border-2 border-background overflow-hidden bg-secondary">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=agent-${idx}`} alt="Agent" />
                      </div>
                    ))}
                  </div>
               </div>
               <div className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-border bg-background shadow-sm text-sm font-medium">
                  <Calendar className="h-4 w-4" /> 
                  April 2026
                  <ChevronDown className="h-4 w-4 opacity-50" />
               </div>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="relative border border-border/60 rounded-3xl bg-background/50 backdrop-blur-sm shadow-2xl overflow-hidden p-1">
             <div className="bg-background rounded-2xl overflow-hidden border border-border/40">
                {/* Horizontal Day Headers */}
                <div className="grid grid-cols-10 h-20 border-b border-border/40 bg-secondary/30">
                   {['T10', 'F11', 'S12', 'S13', 'M14', 'W15', 'T16', 'F17', 'S18', 'S19'].map((day, i) => (
                     <div key={day} className={`flex flex-col items-center justify-center text-[10px] font-bold uppercase tracking-widest ${i === 6 ? 'bg-background text-accent' : 'text-muted-foreground'}`}>
                        <span className="opacity-40">{day[0]}</span>
                        <span className="text-sm mt-0.5">{day.substring(1)}</span>
                     </div>
                   ))}
                </div>

                {/* Grid Body */}
                <div className="relative h-[480px]">
                   {/* Column Lines */}
                   <div className="absolute inset-0 grid grid-cols-10">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className={`border-r border-border/30 h-full ${i === 2 || i === 3 ? 'bg-secondary/10' : ''}`} />
                      ))}
                   </div>

                   {/* Current Time Line */}
                   <div className="absolute top-0 bottom-0 w-px bg-accent z-40 pointer-events-none" style={{ left: '65%' }}>
                      <div className="absolute top-4 -left-7 bg-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-lg uppercase">
                        Active
                      </div>
                      <div className="absolute bottom-4 -left-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-accent/20" />
                   </div>

                   {/* Task Pills */}
                   <div className="relative p-6 space-y-4">
                      {timelineTasks.map((task, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`absolute h-14 rounded-2xl flex items-center px-4 text-xs font-semibold text-white shadow-xl transition-transform hover:scale-[1.02] cursor-pointer`}
                          style={{
                            top: `${(i * 70) + 40}px`,
                            left: task.startAt,
                            width: task.width,
                            backgroundColor: task.color,
                            boxShadow: task.spotlight ? `0 10px 30px -5px ${task.color}55` : "none",
                            zIndex: task.spotlight ? 10 : 1
                          }}
                        >
                           <div className="flex -space-x-1.5 mr-3">
                              {[...Array(task.avatars)].map((_, idx) => (
                                <div key={idx} className="h-6 w-6 rounded-full border-2 border-white/20 bg-background/20 overflow-hidden">
                                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=sub-${i}-${idx}`} alt="avatar" />
                                </div>
                              ))}
                           </div>
                           <span className="truncate">{task.label}</span>
                        </motion.div>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </main>

        {/* Right Details Panel */}
        <aside className="w-full md:w-80 shrink-0 pt-8 flex flex-col gap-8">
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col"
           >
              <h3 className="text-3xl font-semibold mb-6 tracking-tight">Deployment <br/><span className="italic font-light font-display">Optimization</span></h3>
              
              <div className="space-y-6">
                 {[
                   { label: "Assigned Nodes", value: "8 Active Clusters", icon: Activity },
                   { label: "Predictive Success", value: "94.2%", icon: Zap },
                   { label: "Latency Redux", value: "-140ms", icon: Clock },
                 ].map((stat, i) => (
                   <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl border border-border group hover:border-accent/30 transition-colors">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                         <stat.icon className="h-3 w-3" />
                         {stat.label}
                      </div>
                      <div className="text-lg font-semibold">{stat.value}</div>
                   </div>
                 ))}
              </div>

              <div className="mt-12 bg-foreground text-background p-6 rounded-3xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12 transition-transform group-hover:scale-[2] duration-700">
                    <Zap className="h-20 w-20 fill-current" />
                 </div>
                 <h4 className="text-lg font-semibold mb-2 relative z-10">Nexora Pro</h4>
                 <p className="text-background/60 text-sm mb-6 relative z-10 font-medium">Upgrade to access multi-region agent deployment and live syncing.</p>
                 <Button className="w-full rounded-2xl bg-background text-foreground hover:bg-background/90 group relative z-10 font-bold">
                    View Pricing <ArrowRight className="h-4 w-4 ml-2" />
                 </Button>
              </div>
           </motion.div>
        </aside>
      </div>
    </div>
  )
}
