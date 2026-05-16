import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Add01Icon as Plus, 
  More02Icon as MoreVertical, 
  Search01Icon as Search, 
  FilterIcon as Filter, 
  FlashIcon as Zap, 
  UserGroupIcon as Users, 
  GlobeIcon as Globe, 
  Shield01Icon as ShieldCheck, 
  ArrowUpRight01Icon as ArrowUpRight,
  FavouriteIcon as Heart,
  DropletIcon as Droplets,
  Book01Icon as BookOpen,
  Target01Icon as Target,
  Time01Icon as Clock,
  Briefcase01Icon as Briefcase,
  SparklesIcon as Sparkles,
  Location01Icon as MapPin,
  ArrowRight01Icon as ChevronRight,
  FilterIcon as FilterX
} from "hugeicons-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

import { apiRequest } from "../lib/api"

const categoryToSector: Record<string, string> = {
  'disaster-relief': 'Crisis Support',
  'education': 'Education',
  'healthcare': 'Medical',
  'environment': 'Environment',
  'community': 'Social',
  'logistics': 'Social',
  'technical': 'Social',
  'other': 'Social'
}

const categoryToIcon: Record<string, any> = {
  'disaster-relief': Heart,
  'environment': Droplets,
  'education': BookOpen,
  'healthcare': ShieldCheck,
  'logistics': Briefcase,
  'technical': Zap,
  'other': Target
}

const urgencyToDifficulty: Record<string, string> = {
  'low': 'Light',
  'medium': 'Standard',
  'high': 'Tactical',
  'critical': 'Critical'
}

const colorMap: Record<string, string> = {
  'disaster-relief': 'bg-rose-500',
  'environment': 'bg-emerald-500',
  'education': 'bg-blue-500',
  'healthcare': 'bg-indigo-500',
  'technical': 'bg-amber-500',
  'other': 'bg-purple-500'
}

const sectors = ["All Sectors", "Environment", "Education", "Crisis Support", "Social", "Medical"]

