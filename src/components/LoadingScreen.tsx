import * as React from "react"
import { motion } from "framer-motion"

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = React.useState(0)
  const [telemetryText, setTelemetryText] = React.useState("INITIALIZING PORTAL SYSTEM")

  // Shifting telemetry status text based on progress
  React.useEffect(() => {
    if (progress < 20) {
      setTelemetryText("INITIALIZING PORTAL CORE")
    } else if (progress < 40) {
      setTelemetryText("RESOLVING GEOMETRIC COORDINATES")
    } else if (progress < 60) {
      setTelemetryText("SYNCING SECURE XP LEDGER")
    } else if (progress < 80) {
      setTelemetryText("MATCHING ENGAGEMENT ENGINES")
    } else if (progress < 99) {
      setTelemetryText("CALIBRATING INTERFACE PORTS")
    } else {
      setTelemetryText("CONNECTION ESTABLISHED")
    }
  }, [progress])

  React.useEffect(() => {
    const duration = 2600 // Snappy, premium, and fluid loading time
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
    }, duration + 300)

    return () => {
      clearInterval(timer)
      clearTimeout(completionTimer)
    }
  }, [onComplete])

  // Segment count for progress bar
  const totalSegments = 16
  const activeSegments = Math.floor((progress / 100) * totalSegments)

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] bg-[#09090b] flex flex-col items-center justify-center overflow-hidden text-white select-none p-4"
    >
      {/* 1. Structural Grid Background (Pure Semi-Brutalist Grid) */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '3.5rem 3.5rem',
        }}
      />
      
      {/* Subtle black overlay for cinematic vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#09090b]/60 to-[#09090b] pointer-events-none" />

      {/* 2. PC / DESKTOP PRELOADER */}
      <div className="hidden md:flex flex-col items-center justify-center w-full max-w-lg relative">
        
        {/* Asymmetrical Floating Accent Stamp (Neo-Brutalist detail) */}
        <motion.div
          initial={{ x: 20, y: -20, opacity: 0, rotate: 12 }}
          animate={{ x: 0, y: 0, opacity: 1, rotate: 6 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="absolute -top-6 -right-6 z-20 border-2 border-white px-3 py-1 text-[10px] font-mono font-bold text-white shadow-[2px_2px_0px_#000]"
          style={{ backgroundColor: 'hsl(var(--p))' }}
        >
          IQ_SYS.v4.0
        </motion.div>

        {/* Central Card Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 18 }}
          className="w-full bg-zinc-900 border-4 border-white p-8 flex flex-col space-y-6 relative"
          style={{ boxShadow: '8px 8px 0px hsl(var(--p))' }}
        >
          {/* Header Row */}
          <div className="flex justify-between items-center text-[10px] font-mono tracking-wider text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-none animate-ping" />
              <span>STATUS: ONLINE</span>
            </div>
            <span>[ SYSTEM PORTAL CORE ]</span>
          </div>

          {/* Solid Divider */}
          <div className="w-full h-[2px] bg-white/20" />

          {/* Big Chunky Brutalist Logo Section */}
          <div className="flex flex-col space-y-1">
            <h1 className="text-6xl font-black tracking-tighter leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              IMPACT
            </h1>
            <h2 className="text-5xl font-serif italic leading-none pl-1 flex items-center gap-2" style={{ fontFamily: "'Instrument Serif', serif", color: 'hsl(var(--p))' }}>
              Quest.
              <span className="inline-block w-4 h-4 border border-white" style={{ backgroundColor: 'hsl(var(--p))' }} />
            </h2>
          </div>

          {/* Segmented LED Bar Container */}
          <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-mono text-zinc-400">
              <span>LOADING PROGRESS</span>
              <span className="font-bold font-mono text-lg" style={{ color: 'hsl(var(--p))' }}>{Math.round(progress)}%</span>
            </div>
            
            {/* Chunky Brutalist Bar */}
            <div className="h-9 border-2 border-white bg-zinc-950 p-1 flex gap-1 items-center">
              {Array.from({ length: totalSegments }).map((_, index) => {
                const isFilled = index < activeSegments
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex-1 h-full transition-colors duration-150 rounded-none"
                    style={{ 
                      backgroundColor: isFilled ? 'hsl(var(--p))' : 'transparent',
                      border: isFilled ? '1px solid rgba(255,255,255,0.2)' : 'none',
                      opacity: isFilled ? 1 : 0.1,
                      backgroundImage: isFilled ? 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)' : 'none',
                      backgroundSize: '8px 8px'
                    }}
                  />
                )
              })}
            </div>
          </div>

          {/* Solid Divider */}
          <div className="w-full h-[1px] bg-white/10" />

          {/* Footer Telemetry Row */}
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="font-bold animate-pulse" style={{ color: 'hsl(var(--p))' }}>&gt;</span>
              <span className="truncate max-w-[280px]">{telemetryText}</span>
            </div>
            <span className="text-[8px] bg-white/10 px-2 py-0.5 font-bold uppercase tracking-widest text-zinc-300">
              STABLE_CORE
            </span>
          </div>

        </motion.div>
      </div>

      {/* 3. MOBILE EXCLUSIVE PRELOADER */}
      <div className="md:hidden flex flex-col items-center justify-center w-full max-w-xs relative">
        
        {/* Floating Asymmetric Accent (Neo-Brutalist Badge) */}
        <motion.div
          initial={{ x: 10, y: -10, opacity: 0, rotate: -6 }}
          animate={{ x: 0, y: 0, opacity: 1, rotate: -4 }}
          transition={{ delay: 0.15, type: "spring" }}
          className="absolute -top-4 -left-3 z-20 bg-amber-500 border-2 border-white px-2 py-0.5 text-[8px] font-mono font-bold text-white shadow-[2px_2px_0px_#000]"
        >
          [MOBILE_IND]
        </motion.div>

        {/* Square Brutalist Card */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 16 }}
          className="w-full aspect-square bg-zinc-900 border-4 border-white p-6 flex flex-col justify-between relative"
          style={{ boxShadow: '6px 6px 0px hsl(var(--p))' }}
        >
          {/* Top Info Slot */}
          <div className="flex justify-between items-center text-[8px] font-mono text-zinc-400">
            <span>[ SYSTEM: IQ-MOBILE ]</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-none animate-pulse" style={{ backgroundColor: 'hsl(var(--p))' }} />
              <span>ACTIVE</span>
            </div>
          </div>

          {/* Centered Brand Stack */}
          <div className="flex flex-col space-y-0.5 my-auto text-left">
            <h2 className="text-4xl font-black tracking-tight leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              IMPACT
            </h2>
            <div className="h-[2px] w-12 bg-white/40 my-1" />
            <h3 className="text-4xl font-serif italic leading-none" style={{ fontFamily: "'Instrument Serif', serif", color: 'hsl(var(--p))' }}>
              Quest.
            </h3>
          </div>

          {/* Bottom Progress Metrics and Chunky Loader */}
          <div className="space-y-3">
            {/* Raw Numeric Loader Header */}
            <div className="flex justify-between items-end">
              <span className="text-[8px] font-mono text-zinc-500 leading-none">PROGRESS MODULE</span>
              <span className="text-2xl font-mono font-black text-white leading-none">
                {Math.round(progress)}<span className="text-[12px] ml-0.5" style={{ color: 'hsl(var(--p))' }}>%</span>
              </span>
            </div>

            {/* Flat loading line progress block */}
            <div className="h-4 border-2 border-white bg-zinc-950 p-0.5 relative overflow-hidden">
              <motion.div 
                className="h-full" 
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: 'hsl(var(--p))'
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

        </motion.div>

        {/* Telemetry subtitle just beneath the card */}
        <div className="w-full text-center mt-5 font-mono text-[9px] text-zinc-400/80 px-2 tracking-wide leading-relaxed">
          &gt; {telemetryText}
        </div>
      </div>

    </motion.div>
  )
}
