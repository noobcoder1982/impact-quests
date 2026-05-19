import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = React.useState(0)
  const [telemetryText, setTelemetryText] = React.useState("Initializing Core Connections")
  const text = "ImpactQuest"

  // Shifting telemetry status text based on progress
  React.useEffect(() => {
    if (progress < 20) {
      setTelemetryText("Initializing Core Connections...")
    } else if (progress < 40) {
      setTelemetryText("Detecting Humanitarian Zones...")
    } else if (progress < 60) {
      setTelemetryText("Syncing Secure XP Ledgers...")
    } else if (progress < 80) {
      setTelemetryText("Engaging Matching Engine...")
    } else if (progress < 99) {
      setTelemetryText("Booting Strategic Control Hub...")
    } else {
      setTelemetryText("Induction Authenticated.")
    }
  }, [progress])

  React.useEffect(() => {
    const duration = 3200 // 3.2 seconds total
    const interval = 20 
    const step = 100 / (duration / interval)
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + step
      })
    }, interval)

    const completionTimer = setTimeout(() => {
      onComplete()
    }, duration + 500)

    return () => {
      clearInterval(timer)
      clearTimeout(completionTimer)
    }
  }, [onComplete])

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  }

  const letterVariant = {
    hidden: { opacity: 0, filter: "blur(20px)", y: 15 },
    visible: { 
      opacity: 1, 
      filter: "blur(0px)", 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(40px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[#020203] flex flex-col items-center justify-center overflow-hidden font-sans text-white select-none"
    >
      {/* Subtle Cinematic Background Spotlight Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />

      {/* ========================================================================= */}
      {/* 📱 MOBILE EXCLUSIVE UI: Clean Circular HUD Dial (Wow Factor) */}
      {/* ========================================================================= */}
      <div className="md:hidden relative flex flex-col items-center justify-center w-full px-6 space-y-12">
         
         {/* Top Subtitle tag */}
         <div className="flex items-center gap-2 text-[9px] font-mono tracking-[0.25em] text-indigo-400/40">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500/60 animate-pulse" />
            <span>MOBILE SECURE INDUCTION</span>
         </div>

         {/* Circular HUD Loader */}
         <div className="relative w-56 h-56 flex items-center justify-center">
            
            {/* Outer subtle rotating dashed trace */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-dashed border-indigo-500/10"
            />

            {/* Active Circular SVG Progress line */}
            <svg className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)] -rotate-90 overflow-visible">
               <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.02)"
                  strokeWidth="2.5"
               />
               <motion.circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="url(#mobileGlowGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 6px rgba(99, 102, 241, 0.5))" }}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: progress / 100 }}
                  transition={{ duration: 0.1, ease: "linear" }}
               />
               <defs>
                  <linearGradient id="mobileGlowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                     <stop offset="0%" stopColor="#818cf8" />
                     <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
               </defs>
            </svg>

            {/* Stacked Branding Emblem in the Circle Center */}
            <div className="absolute flex flex-col items-center justify-center text-center space-y-1.5 z-10">
               <span className="text-xl font-bold uppercase tracking-[0.2em] text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Impact
               </span>
               <span className="text-2xl font-black italic text-indigo-400 font-serif tracking-normal" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                  Quest.
               </span>
               
               {/* Clean Percentage capsule */}
               <div className="pt-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                     {Math.round(progress)}%
                  </span>
               </div>
            </div>
         </div>

         {/* Bottom Telemetry Briefing */}
         <div className="w-full max-w-xs text-center space-y-3 font-mono">
            <div className="text-[10px] tracking-widest text-indigo-400/80">
               &gt; {telemetryText}
            </div>
            <div className="text-[8px] text-muted-foreground/30 tracking-[0.3em]">
               V4.0.1 STABLE
            </div>
         </div>
      </div>

      {/* ========================================================================= */}
      {/* 💻 DESKTOP UI: Minimalist Telemetry Loader */}
      {/* ========================================================================= */}
      <div className="hidden md:flex flex-col items-center justify-center w-full max-w-4xl px-6 text-center space-y-12">
         
         {/* Logo Branding */}
         <motion.div 
            variants={container}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-center overflow-visible"
         >
            {text.split("").map((char, i) => (
              <motion.span
                key={i}
                variants={letterVariant}
                className={cn(
                  "text-6xl md:text-[6.5rem] lg:text-[7.5rem] font-black tracking-tighter inline-block leading-none",
                  i >= 6 
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-500 to-indigo-700 font-serif italic tracking-normal ml-1" 
                    : "text-foreground drop-shadow-[0_2px_15px_rgba(255,255,255,0.05)]"
                )}
                style={i >= 6 ? { fontFamily: "'Instrument Serif', Georgia, serif" } : { fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {char}
              </motion.span>
            ))}
         </motion.div>

         {/* Segmented Digital Progress loader */}
         <div className="w-full max-w-md space-y-6">
            
            <div className="flex gap-1.5 justify-between w-full h-2 px-1 bg-zinc-950/80 rounded-lg border border-white/5 p-0.5 backdrop-blur-xl">
               {Array.from({ length: 15 }).map((_, idx) => {
                  const blockMinProgress = (idx / 15) * 100
                  const isFilled = progress >= blockMinProgress
                  return (
                     <div 
                       key={idx}
                       className={cn(
                         "flex-1 h-full rounded-sm transition-all duration-300",
                         isFilled 
                           ? "bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                           : "bg-white/[0.02]"
                       )}
                     />
                  )
               })}
            </div>

            {/* Subtext and percent */}
            <div className="flex justify-between items-center px-1 font-mono text-[10px] tracking-widest text-indigo-400 leading-none">
               <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500/80 animate-ping" />
                  <span className="font-bold uppercase text-foreground/70">{telemetryText}</span>
               </div>
               <span className="font-black text-indigo-300">{Math.round(progress)}%</span>
            </div>
         </div>
      </div>
      
    </motion.div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
