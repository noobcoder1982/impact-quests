import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

export default function DashboardPreview() {
  const ref = React.useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  // Perspective and scale animations based on scroll
  const rotateX = useTransform(scrollYProgress, [0, 0.4], [15, 0])
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.8, 1])
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])

  return (
    <div ref={ref} className="perspective-[2000px] w-full max-w-7xl mx-auto px-4 md:px-8">
      <motion.div
        style={{
          rotateX,
          scale,
          opacity,
          transformStyle: "preserve-3d"
        }}
        className="relative rounded-[2.5rem] border border-white/10 bg-[#0f172a]/40 backdrop-blur-3xl p-3 md:p-6 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Decorative Internal Glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        
        {/* The Live Dashboard Image - High Fidelity */}
        <div className="relative rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
           <img 
             src="/dashboard-live.png" 
             alt="ImpactQuest Strategy Hub" 
             className="w-full h-auto object-cover opacity-90 transition-opacity duration-1000 group-hover:opacity-100"
           />
           
           {/* Glass Overlay for depth */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Tactical Annotation Layer (Only visible when stationary or scroll reached) */}
        <div className="absolute inset-0 pointer-events-none">
           {/* We can add annotations here if needed, but better to do them in Home.tsx for more control */}
        </div>
      </motion.div>
    </div>
  )
}
