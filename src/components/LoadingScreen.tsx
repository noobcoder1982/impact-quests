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

  // Real-time telemetry log shifting based on progress level
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

  // Rapidly shifting raw geographic coordinates to simulate real-time AI scanning
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
    const duration = 3200 // Snappy 3.2 seconds total induction sequence
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
      {/* Dynamic Background Cybernet Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:30px_30px] opacity-40 pointer-events-none" />

      {/* Futuristic Orbit Ambient Spotlight Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none [animation-delay:1s]" />

      {/* Cybernetic Neural Rings Rotating in opposite directions */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-visible">
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
           className="w-[280px] h-[280px] md:w-[460px] md:h-[460px] rounded-full border border-dashed border-indigo-500/10 flex items-center justify-center"
         />
         <motion.div 
           animate={{ rotate: -360 }}
           transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
           className="absolute inset-4 rounded-full border border-double border-cyan-500/5 flex items-center justify-center"
         />
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
           className="absolute inset-10 rounded-full border border-indigo-500/5 [stroke-dasharray:10_15]"
         />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-6 text-center space-y-12">
         
         {/* Live Scanning Indicators */}
         <div className="flex items-center gap-6 text-[9px] font-mono font-bold tracking-[0.25em] text-indigo-400/50 mb-2">
            <span>[ SYSTEM: BOOT ]</span>
            <span className="text-emerald-500 animate-pulse">• SCANNING NODE v{coordinate.lat}</span>
         </div>

         {/* Heading Typography Overhaul: High Contrast Pairing */}
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

         {/* Interactive Digital Segmented Fuel Rod Loader */}
         <div className="w-full max-w-md space-y-6">
            
            {/* The Digital Segmented Blocks */}
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

            {/* Shift Logs & Coordinates telemetry line */}
            <div className="flex justify-between items-center px-1 font-mono text-[9px] md:text-[10px] tracking-widest text-indigo-400 leading-none">
               <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
                  <span className="font-bold uppercase text-foreground/80">{telemetryText}</span>
               </div>
               <span className="font-black text-indigo-300">{Math.round(progress)}%</span>
            </div>

            {/* Bottom Sector Sync Telemetry Data Grid */}
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
