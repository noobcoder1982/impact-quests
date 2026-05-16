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
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
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
    <div className="bg-background min-h-screen">

      {/* Hero */}
      <section className="px-6 pt-36 pb-20 md:px-12 max-w-4xl mx-auto">
        <motion.div {...fadeUp} className="space-y-6">
          <span className="inline-flex items-center gap-2 text-indigo-600 text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" /> About ImpactQ
          </span>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
            We're building the<br />
            <span className="text-indigo-600">infrastructure for good.</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
            ImpactQuest connects skilled volunteers with the missions that need them most — using real-time data, AI-driven matching, and a platform built for scale.
          </p>
        </motion.div>
      </section>

      {/* Stats Row */}
      <section className="px-6 md:px-12 pb-20 max-w-4xl mx-auto">
        <motion.div 
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/40 rounded-2xl overflow-hidden border border-border/40"
        >
          {stats.map((s, i) => (
            <div key={i} className="bg-background flex flex-col items-center justify-center py-8 px-4 gap-1">
              <span className="text-3xl md:text-4xl font-bold text-foreground">{s.value}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Our Story */}
      <section className="px-6 md:px-12 py-16 max-w-4xl mx-auto border-t border-border/40">
        <motion.div {...fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Our Story</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Born from frustration.<br />Built with purpose.
            </h2>
          </div>
          <div className="space-y-5 text-muted-foreground font-medium leading-relaxed">
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

      {/* Values */}
      <section className="px-6 md:px-12 py-16 max-w-4xl mx-auto border-t border-border/40">
        <motion.div {...fadeUp} className="space-y-10">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">What We Believe</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Our values.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group p-6 rounded-2xl border border-border/50 bg-card hover:border-indigo-600/30 transition-all duration-300"
              >
                <div className="h-10 w-10 rounded-xl bg-indigo-600/10 flex items-center justify-center mb-4 group-hover:bg-indigo-600/20 transition-colors">
                  <v.icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-20 max-w-4xl mx-auto border-t border-border/40">
        <motion.div {...fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Ready to make impact?</h2>
            <p className="text-muted-foreground font-medium">Join 50,000+ volunteers already on the platform.</p>
          </div>
          <Link to="/signin" className="w-full sm:w-auto shrink-0">
            <button className="w-full sm:w-auto h-14 px-8 rounded-xl bg-indigo-600 text-white font-bold text-base flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-600/20">
              Get Started <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Footer strip */}
      <div className="px-6 md:px-12 py-8 border-t border-border/30 max-w-4xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 text-center">
          © 2026 ImpactQuest · All Rights Reserved
        </p>
      </div>

    </div>
  )
}



