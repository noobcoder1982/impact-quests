import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"

export default function DashboardPreview() {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  
  // Scroll animations for the container itself (scale & perspective)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  const rotateX = useTransform(scrollYProgress, [0, 0.4], [15, 0])
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.85, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0.4, 1])

  return (
    <div ref={containerRef} className="perspective-[2000px] w-full max-w-7xl mx-auto px-4 md:px-8 relative z-30">
      <motion.div
        style={{
          rotateX,
          scale,
          opacity,
          transformStyle: "preserve-3d"
        }}
        className="relative rounded-[2.5rem] border border-white/10 bg-[#070708]/80 backdrop-blur-3xl p-3 md:p-6 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] overflow-hidden flex items-center justify-center"
      >
        {/* Sleek top glowing divider */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

        {/* The Live Dashboard Image - High Fidelity */}
        <div className="relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl w-full">
          <img 
            src="/dashboard-live.png" 
            alt="ImpactQuest Strategy Hub" 
            className="w-full h-auto object-cover opacity-95 transition-opacity duration-500"
          />
          
          {/* Glass Overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>
      </motion.div>
    </div>
  )
}
