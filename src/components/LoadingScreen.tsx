import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = React.useState(0)
  const [telemetryText, setTelemetryText] = React.useState("Initializing Core Connections")
  const [coordinate, setCoordinate] = React.useState({ lat: "0.0000", lng: "0.0000" })
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

  // Rapid coordinate telemetry simulation
  React.useEffect(() => {
    const coordInterval = setInterval(() => {
      setCoordinate({
        lat: (10 + Math.random() * 40).toFixed(4),
        lng: (-120 + Math.random() * 50).toFixed(4)
      })
    }, 120)
    return () => clearInterval(coordInterval)
  }, [])

  React.useEffect(() => {
    const duration = 3200 // 3.2 seconds
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
      {/* Background cyber grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:30px_30px] opacity-40 pointer-events-none" />

      {/* Cyber spotlight vapor glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-indigo-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/5 blur-[90px] rounded-full pointer-events-none [animation-delay:0.7s]" />

      {/* ========================================================================= */}
      {/* 📱 MOBILE EXCLUSIVE UI: Glowing Circular HUD Radar (Wow Factor) */}
      {/* ========================================================================= */}
      <div className="md:hidden relative flex flex-col items-center justify-center w-full px-6 space-y-12">
         
         {/* Live top telemetry banner */}
         <div className="flex items-center gap-3 text-[8px] font-mono tracking-[0.3em] text-indigo-400/50">
            <span>[ SECURE MOBILE INDUCTION ]</span>
            <span className="text-emerald-500 animate-pulse">• GPS ACTIVE</span>
         </div>

         {/* Circular HUD dial container */}
         <div className="relative w-64 h-64 flex items-center justify-center">
            
            {/* Target Crosshair Brackets ┌ ┐ └ ┘ */}
            <div className="absolute -inset-4 border-t border-l border-white/10 w-6 h-6 rounded-tl-xl" />
            <div className="absolute -inset-4 left-auto border-t border-r border-white/10 w-6 h-6 rounded-tr-xl" />
            <div className="absolute -inset-4 top-auto border-b border-l border-white/10 w-6 h-6 rounded-bl-xl" />
            <div className="absolute -inset-4 top-auto left-auto border-b border-r border-white/10 w-6 h-6 rounded-br-xl" />

            {/* Glowing radar sweep circle */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-dashed border-indigo-500/15"
            />
            
            {/* Rapidly rotating inner cyber-gauge */}
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              className="absolute inset-4 rounded-full border border-double border-cyan-500/10 [stroke-dasharray:10_20]"
            />

            {/* Active drawing circular progress SVG path */}
            <svg className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] -rotate-90 overflow-visible">
               <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="rgba(99, 102, 241, 0.05)"
                  strokeWidth="4"
               />
               <motion.circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="none"
                  stroke="url(#mobileGlowGradient)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.8))" }}
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

            {/* Stacked Emblem Logo & Real-time % inside circle */}
            <div className="absolute flex flex-col items-center justify-center text-center space-y-1 z-10">
               {/* Impact Logo line */}
               <span className="text-xl font-black uppercase tracking-[0.2em] text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Impact
               </span>
               {/* Quest Logo line */}
               <span className="text-2xl font-black italic text-indigo-400 font-serif tracking-normal" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                  Quest.
               </span>
               
               {/* Glowing Numeric Loader percent */}
               <div className="pt-2">
                  <span className="text-xs font-mono font-black text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                     {Math.round(progress)}%
                  </span>
               </div>
            </div>
         </div>

         {/* Bottom interactive mobile terminal briefing stream */}
         <div className="w-full max-w-xs space-y-4">
            <div className="bg-zinc-950/80 border border-white/5 rounded-2xl p-4 backdrop-blur-xl font-mono text-[9px] tracking-widest text-left text-indigo-400 space-y-2">
               <div className="flex items-center gap-2 text-emerald-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>&gt; {telemetryText}</span>
               </div>
               <div className="text-muted-foreground/30 flex justify-between text-[8px]">
                  <span>LAT: {coordinate.lat}°N</span>
                  <span>LNG: {coordinate.lng}°W</span>
               </div>
            </div>
            <div className="text-[8px] font-mono text-muted-foreground/20 uppercase tracking-[0.4em]">
               ImpactQ Mobile Induction // v4.0.1
            </div>
         </div>
      </div>

      {/* ========================================================================= */}
      {/* 💻 DESKTOP UI: Linear Telemetry Dashboard Loader */}
      {/* ========================================================================= */}
      <div className="hidden md:flex flex-col items-center justify-center w-full max-w-4xl px-6 text-center space-y-12">
         
         {/* Telemetry live scanning line */}
         <div className="flex items-center gap-6 text-[9px] font-mono font-bold tracking-[0.25em] text-indigo-400/50 mb-2">
            <span>[ SYSTEM: BOOT ]</span>
            <span className="text-emerald-500 animate-pulse">• SCANNING NODE v{coordinate.lat}</span>
         </div>

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

         {/* Digital Segmented Block Progress bar */}
         <div className="w-full max-w-md space-y-6">
            
            <div className="flex gap-1.5 justify-between w-full h-2.5 px-1 bg-zinc-950/80 rounded-lg border border-white/5 p-0.5 backdrop-blur-xl">
               {Array.from({ length: 15 }).map((_, idx) => {
                  const blockMinProgress = (idx / 15) * 100
                  const isFilled = progress >= blockMinProgress
                  return (
                     <div 
                       key={idx}
                       className={cn(
                         "flex-1 h-full rounded-sm transition-all duration-300",
                         isFilled 
                           ? "bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.6)]" 
                           : "bg-white/[0.02]"
                       )}
                     />
                  )
               })}
            </div>

            {/* Subtext and percent */}
            <div className="flex justify-between items-center px-1 font-mono text-[9px] md:text-[10px] tracking-widest text-indigo-400 leading-none">
               <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                  <span className="font-bold uppercase text-foreground/80">{telemetryText}</span>
               </div>
               <span className="font-black text-indigo-300">{Math.round(progress)}%</span>
            </div>

            {/* Minor telemetry details */}
            <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[8px] md:text-[9px] font-mono text-muted-foreground/40 tracking-[0.2em]">
               <span>LAT: {coordinate.lat}° // LNG: {coordinate.lng}°</span>
               <span>VER: V4.0.1_STABLE // SIG: ON</span>
            </div>
         </div>
      </div>
      
    </motion.div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