export default function Marketplace() {
  const [quests, setQuests] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedSector, setSelectedSector] = React.useState("All Sectors")
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await apiRequest('/tasks', { method: 'GET' })
        if (response.success) {
          const transformed = response.data.map((task: any) => ({
            id: task._id,
            title: task.title,
            description: task.description,
            sector: categoryToSector[task.category] || 'Social',
            reward: `${(task.maxVolunteers || 1) * 100} XP`, // Pseudo reward
            difficulty: urgencyToDifficulty[task.urgency] || 'Standard',
            status: task.status === 'open' ? 'Available' : 'Assigned',
            icon: categoryToIcon[task.category] || Target,
            color: colorMap[task.category] || 'bg-purple-500',
            participants: task.assignedVolunteers?.length || 0
          }))
          setQuests(transformed)
        }
      } catch (err) {
        console.error("Failed to fetch tasks", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTasks()
  }, [])

  const filteredQuests = quests.filter(q => 
    (selectedSector === "All Sectors" || q.sector === selectedSector) &&
    (q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <>
    {/* ════════════════════════════════════════════════════════════════
        MOBILE MARKETPLACE  (md:hidden)
    ════════════════════════════════════════════════════════════════ */}
    <div className="md:hidden flex flex-col h-full bg-background text-foreground overflow-hidden">

      {/* ── Sticky header + search + filters ── */}
      <div className="shrink-0 px-5 pt-12 pb-4 bg-background border-b border-border/40">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400/70 mb-0.5">Global Mission Protocol</p>
            <h1 className="text-2xl font-black tracking-tighter text-foreground">Marketplace</h1>
          </div>
          <motion.div
            whileTap={{ scale: 0.92 }}
            className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/30 cursor-pointer active:scale-90 transition-all"
          >
            <Plus className="h-5 w-5 text-white" />
          </motion.div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search missions..."
            className="w-full h-12 bg-card border border-border/50 rounded-2xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-muted-foreground/40"
          />
        </div>

        {/* Sector pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {sectors.map(sector => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-95",
                selectedSector === sector
                  ? "bg-foreground text-background shadow-lg"
                  : "bg-secondary/40 text-muted-foreground border border-border/40"
              )}
            >{sector}</button>
          ))}
        </div>
      </div>

      {/* ── Mission list ── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pt-5 pb-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 rounded-[2rem] bg-card border border-border/40 animate-pulse" />
            ))}
          </div>
        ) : filteredQuests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="h-16 w-16 rounded-[2rem] bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-indigo-400" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">No missions found</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {filteredQuests.map((quest, i) => (
                <motion.div
                  layout
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 340, damping: 28, delay: i * 0.05 }}
                  whileHover={{ y: -5, scale: 1.01 }}
                  className="relative bg-card border border-border/50 rounded-[2rem] p-5 overflow-hidden group cursor-pointer active:scale-[0.98] transition-all"
                >
                  {/* corner dot */}
                  <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-border group-hover:bg-indigo-600 transition-colors" />

                  {/* top row */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={cn(
                      "h-12 w-12 rounded-[1.25rem] flex items-center justify-center shrink-0 border border-border/40",
                      quest.color + "/10"
                    )}>
                      <quest.icon className={cn("h-6 w-6", quest.color.replace('bg-', 'text-'))} />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400/70">{quest.sector}</span>
                      </div>
                      <h3 className="text-base font-black tracking-tight text-foreground leading-tight group-hover:text-indigo-400 transition-colors">{quest.title}</h3>
                    </div>
                  </div>

                  {/* description */}
                  <p className="text-[12px] text-muted-foreground/70 leading-relaxed line-clamp-2 mb-4 italic">
                    {quest.description}
                  </p>

                  {/* footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-0.5">XP</p>
                        <p className="text-sm font-black text-foreground">{quest.reward}</p>
                      </div>
                      <div className="h-8 w-px bg-border/40" />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-0.5">Risk</p>
                        <p className="text-sm font-black text-foreground italic">{quest.difficulty}</p>
                      </div>
                      <div className="h-8 w-px bg-border/40" />
                      <div className="flex -space-x-2">
                        {[0,1,2].map(idx => (
                          <div key={idx} className="h-6 w-6 rounded-full border-2 border-background bg-secondary overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Q${quest.id}${idx}`} alt="" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={cn(
                      "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                      quest.status === 'Hot'
                        ? "bg-rose-500 text-white border-rose-600 shadow-lg shadow-rose-500/20"
                        : quest.status === 'Active'
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : "bg-secondary/50 text-muted-foreground border-border/40"
                    )}>{quest.status}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>

    {/* ════════════════════════════════════════════════════════════════
        DESKTOP MARKETPLACE  (hidden md:block) — completely unchanged
    ════════════════════════════════════════════════════════════════ */}
    <div className="hidden md:block flex-1 overflow-y-auto bg-background font-body text-foreground pb-32 selection:bg-indigo-500/10 h-screen scrollbar-hide">
      
      {/* Header - Industrial Refined */}
      <div className="relative pt-24 pb-16 px-8 md:px-12 bg-card/30 border-b border-border/40 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="max-w-[1700px] mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
             <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                <Target className="h-5 w-5" />
             </div>
             <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600/60 leading-none">Global Mission Protocol</span>
          </motion.div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-4 max-w-3xl">
               <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[0.9]">
                  Mission <span className="font-display italic font-medium text-indigo-600">Marketplace</span>
               </h1>
               <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                  Deploy to high-priority sectors. Your contribution generates real-time Impact XP and drives the social resilience index.
               </p>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="text-right hidden sm:block">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Network Capacity</div>
                  <div className="text-2xl font-black text-foreground italic">94% <span className="text-xs text-indigo-600 font-bold ml-1">UP</span></div>
               </div>
               <div className="h-12 w-px bg-border/40 mx-2" />
               <Button className="h-14 px-8 rounded-2xl bg-indigo-600 text-white font-bold gap-3 shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-all">
                  <Plus className="h-5 w-5" /> Propose Mission
               </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar - Sticky Protocol */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl border-b border-border/40 transition-all duration-500">
         <div className="max-w-[1700px] mx-auto px-8 md:px-12 py-6 flex flex-col md:flex-row items-center gap-8">
            <div className="relative flex-1 w-full group">
               <div className="absolute inset-x-0 -bottom-px h-[2px] bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 blur-[2px]" />
               <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse drop-shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
               </div>
               <input 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 type="text" 
                 placeholder="Semantic AI Search: 'Logistics missions near me with high XP...'" 
                 className="w-full h-14 bg-card/40 backdrop-blur-2xl border border-indigo-500/20 rounded-2xl pl-14 pr-[140px] text-sm font-medium focus:outline-none focus:border-indigo-500/60 focus:bg-background transition-all shadow-[0_0_15px_rgba(79,70,229,0.05)] focus:shadow-[0_0_30px_rgba(79,70,229,0.15)] text-foreground placeholder:text-muted-foreground/50"
                 spellCheck={false}
               />
               <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3 pointer-events-none">
                  <span className="hidden md:block text-[9px] font-black uppercase tracking-widest text-indigo-500/60 transition-opacity">Neural / Fuzzy</span>
                  <button className="h-8 px-4 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-sm pointer-events-auto">
                     Search
                  </button>
               </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 md:pb-0 w-full md:w-auto">
               {sectors.map(sector => (
                 <button 
                    key={sector}
                    onClick={() => setSelectedSector(sector)}
                    className={cn(
                      "whitespace-nowrap px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                      selectedSector === sector ? "bg-foreground text-background shadow-lg" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    )}
                 >
                    {sector}
                 </button>
               ))}
               <Button variant="ghost" className="h-10 w-10 p-0 rounded-2xl text-muted-foreground"><FilterX className="h-4 w-4" /></Button>
            </div>
         </div>
      </div>

      {/* Grid - Mission Cards */}
      <div className="max-w-[1700px] mx-auto px-8 md:px-12 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredQuests.map((quest, i) => (
              <motion.div 
                layout
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-card border border-border/60 rounded-[3rem] p-10 flex flex-col justify-between hover:border-indigo-600/30 hover:shadow-2xl hover:shadow-indigo-600/5 transition-all cursor-pointer overflow-hidden min-h-[420px]"
              >
                {/* Tactical Corner Decal */}
                <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-600/0 p-8 flex justify-end items-start transition-colors group-hover:bg-indigo-600/5">
                   <div className="h-2 w-2 rounded-full bg-border group-hover:bg-indigo-600 transition-colors" />
                </div>
                
                <div>
                  <div className="flex justify-between items-start mb-8">
                     <div className={cn("h-16 w-16 rounded-[2rem] flex items-center justify-center border border-border/40 shadow-inner group-hover:scale-110 transition-transform", quest.color.replace('bg-', 'bg-') + '/10')}>
                        <quest.icon className={cn("h-8 w-8", quest.color.replace('bg-', 'text-'))} />
                     </div>
                     <div className={cn(
                        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                        quest.status === 'Hot' ? "bg-rose-500 text-white border-rose-600 shadow-lg shadow-rose-500/20" : 
                        quest.status === 'Active' ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" : "bg-secondary text-muted-foreground border-border/40"
                     )}>
                        {quest.status}
                     </div>
                  </div>

                  <div className="space-y-2 mb-6">
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600/60 leading-none">
                        <MapPin className="h-3 w-3" /> Sector {quest.sector}
                     </div>
                     <h3 className="text-3xl font-bold tracking-tight text-foreground leading-tight group-hover:text-indigo-600 transition-colors">{quest.title}</h3>
                  </div>
                  
                  <p className="text-muted-foreground text-base font-medium leading-relaxed line-clamp-3 mb-10 italic opacity-80 group-hover:opacity-100 transition-opacity">
                    {quest.description}
                  </p>
                </div>

                <div className="pt-8 border-t border-border/40 flex items-end justify-between">
                   <div className="space-y-4">
                      <div className="flex -space-x-3">
                         {Array.from({length: 3}).map((_, idx) => (
                            <div key={idx} className="h-8 w-8 rounded-full border-2 border-background bg-secondary overflow-hidden">
                               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Q${quest.id}${idx}`} alt="U" />
                            </div>
                         ))}
                         <div className="h-8 w-8 rounded-full border-2 border-background bg-indigo-600/10 flex items-center justify-center text-[10px] font-black text-indigo-600">
                            +{quest.participants}
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                           <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest mb-1">Impact XP</span>
                           <span className="text-lg font-black text-foreground">{quest.reward}</span>
                        </div>
                        <div className="h-10 w-px bg-border/40" />
                        <div className="flex flex-col">
                           <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest mb-1">Risk Level</span>
                           <span className="text-lg font-black text-foreground italic">{quest.difficulty}</span>
                        </div>
                      </div>
                   </div>
                   
                   <button className="h-16 w-16 rounded-[2.5rem] bg-foreground text-background flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xl shadow-black/5 active:scale-90">
                      <ChevronRight className="h-8 w-8" />
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

    </div>
    </>
  )
}
