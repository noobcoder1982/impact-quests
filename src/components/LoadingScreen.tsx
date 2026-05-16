import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface LoadingScreenProps {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = React.useState(0)
  const text = "ImpactQuest"

  React.useEffect(() => {
    const duration = 3500 // 3.5 seconds total
    const interval = 30 
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
    }, duration + 800)

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
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const letterVariant = {
    hidden: { opacity: 0, filter: "blur(20px)", y: 5 },
    visible: { 
      opacity: 1, 
      filter: "blur(0px)", 
      y: 0,
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(30px)" }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] bg-[#030303] flex flex-col items-center justify-center overflow-hidden"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* MOBILE UI: Circular Loader */}
      <div className="md:hidden relative flex flex-col items-center justify-center w-full">
         <div className="relative flex items-center justify-center p-20">
            {/* Background Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 overflow-visible opacity-5">
               <circle cx="50%" cy="50%" r="48%" fill="none" stroke="white" strokeWidth="1" />
            </svg>

            {/* Active Progress Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 overflow-visible">
               <motion.circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: progress / 100 }}
                  transition={{ duration: 0.2, ease: "linear" }}
               />
            </svg>

            {/* Logo Text (Mobile Size) */}
            <motion.div 
              variants={container}
              initial="hidden"
              animate="visible"
              className="flex items-center justify-center overflow-visible z-10"
            >
               {text.split("").map((char, i) => (
                 <motion.span
                   key={i}
                   variants={letterVariant}
                   className={cn(
                     "text-4xl font-bold tracking-tighter text-white inline-block",
                     i >= 6 ? "opacity-20 font-light" : "opacity-100"
                   )}
                 >
                   {char}
                 </motion.span>
               ))}
            </motion.div>

            {/* Mobile Percentage */}
            <div className="absolute bottom-10">
              <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em]">
                {Math.round(progress)}%
              </span>
            </div>
         </div>
      </div>

      {/* DESKTOP UI: Linear Loader (Previous Version) */}
      <div className="hidden md:flex flex-col items-center gap-20 w-full max-w-4xl">
         {/* Logo Text (Desktop Size) */}
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
                  "text-8xl lg:text-[7rem] font-bold tracking-tighter text-white inline-block",
                  i >= 6 ? "opacity-30 font-light" : "opacity-100"
                )}
              >
                {char}
              </motion.span>
            ))}
         </motion.div>

         {/* Linear Progress Interface */}
         <div className="w-full max-w-md space-y-6">
            <div className="w-full h-1.5 bg-white/5 rounded-full relative overflow-hidden backdrop-blur-sm">
               <motion.div 
                  className="absolute inset-y-0 left-0 rounded-full z-10"
                  style={{ backgroundColor: "#ffffff" }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
               />
               <motion.div 
                  className="absolute inset-y-0 left-0 blur-md opacity-70 rounded-full"
                  style={{ backgroundColor: "#ffffff" }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
               />
               <motion.div 
                  className="absolute inset-y-0 left-0 blur-xl opacity-30 rounded-full"
                  style={{ backgroundColor: "#ffffff" }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
               />
            </div>
            
            <div className="flex justify-between items-center px-1">
               <div className="flex items-center gap-3">
                  <div 
                    className="h-1.5 w-1.5 rounded-full animate-pulse" 
                    style={{ backgroundColor: "#ffffff", boxShadow: "0 0 8px #ffffff" }}
                  />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] leading-none">
                    {Math.round(progress)}% Integrated
                  </span>
               </div>
               <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] leading-none">
                 v4.0.1 Stable
               </span>
            </div>
         </div>
      </div>

      {/* Shared Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
    </motion.div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}


