import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  DocumentCodeIcon as FileText, 
  Search01Icon as Search, 
  Download01Icon as Download, 
  FilterIcon as Filter, 
  GlobeIcon as Globe, 
  LockIcon as Lock, 
  DatabaseIcon as Database, 
  Shield01Icon as Shield, 
  CpuIcon as Cpu, 
  FlashIcon as Zap, 
  ArrowRight01Icon as ArrowRight,
  ArrowRight01Icon as ChevronRight,
  ArchiveIcon as Archive,
  Menu01Icon as Menu,
  GridIcon as Grid,
  Layers01Icon as Layers
} from "hugeicons-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

const BlurText = ({ text, className, delay = 0 }: { text: string, className?: string, delay?: number }) => {
  const letters = text.split("");
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.02, delayChildren: delay },
    },
  };
  const child = {
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      },
    },
    hidden: {
      opacity: 0,
      filter: "blur(10px)",
      y: 20,
    },
  };

  return (
    <motion.span
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={cn("inline-flex flex-wrap", className)}
    >
      {letters.map((letter, index) => (
        <motion.span variants={child} key={index} className="inline-block leading-none">
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.span>
  );
};

const categories = [
  { id: 'all', label: 'All Protocols' },
  { id: 'briefings', label: 'Mission Briefings' },
  { id: 'datasets', label: 'Tactical Datasets' },
  { id: 'frameworks', label: 'Legal Frameworks' },
  { id: 'training', label: 'Personnel Training' }
]

const resources = [
  {
    id: 1,
    title: "Global Logistics Sync v4.1",
    category: "datasets",
    desc: "Real-time coordinate mapping for humanitarian supply chains across SEA sectors.",
    size: "42.8 MB",
    type: "CSV / JSON",
    priority: "High",
    hash: "SHA-256: 4f8a...9c2d"
  },
  {
    id: 2,
    title: "Crisis Response Protocol 2026",
    category: "briefings",
    desc: "Standard operating procedures for rapid deployment in high-instability zones.",
    size: "12.4 MB",
    type: "PDF / BND",
    priority: "Critical",
    hash: "SHA-256: 9e1a...1f4e"
  },
  {
    id: 3,
    title: "Volunteer Impact Algorithms",
    category: "frameworks",
    desc: "Technical documentation for the XP scoring engine and contribution weights.",
    size: "5.2 MB",
    type: "MD / DOC",
    priority: "Standard",
    hash: "SHA-256: 2b3c...7d8f"
  },
  {
    id: 4,
    title: "Resilience Grid Dataset",
    category: "datasets",
    desc: "Historical community stability metrics mapped across 500+ global nodes.",
    size: "128.5 MB",
    type: "Parquet",
    priority: "High",
    hash: "SHA-256: 1a9e...3c5b"
  },
  {
    id: 5,
    title: "Tactical First Aid Brief",
    category: "training",
    desc: "Mobile-ready video modules for emergency medical response in the field.",
    size: "1.2 GB",
    type: "MP4 / BND",
    priority: "High",
    hash: "SHA-256: 8d2f...5a1b"
  },
  {
    id: 6,
    title: "Sector Governance Key",
    category: "frameworks",
    desc: "Regulatory keys for decentralized mission management in the ImpactQuest grid.",
    size: "1.1 MB",
    type: "YAML",
    priority: "Critical",
    hash: "SHA-256: 3c4a...2b9e"
  }
]

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = React.useState('all')
  const [searchQuery, setSearchQuery] = React.useState('')

  const filteredResources = resources.filter(r => 
    (activeCategory === 'all' || r.category === activeCategory) &&
    (r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-indigo-600/10 overflow-x-hidden pt-32 pb-20 px-8 md:px-12 lg:px-24">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-indigo-600/5 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2" />
         <div className="absolute top-0 right-0 w-full h-full opacity-[0.02]" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-[1700px] mx-auto relative z-10 space-y-20">
         
         {/* Complex Header Section */}
         <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                  <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em]">Asset Protocol Hub</span>
               </div>
               <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.8] uppercase">
                  <BlurText text="intel" /> <br/>
                  <span className="outline-text">
                     <BlurText text="library." delay={0.4} />
                  </span>
               </h1>
               <motion.p 
                 initial={{ filter: "blur(10px)", opacity: 0, y: 30 }}
                 whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                 className="text-xl text-muted-foreground font-medium max-w-2xl italic border-l-4 border-indigo-600 pl-8"
               >
                  Deep search into the most comprehensive archive of humanitarian datasets and operational protocols.
               </motion.p>
            </div>
            
            <div className="flex flex-col items-end gap-4 text-right">
               <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Total Bytes Indexed</div>
               <div className="text-4xl font-black text-foreground italic">14.8 PB</div>
               <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2 leading-none"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Grid sync active</div>
            </div>
         </div>

         {/* Interactive Search & Filter Deck */}
         <div className="sticky top-24 z-50 py-8 border-y border-border/40 backdrop-blur-3xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
               <div className="relative flex-1 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                     type="text" 
                     placeholder="Query protocol database..."
                     className="w-full h-16 bg-white flex items-center px-16 rounded-2xl border border-border/60 text-sm font-bold tracking-widest lowercase focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all outline-none"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                     <span className="text-[9px] font-black text-muted-foreground/30 leading-none">CTRL + K</span>
                  </div>
               </div>
               <div className="flex items-center gap-2 bg-secondary/30 p-1.5 rounded-2xl border border-border/40 overflow-x-auto h-16">
                  {categories.map(cat => (
                     <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                           "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all",
                           activeCategory === cat.id 
                              ? "bg-foreground text-background shadow-lg" 
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        )}
                     >
                        {cat.label}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Main Tactical Grid Layout */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Sidebar Filters - Technical Complex */}
            <aside className="lg:col-span-3 space-y-12">
               <div className="space-y-8">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 text-left">Refine Briefing</span>
                     <Filter className="h-3 w-3 text-muted-foreground/40" />
                  </div>
                  
                  {/* Access Level Slider */}
                  <div className="space-y-6">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span>Min. Access Tier</span>
                        <span className="text-indigo-600 italic">Level 04</span>
                     </div>
                     <div className="h-1.5 w-full bg-secondary rounded-full relative">
                        <div className="absolute top-0 left-0 h-full w-[60%] bg-indigo-600 rounded-full" />
                        <div className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2 h-4 w-4 bg-foreground rounded-full border-2 border-background shadow-lg cursor-pointer" />
                     </div>
                  </div>

                  {/* File Type Toggles */}
                  <div className="space-y-4">
                     <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 text-left">Format Filter</div>
                     <div className="grid grid-cols-2 gap-3">
                        {['PDF', 'XLSX', 'BND', 'JSON', 'CSV', 'YAML'].map(type => (
                           <div key={type} className="flex items-center gap-3 p-3 rounded-xl border border-border/40 hover:border-indigo-600/30 transition-all cursor-pointer group">
                              <div className="h-4 w-4 rounded-md border-2 border-border/60 group-hover:border-indigo-600 transition-colors" />
                              <span className="text-[10px] font-bold text-foreground/40 group-hover:text-foreground">{type}</span>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Operational Status */}
                  <div className="p-6 rounded-3xl bg-indigo-600/5 border border-indigo-600/10 space-y-4">
                     <Cpu className="h-6 w-6 text-indigo-600" />
                     <div className="text-xl font-bold tracking-tight italic text-left">Neural Briefing <br/> Active.</div>
                     <p className="text-[10px] text-muted-foreground leading-relaxed italic text-left opacity-60">
                        Our AI protocol is currently indexing 4.2M new data nodes across the African Sector.
                     </p>
                  </div>
               </div>
            </aside>

            {/* Resource Results Grid */}
            <main className="lg:col-span-9">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <AnimatePresence mode="popLayout">
                     {filteredResources.map((res, i) => (
                        <motion.div
                           layout
                           key={res.id}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, scale: 0.95 }}
                           transition={{ delay: i * 0.05 }}
                           className="group relative p-10 rounded-[3.5rem] bg-card border border-border/60 hover:border-indigo-600/30 hover:shadow-2xl hover:shadow-indigo-600/5 transition-all overflow-hidden flex flex-col"
                        >
                           {/* Holographic ID Decal */}
                           <div className="absolute top-10 right-10 text-[60px] font-black text-foreground/[0.03] leading-none pointer-events-none select-none">
                              {String(res.id).padStart(2, '0')}
                           </div>

                           <div className="flex items-center gap-4 mb-8">
                              <div className={cn(
                                 "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm",
                                 res.priority === 'Critical' ? "bg-rose-500/10 text-rose-600" : "bg-indigo-600/10 text-indigo-600"
                              )}>
                                 <FileText className="h-6 w-6" />
                              </div>
                              <div className="flex flex-col">
                                 <span className={cn(
                                    "text-[9px] font-black uppercase tracking-[0.3em] leading-none mb-1",
                                    res.priority === 'Critical' ? "text-rose-600" : "text-indigo-600"
                                 )}>{res.priority} Priority</span>
                                 <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Syncing with Global Hub...</span>
                              </div>
                           </div>

                           <div className="space-y-4 flex-1">
                              <h3 className="text-3xl font-bold tracking-tight leading-[0.9] text-foreground group-hover:text-indigo-600 transition-colors text-left">{res.title}</h3>
                              <p className="text-muted-foreground text-sm font-medium leading-relaxed italic opacity-60 group-hover:opacity-100 transition-all text-left">
                                 {res.desc}
                              </p>
                           </div>

                           <div className="mt-12 pt-8 border-t border-border/40 flex flex-col gap-6">
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                                 <div className="flex items-center gap-4">
                                    <span className="text-foreground">{res.size}</span>
                                    <span>•</span>
                                    <span>{res.type}</span>
                                 </div>
                                 <span className="font-mono text-[8px] opacity-40">{res.hash}</span>
                              </div>
                              <Button className="h-16 w-full rounded-2xl bg-secondary hover:bg-foreground hover:text-background text-[11px] font-black uppercase tracking-[0.3em] gap-4 transition-all shadow-sm">
                                 Execute download <Download className="h-4 w-4" />
                              </Button>
                           </div>
                        </motion.div>
                     ))}
                  </AnimatePresence>
               </div>

               {/* No Results Fallback */}
               {filteredResources.length === 0 && (
                  <motion.div 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="py-32 flex flex-col items-center text-center space-y-8"
                  >
                     <Archive className="h-20 w-20 text-muted-foreground/20" />
                     <div className="space-y-4">
                        <h3 className="text-4xl font-black text-foreground/40 italic">Query Unsuccessful.</h3>
                        <p className="text-muted-foreground italic max-w-sm">No tactical assets match your current filter parameters or signature key.</p>
                     </div>
                     <Button variant="ghost" onClick={() => {setActiveCategory('all'); setSearchQuery('')}} className="text-indigo-600 font-black uppercase tracking-[0.3em] text-[10px]">Reset Protocol Filter</Button>
                  </motion.div>
               )}
            </main>
         </div>

         {/* Sector Analytics Bridge - DARK MODE OPTIMIZED */}
         <section className="py-32 px-12 rounded-[4rem] bg-indigo-600/5 border border-indigo-600/10 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-indigo-600/5 blur-[180px] rounded-full" />
               <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 relative z-10">
               <div className="space-y-12 flex flex-col justify-center">
                  <div className="space-y-6">
                     <span className="text-indigo-600 text-[11px] font-black uppercase tracking-[0.4em] text-left block">System Oversight</span>
                     <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-left lowercase">
                        <BlurText text="real-time" /> <br/> 
                        <span className="outline-text">
                           <BlurText text="Data Sync." delay={0.4} />
                        </span>
                     </h2>
                  </div>
                  <p className="text-xl text-muted-foreground font-medium leading-relaxed italic border-l-4 border-indigo-600 pl-8 text-left">
                     "Transparent resource distribution is the bedrock of strategic resilience. Every asset in our library is verified by independent audit nodes."
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-10">
                  {[
                     { label: "active downloads", val: "12,492", trend: "+12%" },
                     { label: "node latency", val: "0.04ms", trend: "-5%" },
                     { label: "storage capacity", val: "84%", trend: "stable" },
                     { label: "security level", val: "al-9", trend: "defensive" }
                  ].map((stat, i) => (
                     <div key={i} className="space-y-4 p-8 rounded-3xl bg-card border border-border/40 hover:border-indigo-600/30 transition-all cursor-default">
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 text-left">{stat.label}</div>
                        <div className="text-4xl font-black italic text-left text-foreground">{stat.val}</div>
                        <div className="text-[9px] font-bold text-muted-foreground/60 tracking-widest text-left">{stat.trend}</div>
                     </div>
                  ))}
               </div>
            </div>
         </section>

      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .outline-text {
          -webkit-text-stroke: 1.8px hsla(var(--foreground), 0.4);
          color: hsla(var(--foreground), 0.08);
          transition: all 0.5s ease;
        }
        .outline-text * {
          opacity: 1 !important;
        }
        .dark .outline-text {
          -webkit-text-stroke: 1.8px hsla(var(--foreground), 0.5);
        }
        @media (max-width: 1024px) {
          .outline-text {
            -webkit-text-stroke: 1px hsla(var(--foreground), 0.4);
          }
        }
      `}} />
    </div>
  )
}
