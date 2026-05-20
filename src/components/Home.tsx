import * as React from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { 
  ArrowRight01Icon as ArrowRight, 
  PlayIcon as Play, 
  Shield01Icon as ShieldCheck, 
  FlashIcon as Zap, 
  UserGroupIcon as Users, 
  GlobeIcon as Globe, 
  Target01Icon as Target,
  SparklesIcon as Sparkles,
  CommandIcon as Command,
  Activity01Icon as Activity,
  ArrowDown01Icon as ChevronDown,
  Add01Icon as Plus,
  NewTwitterIcon as Twitter,
  GithubIcon as Github,
  Mail01Icon as Mail,
  Comment01Icon as MessageSquare
} from "hugeicons-react"
import { Button } from "./ui/button"
import { Link } from "react-router-dom"
import DashboardPreview from "./DashboardPreview"
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
      filter: "blur(40px)",
      y: 40,
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
        <motion.span variants={child} key={index} className="inline-block">
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.span>
  );
};

function CustomCursor() {
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [hidden, setHidden] = React.useState(true)
  const [hovered, setHovered] = React.useState(false)

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      if (hidden) setHidden(false)
    }

    const handleMouseLeave = () => setHidden(true)
    const handleMouseEnter = () => setHidden(false)

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseenter", handleMouseEnter)

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.style.cursor === 'pointer' ||
        target.classList.contains('cursor-pointer') ||
        target.closest('.cursor-pointer')
      ) {
        setHovered(true)
      } else {
        setHovered(false)
      }
    }

    window.addEventListener("mouseover", handleMouseOver)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseenter", handleMouseEnter)
      window.removeEventListener("mouseover", handleMouseOver)
    }
  }, [hidden])

  if (hidden) return null

  return (
    <>
      <style>{`
        .custom-cursor-active, .custom-cursor-active * {
          cursor: none !important;
        }
      `}</style>
      <div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-indigo-500 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 ease-out"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${hovered ? 1.6 : 1})`,
          backgroundColor: hovered ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
          boxShadow: hovered ? '0 0 12px rgba(99, 102, 241, 0.2)' : 'none',
        }}
      />
      <div
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-indigo-600 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${hovered ? 0.4 : 1})`,
        }}
      />
    </>
  )
}

export default function Home() {
  const containerRef = React.useRef(null)
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVideoPlaying && e.key === 'Enter') {
        setIsVideoPlaying(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVideoPlaying])
  
  return (
    <div ref={containerRef} className="min-h-screen bg-background font-sans selection:bg-indigo-600/10 transition-colors duration-500 overflow-x-hidden custom-cursor-active">
      <CustomCursor />
      
      {/* Dynamic Tactical Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-indigo-600/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
         <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Hero Section - The Command Center */}
      <section className="relative z-10 pt-40 md:pt-48 pb-20 px-6 md:px-12 lg:px-24 flex flex-col items-center text-center">
        
        {/* Release Protocol Pill */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-zinc-900/60 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)] mb-10 md:mb-12 cursor-pointer hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all font-mono"
        >
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-400">PROTOCOL RELEASE V4.0.1</span>
        </motion.div>

        {/* Main Strategic Heading */}
        <div className="max-w-[1400px] space-y-8 md:space-y-12 mb-12 md:mb-16 px-0 text-center">
            <h1 className="text-[13vw] sm:text-[10vw] lg:text-[8rem] font-black leading-[0.95] tracking-tighter lowercase flex flex-col items-center justify-center font-sans">
               <span className="text-foreground drop-shadow-[0_2px_10px_rgba(255,255,255,0.05)]">
                  <BlurText text="strategic" />
               </span>
               <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-600 drop-shadow-[0_4px_30px_rgba(99,102,241,0.25)] select-none font-serif tracking-normal mt-2 pb-2" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                  <BlurText text="resilience." delay={0.3} />
               </span>
            </h1>
           
           <div className="max-w-2xl mx-auto mt-8 relative px-4">
             <motion.p 
               initial={{ filter: "blur(10px)", opacity: 0, y: 15 }}
               whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.4, duration: 0.8 }}
               className="text-base md:text-xl text-muted-foreground font-mono leading-relaxed tracking-tight"
             >
               <span className="text-indigo-500/80 mr-2 font-bold">&gt;</span>
               The tactical layer for modern volunteering. A high-fidelity mission control system designed for complex community recovery.
               <motion.span 
                 animate={{ opacity: [1, 0, 1] }} 
                 transition={{ repeat: Infinity, duration: 1 }}
                 className="inline-block w-2.5 h-4 bg-indigo-500 ml-1.5 align-middle"
               />
             </motion.p>
           </div>
        </div>

        {/* Action Protocols */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10 mb-20 md:mb-24 relative z-20"
        >
          <Link to="/signin" className="w-full sm:w-auto relative group">
            {/* Ambient button glow */}
            <div className="absolute inset-0 bg-indigo-600/30 rounded-2xl md:rounded-[2.5rem] blur-xl opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
            <Button className="relative w-full sm:w-auto h-16 md:h-20 px-10 md:px-12 rounded-2xl md:rounded-[2.5rem] bg-indigo-600 text-white text-lg md:text-xl font-black gap-4 hover:bg-indigo-700 transition-all border border-indigo-500/20 active:scale-95 leading-none">
                Deploy <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <button 
            onClick={() => setIsVideoPlaying(true)}
            className="flex items-center gap-4 group cursor-pointer"
          >
             <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-full flex items-center justify-center bg-zinc-950 border border-white/10 shadow-xl overflow-visible transition-all">
                {/* Concentric pulsing sweeps */}
                <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping opacity-60 scale-105" />
                <div className="absolute inset-0 rounded-full border border-purple-500/20 animate-ping opacity-30 scale-125 [animation-delay:0.5s]" />
                <div className="absolute inset-0 rounded-full bg-indigo-600/5 group-hover:bg-indigo-600/10 transition-all" />
                
                <Play className="h-5 w-5 md:h-6 md:w-6 text-white fill-current ml-1 z-10 group-hover:scale-110 transition-transform" />
             </div>
             <div className="text-left font-mono">
                <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400/50 leading-none mb-1">[ BRIEFING ]</div>
                <div className="text-sm font-black text-foreground uppercase tracking-widest leading-none group-hover:text-indigo-400 transition-colors">WATCH TAPE</div>
             </div>
          </button>
        </motion.div>

        {/* Video Overlay */}
        <AnimatePresence>
          {isVideoPlaying && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
            >
              <video 
                src="/rickroll.mp4" 
                autoPlay 
                controls
                className="w-full h-full object-contain bg-black"
                onEnded={() => setIsVideoPlaying(false)}
              />
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-sm font-bold tracking-widest uppercase animate-pulse">
                Press ENTER to exit
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Intelligence Preview */}
        <div className="w-full relative -mt-6 md:-mt-12 scale-[0.98] md:scale-100">
           <div className="absolute -top-20 md:-top-40 left-1/2 -translate-x-1/2 w-full max-w-5xl h-48 md:h-96 bg-indigo-600/20 blur-[80px] md:blur-[150px] rounded-full pointer-events-none opacity-40 animate-pulse" />
           <DashboardPreview />
        </div>
      </section>

      {/* Strategic Breakdown Section */}
      <section className="px-6 md:px-12 lg:px-24 py-24 md:py-48 max-w-[1700px] mx-auto relative">
            <div className="text-center space-y-4 mb-20">
               <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em]">Infrastructure Mapping</span>
               <h2 className="text-4xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.9] lowercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <BlurText text="Protocol analysis" />
               </h2>
            </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-20">
            {[
              { 
                tag: "Command Hub", 
                title: "Centralized Nav", 
                desc: "Every sector, mission, and audit log accessible via a unified strategic sidebar.",
              },
              { 
                tag: "Execution Grid", 
                title: "Live Auditing", 
                desc: "High-resolution XP indices and contribution tracking verified by SHA-512 protocols.",
              },
              { 
                tag: "Tactical Distribution", 
                title: "Sector Sync", 
                desc: "Multi-layered mission cards providing real-time operational status across diverse zones.",
              }
            ].map((node, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-card/60 backdrop-blur-3xl space-y-6 hover:border-indigo-600/30 transition-all cursor-default relative overflow-hidden"
              >
                 <div className="flex items-center gap-3 mb-4">
                    <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{node.tag}</span>
                 </div>
                 
                 <h3 className="text-2xl md:text-4xl font-bold tracking-tight font-signature" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{node.title}</h3>
                 <p className="text-muted-foreground text-sm md:text-lg font-medium leading-relaxed italic opacity-80 md:opacity-60 md:group-hover:opacity-100 transition-all">
                    {node.desc}
                 </p>
              </motion.div>
            ))}
         </div>
      </section>

      {/* Feature Protocol Hub */}
      <section className="px-6 md:px-12 lg:px-24 pb-24 md:pb-48 max-w-[1700px] mx-auto">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-32">
            <div className="space-y-8 md:space-y-12">
               <div>
                  <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Node Intelligence</span>
                  <h2 className="text-4xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.9] lowercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                     <BlurText text="engineered for" /> <br/> 
                     <span className="text-white/20 font-black not-italic lowercase">
                        <BlurText text="pure action." delay={0.4} />
                     </span>
                  </h2>
               </div>
               <motion.p 
                 initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
                 whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                 className="text-lg md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-xl italic border-l-4 border-indigo-600 pl-6 md:pl-8"
               >
                  ImpactQuest provides the single source of truth for every humanitarian deployment.
               </motion.p>
               <Button variant="ghost" className="h-14 md:h-20 px-0 text-foreground font-black text-[11px] md:text-[12px] uppercase tracking-[0.4em] gap-4 hover:bg-transparent hover:text-indigo-600 group">
                  Explore features <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
               </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
               {[
                  { title: "Skill Sync", desc: "Automated verification of humanitarian expertise.", icon: Zap },
                  { title: "Squad Core", desc: "Real-time coordination of mission squads.", icon: Users },
                  { title: "Impact Ledger", desc: "Immutable record of community contributions.", icon: Command },
                  { title: "Mission Market", desc: "Real-time deployment grid for urgency.", icon: Sparkles }
               ].map((f, i) => (
                  <div key={i} className="p-8 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 bg-card/40 backdrop-blur-3xl group hover:border-indigo-600/30 transition-all relative overflow-hidden">
                     <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all transform md:group-hover:scale-110">
                        <f.icon className="h-6 w-6" />
                     </div>
                     <h4 className="text-xl font-bold mb-3 tracking-tight font-signature" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{f.title}</h4>
                     <p className="text-muted-foreground text-sm font-medium leading-relaxed italic opacity-80 md:opacity-60 md:group-hover:opacity-100 transition-all">{f.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Proof Grid */}
      <section className="py-16 md:py-24 border-y border-white/5 bg-card/10">
         <div className="max-w-[1700px] mx-auto px-6 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Active Nodes", val: "24,519" },
              { label: "XP Audited", val: "142.8M" },
              { label: "Zones", val: "508" },
              { label: "Uptime", val: "99.9%" }
            ].map((stat, i) => (
              <div key={i} className="space-y-1 text-center sm:text-left">
                 <div className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 leading-none">{stat.label}</div>
                  <div className="text-2xl md:text-6xl font-black text-foreground font-signature">{stat.val}</div>
              </div>
            ))}
         </div>
      </section>

      {/* Ready to Deploy CTA */}
      <section className="py-24 md:py-48 px-6 md:px-12 lg:px-24 max-w-[1700px] mx-auto text-center relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[1000px] h-[400px] md:h-[600px] bg-indigo-600/5 blur-[80px] md:blur-[150px] rounded-full" />
         <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           className="space-y-10 md:space-y-12 relative z-10"
         >
            <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.5em] block mb-4">Base Connection Active</span>
            <h2 className="text-[14vw] md:text-[10vw] lg:text-[8.5rem] font-black tracking-tighter leading-[0.85] text-foreground lowercase">
               <BlurText text="deploy now" />
            </h2>
            <div className="pt-8">
               <Link to="/signin" className="inline-block w-full sm:w-auto px-6 sm:px-0">
                  <Button className="w-full sm:w-auto h-20 md:h-24 px-12 md:px-16 rounded-[2rem] md:rounded-[3rem] bg-indigo-600 text-white text-xl md:text-2xl font-black gap-6 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/20 active:scale-95 leading-none">
                     Begin Induction <ArrowRight className="h-6 w-6 md:h-8 md:w-8" />
                  </Button>
               </Link>
            </div>
         </motion.div>
      </section>

      {/* Cinematic Tactical Footer */}
      <footer className="relative bg-card pt-20 pb-16 px-8 md:px-12 lg:px-24 overflow-hidden border-t border-border/40">
         <div className="max-w-[1700px] mx-auto relative z-10 flex flex-col items-center text-center space-y-12">
            
            <Link to="/" className="flex flex-col items-center gap-4 group">
               <div className="h-16 w-16 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <span className="font-black text-3xl italic">IQ</span>
               </div>
               <span className="text-2xl font-black tracking-[0.4em] text-foreground lowercase">impactquest</span>
            </Link>

            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
               {['Dashboard', 'Quests', 'Score', 'Privacy', 'Terms'].map(link => (
                  <Link key={link} to="#" className="text-sm font-bold text-foreground/40 hover:text-indigo-600 transition-colors uppercase tracking-widest">{link}</Link>
               ))}
            </div>

            <div className="pt-12 border-t border-white/5 w-full flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/30">
               <div className="flex items-center gap-6">
                  <span>© 2026 ImpactQ</span>
                  <div className="flex items-center gap-2 text-emerald-500">
                     <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> 
                     <span>Grid Online</span>
                  </div>
               </div>
               <div className="flex gap-4">
                  {[Twitter, Github, Mail].map((Icon, i) => (
                     <a key={i} href="#" className="h-10 w-10 rounded-full border border-border/40 flex items-center justify-center text-muted-foreground hover:bg-foreground hover:text-background transition-all">
                        <Icon className="h-4 w-4" />
                     </a>
                  ))}
               </div>
            </div>
         </div>
      </footer>

    </div>
  )
}
