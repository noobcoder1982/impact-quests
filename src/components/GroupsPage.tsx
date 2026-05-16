import * as React from "react"
import { motion } from "framer-motion"
import { 
  UserGroupIcon as Users, 
  CrownIcon as Crown, 
  Settings01Icon as Settings, 
  Comment01Icon as MessageSquare, 
  Calendar01Icon as Calendar, 
  Search01Icon as Search, 
  Add01Icon as Plus,
  ArrowRight01Icon as ChevronRight,
  AnalyticsUpIcon as TrendingUp,
  Location01Icon as MapPin,
  Time01Icon as Clock
} from "hugeicons-react"
import { Button } from "./ui/button"

const groups = [
  {
    name: "North Side Responders",
    members: 24,
    leader: "Alex Chen",
    focus: "Emergency Response",
    activeQuests: 3,
    nextMeeting: "Today, 6:00 PM",
    rating: 4.9
  },
  {
    name: "Eco-Warriors Alliance",
    members: 156,
    leader: "Sarah Miller",
    focus: "Environmental",
    activeQuests: 12,
    nextMeeting: "Oct 28, 10:00 AM",
    rating: 4.8
  },
  {
    name: "Tech Connect Hub",
    members: 42,
    leader: "James Wilson",
    focus: "Education",
    activeQuests: 5,
    nextMeeting: "Nov 2, 4:30 PM",
    rating: 4.7
  }
]

export default function GroupsPage() {
  return (
    <div className="flex-1 overflow-y-auto p-10 font-body transition-all">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
           <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
                 Team Coordination
              </div>
              <h1 className="text-5xl font-display leading-none tracking-tight">Impact <span className="italic font-light">Groups</span></h1>
              <p className="mt-4 text-muted-foreground text-lg max-w-xl">Collaborate in high-performance squads to tackle large-scale community initiatives.</p>
           </div>
           
           <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-full h-12 px-6 gap-2 font-medium">
                 <Search className="h-4 w-4" /> Discover Groups
              </Button>
              <Button className="rounded-full h-12 px-6 gap-2 font-semibold shadow-lg">
                 <Plus className="h-4 w-4" /> Create Group
              </Button>
           </div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
           {["All Groups", "Environmental", "Social Mobility", "Emergency", "Tech & Education", "Health"].map((cat, i) => (
             <Button key={i} variant={i === 0 ? "default" : "secondary"} className={`rounded-full px-6 py-5 text-sm font-medium whitespace-nowrap shadow-sm`}>
               {cat}
             </Button>
           ))}
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {groups.map((group, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="group p-1 rounded-[2.5rem] border border-border bg-secondary/10 hover:border-accent/40 transition-all duration-500 overflow-hidden"
             >
                <div className="bg-background rounded-[2.3rem] p-8 h-full flex flex-col sm:flex-row gap-8 items-start sm:items-stretch group-hover:shadow-2xl transition-all">
                   <div className="flex flex-col items-center gap-4 shrink-0 sm:border-r border-border/50 sm:pr-8">
                      <div className="h-24 w-24 rounded-3xl bg-secondary flex items-center justify-center font-display text-4xl tracking-tighter text-accent border border-border shadow-inner">
                         {group.name[0]}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] font-bold uppercase tracking-widest">
                         <MapPin className="h-3 w-3" /> Area 4
                      </div>
                   </div>

                   <div className="flex-1 flex flex-col w-full">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <h3 className="text-2xl font-semibold tracking-tight mb-1 group-hover:text-accent transition-colors">{group.name}</h3>
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{group.focus}</span>
                         </div>
                         <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                            <Settings className="h-4 w-4" />
                         </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-6 mb-8 mt-auto">
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Leader</span>
                            <div className="flex items-center gap-2 text-sm font-semibold">
                               <Crown className="h-3 w-3 text-amber-500" /> {group.leader}
                            </div>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Active Members</span>
                            <div className="flex items-center gap-2 text-sm font-semibold">
                               <Users className="h-3 w-3 text-accent" /> {group.members}
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-border/50">
                         <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                               <Calendar className="h-3 w-3" /> Next Ops
                            </div>
                            <span className="text-sm font-semibold mt-1">{group.nextMeeting}</span>
                         </div>
                         <div className="flex gap-2">
                            <Button variant="secondary" className="rounded-full h-11 w-11 p-0">
                               <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button className="rounded-full h-11 px-6 font-bold shadow-md">
                               Enter Dashboard
                            </Button>
                         </div>
                      </div>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>

        {/* CTA Section */}
        <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           className="mt-20 p-16 rounded-[4rem] bg-foreground text-background relative overflow-hidden flex flex-col items-center text-center"
        >
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
           <div className="p-5 bg-background/10 rounded-3xl mb-8 relative z-10">
              <TrendingUp className="h-10 w-10 text-background" />
           </div>
           <h2 className="text-4xl md:text-5xl font-display font-semibold mb-6 tracking-tight relative z-10 max-w-2xl">Shape the collective <span className="italic font-light">impact</span> trajectory.</h2>
           <p className="text-background/60 text-lg mb-10 max-w-xl relative z-10 font-medium">High-trust roles and leader election systems ensure your group scales responsibly.</p>
           <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <Button className="rounded-full h-14 px-10 text-base font-bold bg-background text-foreground hover:bg-background/90 shadow-xl shadow-background/5">
                 Join Active Squad
              </Button>
              <Button variant="ghost" className="rounded-full h-14 px-10 text-base font-bold border-2 border-background/20 hover:bg-background/10">
                 Read Governance Docs
              </Button>
           </div>
        </motion.div>
      </div>
    </div>
  )
}
