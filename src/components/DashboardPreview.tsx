import * as React from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

export default function DashboardPreview() {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  
  // States for the magical loading and reveal sequence
  // stages: 'idle' (waiting for scroll trigger) -> 'loading' -> 'morphing' -> 'orbiting' -> 'boom' -> 'revealed'
  const [stage, setStage] = React.useState<'idle' | 'loading' | 'morphing' | 'orbiting' | 'boom' | 'revealed'>('idle')
  const [progress, setProgress] = React.useState(0)

  // Scroll animations for the container itself (scale & perspective)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  const rotateX = useTransform(scrollYProgress, [0, 0.4], [15, 0])
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.85, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0.4, 1])

  // Trigger sequence when component is scrolled into view or mounted
  React.useEffect(() => {
    if (stage !== 'idle') return
    
    // Start loading sequence
    setStage('loading')
    
    const duration = 2000 // 2 seconds linear progress load
    const intervalTime = 20
    const steps = duration / intervalTime
    const stepVal = 100 / steps
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        return prev + stepVal
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [stage])

  // Manage stage transitions after progress completes
  React.useEffect(() => {
    if (progress < 100) return

    // 1. Morph: Collapse progress bar into center white dot
    setStage('morphing')

    // 2. Orbit: Start circular text orbit after morph completes (400ms)
    const orbitTimeout = setTimeout(() => {
      setStage('orbiting')
    }, 450)

    // 3. Boom: Explode white dot and reveal the dashboard (1800ms of orbiting)
    const boomTimeout = setTimeout(() => {
      setStage('boom')
    }, 2250)

    // 4. Revealed: Complete reveal sequence (500ms after boom)
    const revealedTimeout = setTimeout(() => {
      setStage('revealed')
    }, 2750)

    return () => {
      clearTimeout(orbitTimeout)
      clearTimeout(boomTimeout)
      clearTimeout(revealedTimeout)
    }
  }, [progress])

  return (
    <div ref={containerRef} className="perspective-[2000px] w-full max-w-7xl mx-auto px-4 md:px-8 relative z-30">
      <motion.div
        style={{
          rotateX,
          scale,
          opacity,
          transformStyle: "preserve-3d"
        }}
        className="relative rounded-[2.5rem] border border-white/10 bg-[#070708]/80 backdrop-blur-3xl p-3 md:p-6 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden min-h-[300px] md:min-h-[500px] flex items-center justify-center transition-all duration-700"
      >
        {/* Sleek top glowing divider */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        <AnimatePresence mode="wait">
          {stage !== 'revealed' ? (
            <motion.div
              key="loader-container"
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col items-center justify-center min-h-[350px] md:min-h-[480px] relative overflow-hidden"
            >
              {/* Magical Grid Background for the Loader */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

              {/* Centered Magical Text */}
              <div className="z-10 text-center select-none py-6 relative">
                <motion.h2 
                  initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{ duration: 1 }}
                  className="text-4xl md:text-7xl font-black uppercase tracking-[0.25em] bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent font-sans"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  strategic resilience
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="text-[9px] font-black uppercase tracking-[0.6em] text-white mt-3"
                >
                  System Induction Protocol Active
                </motion.p>
              </div>

              {/* Magical Loading & Morphing Interface */}
              <div className="w-full max-w-md h-12 flex items-center justify-center mt-12 relative z-20">
                {stage === 'loading' && (
                  <div className="w-full space-y-4">
                    {/* Linear Progress Bar */}
                    <div className="w-full h-1 bg-white/5 rounded-full relative overflow-hidden">
                      <motion.div 
                        className="absolute inset-y-0 left-0 bg-white rounded-full"
                        style={{ width: `${progress}%`, boxShadow: "0 0 15px #ffffff" }}
                      />
                    </div>
                    {/* Percentage counter */}
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-white/30 px-1">
                      <span>Syncing Grid Nodes</span>
                      <span className="text-white/60">{Math.round(progress)}%</span>
                    </div>
                  </div>
                )}

                {stage === 'morphing' && (
                  <motion.div 
                    initial={{ width: "100%", height: "4px" }}
                    animate={{ width: "12px", height: "12px", borderRadius: "50%" }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white shadow-[0_0_30px_10px_rgba(255,255,255,0.8)]"
                  />
                )}

                {stage === 'orbiting' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* The magical orbiting white sphere */}
                    <motion.div 
                      animate={{
                        x: [0, 260, 0, -260, 0],
                        y: [-90, 0, 90, 0, -90],
                        scale: [1, 1.3, 1, 0.8, 1],
                        opacity: [1, 1, 1, 0.7, 1]
                      }}
                      transition={{
                        duration: 1.5,
                        ease: "linear",
                        repeat: Infinity
                      }}
                      className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_35px_12px_rgba(255,255,255,1),0_0_15px_3px_#6366f1] z-30"
                    />

                    {/* Faint ambient trail loop */}
                    <div className="absolute w-[520px] h-[180px] rounded-full border border-white/5 bg-radial-gradient from-transparent via-white/[0.01] to-transparent pointer-events-none" />
                  </div>
                )}

                {stage === 'boom' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Expanding shockwave expansion circle */}
                    <motion.div 
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 120, opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="w-10 h-10 rounded-full bg-white shadow-[0_0_100px_40px_rgba(255,255,255,1)] z-40"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* The Live Dashboard Image - Fully Revealed Underneath */
            <motion.div
              key="dashboard-image"
              initial={{ opacity: 0, scale: 0.97, filter: "blur(20px)" }}
              animate={{ opacity: 0.95, scale: 1, filter: "blur(0px)" }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl w-full"
            >
              <img 
                src="/dashboard-live.png" 
                alt="ImpactQuest Strategy Hub" 
                className="w-full h-auto object-cover transition-all duration-1000"
              />
              
              {/* Premium cinematic glass overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-indigo-600/5 mix-blend-overlay pointer-events-none animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  )
}
