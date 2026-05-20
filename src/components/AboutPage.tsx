import * as React from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { 
  Shield01Icon as Shield, 
  Target01Icon as Target, 
  GlobeIcon as Globe,
  ArrowRight01Icon as ArrowRight,
  SparklesIcon as Sparkles,
  FavouriteIcon as Heart
} from "hugeicons-react"

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
}

const values = [
  {
    icon: Target,
    title: "Mission First",
    desc: "Every feature, every decision, every line of code exists to get volunteers to the right place at the right time."
  },
  {
    icon: Globe,
    title: "Borderless by Design",
    desc: "We're built for a world without boundaries — supporting 50+ languages and cross-border coordination from day one."
  },
  {
    icon: Shield,
    title: "Radically Transparent",
    desc: "Every contribution is tracked, verified, and visible. We believe trust is built through accountability."
  },
  {
    icon: Heart,
    title: "Community Powered",
    desc: "We're nothing without our volunteers. Our platform is shaped by the people who use it every day."
  }
]

const stats = [
  { value: "50k+", label: "Volunteers" },
  { value: "120+", label: "Countries" },
  { value: "99.9%", label: "Uptime" },
  { value: "2022", label: "Founded" }
]

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen relative text-foreground font-sans overflow-x-hidden select-none pb-12 pt-28">
      {/* 1. Structural Blueprint Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(120, 120, 120, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(120, 120, 120, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '4.5rem 4.5rem',
        }}
      />

      <div className="max-w-4xl mx-auto px-6 space-y-20 relative z-10">
        
        {/* HERO SECTION */}
        <section className="space-y-8">
          <motion.div {...fadeUp} className="space-y-6">
            {/* Monospace Badge */}
            <div className="inline-flex items-center gap-2 border-2 border-foreground bg-secondary px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" style={{ color: 'hsl(var(--p))' }} />
              <span>SYSTEM_MANIFESTO: v4.0</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              WE'RE BUILDING THE<br />
              <span className="italic font-serif font-light text-muted-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>infrastructure for</span>{' '}
              <span style={{ color: 'hsl(var(--p))' }}>GOOD.</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground font-mono leading-relaxed max-w-2xl border-l-4 border-foreground pl-4">
              &gt; ImpactQuest connects skilled volunteers with the missions that need them most — using real-time data, AI-driven matching, and a platform built for scale.
            </p>
          </motion.div>
        </section>

        {/* STATS SECTION */}
        <section>
          <motion.div 
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-0 border-4 border-foreground divide-y-4 md:divide-y-0 md:divide-x-4 divide-foreground bg-background"
          >
            {stats.map((s, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center justify-center py-10 px-4 gap-2 text-center group transition-colors duration-150 hover:bg-secondary/40"
              >
                <span className="text-3xl md:text-4xl font-mono font-black text-foreground">{s.value}</span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </section>

        {/* OUR STORY SECTION */}
        <section className="border-4 border-foreground bg-card" style={{ boxShadow: '6px 6px 0px hsl(var(--p))' }}>
          <motion.div {...fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y-4 md:divide-y-0 md:divide-x-4 divide-foreground">
            {/* Title Cell */}
            <div className="p-8 md:p-10 flex flex-col justify-between space-y-8 bg-secondary/20">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">[ 01_ORIGINS ]</span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                BORN FROM<br />FRUSTRATION.<br />
                <span className="italic font-serif font-light" style={{ fontFamily: "'Instrument Serif', serif", color: 'hsl(var(--p))' }}>Built with purpose.</span>
              </h2>
            </div>
            
            {/* Narrative Cell */}
            <div className="p-8 md:p-10 space-y-6 text-sm font-mono text-muted-foreground leading-relaxed">
              <p>
                We saw how fragmented volunteering was — spreadsheets, email chains, missed connections. Thousands of willing hands, and no system to direct them.
              </p>
              <p>
                ImpactQuest was built to fix that. A single, unified platform where volunteers are matched with missions, impact is tracked, and communities are strengthened.
              </p>
              <p>
                Today, we're a growing team of engineers, humanitarian workers, and designers who believe technology should serve people — not the other way around.
              </p>
            </div>
          </motion.div>
        </section>

        {/* VALUES SECTION */}
        <section className="space-y-8">
          <motion.div {...fadeUp} className="space-y-3">
            <div className="inline-flex items-center gap-2 border-2 border-foreground bg-secondary px-3 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider">
              <span>[ 02_CORE_VALUES ]</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>WHAT WE BELIEVE.</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="p-6 border-4 border-foreground bg-card hover:bg-secondary/20 transition-all duration-200"
                style={{ boxShadow: '5px 5px 0px hsl(var(--p))' }}
              >
                {/* Raw Icon Frame */}
                <div className="h-12 w-12 border-2 border-foreground bg-secondary flex items-center justify-center mb-6">
                  <v.icon className="h-5 w-5 text-foreground" />
                </div>
                
                <h3 className="text-xl font-black text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{v.title}</h3>
                <p className="text-sm font-mono text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="border-4 border-foreground bg-foreground text-background p-8 md:p-12 relative overflow-hidden" style={{ boxShadow: '8px 8px 0px hsl(var(--p))' }}>
          <motion.div 
            {...fadeUp} 
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10"
          >
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                READY TO MAKE IMPACT?
              </h2>
              <p className="font-mono text-xs opacity-80 uppercase tracking-wider">
                &gt; Join 50,000+ volunteers already active on the system.
              </p>
            </div>
            
            <Link to="/signin" className="w-full md:w-auto shrink-0">
              <button 
                className="w-full md:w-auto px-8 py-4 border-2 border-background font-mono font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-95"
                style={{ 
                  backgroundColor: 'hsl(var(--p))',
                  color: 'white',
                  boxShadow: '4px 4px 0px var(--theme-l-fg, #fff)'
                }}
              >
                GET STARTED <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
          </motion.div>
        </section>

        {/* FOOTER STRIP */}
        <div className="py-4 border-t-2 border-foreground/30 text-center">
          <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground/40">
            © 2026 ImpactQuest · SYSTEM AUTHENTICATED
          </p>
        </div>

      </div>
    </div>
  )
}
