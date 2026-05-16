import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { 
  Zap, 
  Shield, 
  Target, 
  Globe, 
  Users, 
  Activity, 
  Command, 
  Cpu, 
  Layers, 
  ArrowRight,
  ChevronRight,
  Sparkles,
  Search,
  Lock,
  MessageCircle,
  Trophy
} from "lucide-react"
import { Button } from "./ui/button"
import { Link } from "react-router-dom"
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

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
}

const features = [
  {
    title: "Strategic Deployment Hub",
    description: "Centrally coordinate humanitarian missions with a real-time tactical overview of global nodes and volunteer distribution.",
    icon: Layers,
    color: "indigo",
    stats: "24.5k Nodes Active"
  },
  {
    title: "Protocol Intelligence (AI)",
    description: "Leverage advanced neural briefing structures to analyze mission data and generate real-time strategic recommendations.",
    icon: Cpu,
    color: "emerald",
    stats: "99.2% Sync Precision"
  },
  {
    title: "Impact Marketplace",
    description: "A high-precision deployment grid where volunteers can join high-priority missions across diverse tactical sectors.",
    icon: Target,
    color: "rose",
    stats: "150+ Sectors"
  },
  {
    title: "Social Resilience Index",
    description: "Monitor community stability in real-time through an immutable activity ledger and strategic resilience analytics.",
    icon: Activity,
    color: "amber",
    stats: "Live Resilience Feed"
  },
  {
    title: "Secure Personnel Grid",
    description: "Manage global volunteer squads with end-to-end encrypted coordination and verified skill progression protocols.",
    icon: Shield,
    color: "blue",
    stats: "SHA-512 Encrypted"
  },
  {
    title: "Global Reach Protocol",
    description: "Seamlessly expand your humanitarian footprint with built-in localization and cross-border operational support.",
    icon: Globe,
    color: "purple",
    stats: "Global Infrastructure"
  }
]

export default function FeaturesPage() {
  const containerRef = React.useRef(null)

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto bg-background font-sans selection:bg-indigo-600/10 scroll-smooth h-screen scrollbar-hide">
      
      {/* Dynamic Tactical Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-600/5 blur-[180px] rounded-full translate-x-1/2 -translate-y-1/2" />
         <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 blur-[150px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Cinematic Hero */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-32 pb-16 overflow-hidden">
        <div className="relative z-10 space-y-6 max-w-[1400px]">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/5 border border-indigo-600/10 text-indigo-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
           >
              <Sparkles className="h-3.5 w-3.5" /> Features Overview
           </motion.div>
           
           <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-foreground leading-[1.1]">
             <BlurText text="Powerful features for" /> <br/>
             <span className="text-indigo-600">
                <BlurText text="global impact." delay={0.4} />
             </span>
           </h1>

           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.1, duration: 0.8 }}
             className="max-w-xl mx-auto text-base md:text-xl text-muted-foreground font-medium leading-relaxed"
           >
             An integrated platform designed to coordinate and scale humanitarian efforts with precision and speed.
           </motion.p>
           
           <motion.div 
             {...fadeInUp}
             transition={{ delay: 0.2 }}
             className="pt-8"
           >
             <Link to="/signin" className="inline-block w-full sm:w-auto">
               <Button className="w-full sm:w-auto h-16 md:h-18 px-10 rounded-xl bg-indigo-600 text-white text-base md:text-lg font-bold gap-3 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                  Get Started <ArrowRight className="h-5 w-5" />
               </Button>
             </Link>
           </motion.div>
        </div>
      </section>

      {/* Feature List - Simple & Clean */}
      <section className="px-6 md:px-12 lg:px-24 py-20 max-w-[1400px] mx-auto space-y-24 md:space-y-40">
         {features.map((f, i) => (
           <motion.div
             key={i}
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: "-100px" }}
             transition={{ duration: 0.8 }}
             className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center"
           >
              <div className="space-y-6 order-2 md:order-1">
                 <div className="space-y-3">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", `text-${f.color}-600`)}>{f.stats}</span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                       {f.title}
                    </h2>
                 </div>
                 <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed">
                    {f.description}
                 </p>
                 <Button variant="ghost" className="px-0 text-indigo-600 font-bold text-sm gap-2 hover:bg-transparent hover:underline">
                    Learn more <ArrowRight className="h-4 w-4" />
                 </Button>
              </div>

              <div className="order-1 md:order-2 flex justify-center md:justify-end">
                 <div className={cn(
                   "h-32 w-32 md:h-56 md:w-56 rounded-3xl md:rounded-[3rem] flex items-center justify-center relative",
                   `bg-${f.color}-600/5 border border-${f.color}-600/10`
                 )}>
                    <f.icon className={cn("h-12 w-12 md:h-20 md:w-20", `text-${f.color}-600`)} strokeWidth={1.5} />
                 </div>
              </div>
           </motion.div>
         ))}
      </section>

      {/* Showcase Section - Simplified */}
      <section className="px-6 md:px-12 lg:px-24 py-20 max-w-[1400px] mx-auto">
         <div className="bg-secondary/30 border border-border/50 rounded-3xl p-8 md:p-20 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
               <div className="space-y-8">
                  <div className="space-y-4">
                     <span className="text-indigo-600 text-[10px] font-bold uppercase tracking-wider">Infrastructure</span>
                     <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
                        Built for scale and reliability.
                     </h2>
                  </div>
                  <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed">
                    Our architecture ensures that your missions stay online and coordinated, even in the most challenging environments.
                  </p>
                  <div className="flex gap-10">
                     <div className="space-y-1">
                        <div className="text-2xl md:text-3xl font-bold text-foreground">99.9%</div>
                        <div className="text-[10px] font-bold uppercase text-muted-foreground/50">Uptime</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-2xl md:text-3xl font-bold text-foreground">10ms</div>
                        <div className="text-[10px] font-bold uppercase text-muted-foreground/50">Latency</div>
                     </div>
                  </div>
               </div>

               <div className="relative">
                  <div className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-xl">
                     <div className="flex justify-between items-center mb-8 pb-4 border-b border-border/40">
                        <div className="flex items-center gap-3">
                           <div className="h-6 w-6 rounded bg-indigo-600" />
                           <span className="text-[10px] font-bold uppercase text-foreground">Global Monitor</span>
                        </div>
                        <Activity className="h-4 w-4 text-emerald-500" />
                     </div>
                     <div className="space-y-4">
                        {[1,2,3].map(i => (
                          <div key={i} className="h-10 w-full bg-secondary/50 rounded-lg animate-pulse" />
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer Specs */}
      <footer className="px-6 md:px-12 lg:px-24 py-24 border-t border-white/5 text-center">
         <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-center justify-between gap-12 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/20">
            <span className="flex items-center gap-4">© 2026 IQ Infrastructure <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Grid Online</span>
            <div className="flex gap-12 italic">
               <span>v4.0.1 Stable</span>
               <span>Encrypted SHA-512</span>
            </div>
         </div>
      </footer>

    </div>
  )
}
