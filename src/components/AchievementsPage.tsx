import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ChampionIcon as Trophy, 
  StarIcon as Star, 
  Award01Icon as Award, 
  FlashIcon as Zap, 
  Shield01Icon as Shield, 
  Target01Icon as Target, 
  LockIcon as Lock, 
  CrownIcon as Crown, 
  SparklesIcon as Sparkles, 
  FireIcon as Flame, 
  Medal01Icon as Medal 
} from "hugeicons-react"
import { cn } from "@/lib/utils"

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
}

const achievements = [
  { 
    title: "First Responder", 
    desc: "First deployment to an active risk sector in Sector 4.", 
    date: "Jan 12, 2026", 
    color: "rose", 
    icon: Shield,
    rarity: "Epic",
    points: 500
  },
  { 
    title: "Community Pillar", 
    desc: "Contributed over 1000 hours of high-impact service.", 
    date: "Feb 28, 2026", 
    color: "emerald", 
    icon: Trophy,
    rarity: "Legendary",
    points: 2500
  },
  { 
    title: "Mentor Supreme", 
    desc: "Guided 50 rookies to strategic Level 5 proficiency.", 
    date: "Mar 15, 2026", 
    color: "amber", 
    icon: Medal,
    rarity: "Unique",
    points: 1200
  },
  { 
    title: "Rapid Impact", 
    desc: "Achieved Level 10 in under 3 months of deployment.", 
    date: "May 20, 2026", 
    color: "blue", 
    icon: Zap,
    rarity: "Rare",
    points: 800
  },
  { 
    title: "Team Specialist", 
    desc: "Led 10 successful high-urgency rescue squads.", 
    date: "Jun 02, 2026", 
    color: "indigo", 
    icon: Target,
    rarity: "Mythic",
    points: 3000
  },
  { 
    title: "Echo Founder", 
    desc: "Participated in the initial system sync protocol.", 
    date: "Dec 30, 2025", 
    color: "purple", 
    icon: Crown,
    rarity: "Ancestor",
    points: 5000
  }
];

export default function AchievementsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-background font-body text-foreground pb-32 h-screen scrollbar-hide py-10 px-8">
      <main className="max-w-[1700px] mx-auto space-y-16">
        
        {/* Vibe-heavy Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 relative">
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-lg shadow-indigo-600/20"
            >
               <Trophy className="h-4 w-4" /> Honor Hall
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-foreground leading-[0.8] mb-4">
              Verified <span className="font-display italic font-medium text-indigo-600">Achievements</span>
            </h1>
            <p className="mt-8 text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
              Permanent cryptographic records of humanitarian excellence and specialized training milestones achieved across the grid.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
             <div className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 leading-none mb-2 italic">Total Protocol XP</div>
             <div className="text-6xl font-black text-foreground italic flex items-baseline gap-2">
                14.2K <span className="text-2xl text-indigo-600 font-display">PTS</span>
             </div>
          </div>
        </div>

        {/* Categories Tab */}
        <div className="flex items-center gap-4 bg-secondary/30 p-2 rounded-3xl border border-border w-max">
           {['All Medals', 'Tactical', 'Leadership', 'Field Ops'].map(t => (
             <button key={t} className={cn(
               "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
               t === 'All Medals' ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground border border-transparent"
             )}>
               {t}
             </button>
           ))}
        </div>

        {/* Achievement Grid - High Contrast & Vibrant */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
           {achievements.map((item, i) => (
             <motion.div
               key={i}
               {...fadeInUp}
               transition={{ delay: i * 0.1 }}
               className="group relative p-10 rounded-[3.5rem] border border-border/60 bg-card hover:bg-secondary/10 hover:border-indigo-600/30 transition-all cursor-pointer overflow-hidden backdrop-blur-sm"
             >
                {/* Glow Backdrop */}
                <div className={cn("absolute -top-10 -right-10 h-32 w-32 blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity rounded-full", "bg-" + item.color + "-500")} />
                
                <div className="flex justify-between items-start mb-10">
                   <div className={cn(
                     "h-24 w-24 rounded-[2.5rem] flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 shadow-2xl relative",
                     "bg-" + item.color + "-500/10 border border-" + item.color + "-500/20"
                   )}>
                      {/* Inner Shine */}
                      <div className="absolute inset-2 bg-white/20 blur-[1px] rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                      <item.icon className={cn("h-12 w-12 group-hover:drop-shadow-lg", "text-" + item.color + "-600")} />
                   </div>
                   <div className="flex flex-col items-end gap-2 text-right">
                      <div className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border", "bg-" + item.color + "-500/10 text-" + item.color + "-600 border-" + item.color + "-500/20")}>
                         {item.rarity}
                      </div>
                      <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">{item.date}</span>
                   </div>
                </div>

                <div className="space-y-4 mb-10">
                   <h3 className="text-3xl font-bold tracking-tight text-foreground group-hover:text-indigo-600 transition-colors leading-none">{item.title}</h3>
                   <p className="text-muted-foreground text-base font-medium leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity pr-6">
                     {item.desc}
                   </p>
                </div>

                <div className="pt-8 border-t border-border/40 flex justify-between items-center group-hover:border-indigo-600/20 transition-colors">
                   <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-amber-500" />
                      <span className="text-xl font-black text-foreground">{item.points} <span className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-widest">Protocol XP</span></span>
                   </div>
                   <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                      <Sparkles className="h-4 w-4" />
                   </div>
                </div>
             </motion.div>
           ))}
           
           {/* High-Contrast Locked Slots */}
           {[1, 2, 3].map(i => (
             <motion.div 
               key={`locked-${i}`} 
               {...fadeInUp}
               transition={{ delay: 0.6 + i * 0.1 }}
               className="p-10 rounded-[3.5rem] border border-dashed border-border flex flex-col items-center justify-center text-center group hover:border-indigo-600/30 transition-all bg-secondary/5 h-[420px]"
             >
                <div className="h-20 w-20 rounded-[2.5rem] border-2 border-dashed border-border/60 flex items-center justify-center mb-8 bg-background group-hover:scale-90 transition-all">
                   <Lock className="h-8 w-8 text-muted-foreground/20 group-hover:text-indigo-600/30" />
                </div>
                <div className="space-y-2">
                   <span className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/20 leading-none">Protocol Mystery</span>
                   <div className="text-xl font-bold text-muted-foreground/10 italic">Undiscovered Milestone</div>
                </div>
             </motion.div>
           ))}
        </div>

      </main>
    </div>
  )
}
