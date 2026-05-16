import * as React from "react"
import { motion } from "framer-motion"
import { 
  FlashIcon as Zap, 
  SparklesIcon as Sparkles, 
  CpuIcon as Cpu, 
  Layers01Icon as Layers, 
  GlobeIcon as Globe, 
  Shield01Icon as Shield, 
  Target01Icon as Target,
  ArrowRight01Icon as ArrowRight,
  Clock01Icon as Clock,
  RocketIcon as Rocket,
  Award01Icon as Trophy,
  Comment01Icon as Chat,
  PackageIcon as Package,
  CompassIcon as MapIcon,
} from "hugeicons-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

const typeColor: Record<string, string> = {
  New:          "bg-indigo-600/10 text-indigo-600 border-indigo-600/20",
  AI:           "bg-purple-600/10 text-purple-600 border-purple-600/20",
  Improvement:  "bg-amber-600/10 text-amber-600 border-amber-600/20",
  Security:     "bg-emerald-600/10 text-emerald-600 border-emerald-600/20",
  Infrastructure:"bg-blue-600/10 text-blue-600 border-blue-600/20",
  Genesis:      "bg-rose-600/10 text-rose-600 border-rose-600/20",
  Release:      "bg-indigo-600/10 text-indigo-600 border-indigo-600/20",
  Strategy:     "bg-amber-600/10 text-amber-600 border-amber-600/20",
}

const tagColor: Record<string, string> = {
  Production:    "bg-indigo-600 text-white",
  Security:      "bg-emerald-600 text-white",
  Feature:       "bg-amber-500 text-black",
  AI:            "bg-purple-600 text-white",
  Utility:       "bg-blue-600 text-white",
  Core:          "bg-orange-500 text-white",
  Intelligence:  "bg-purple-700 text-white",
  Architecture:  "bg-slate-600 text-white",
  Engagement:    "bg-amber-600 text-black",
  Vision:        "bg-rose-600 text-white",
}

const updates = [
  {
    version: "v2.0",
    title: "MVP Submission Build",
    date: "Apr 2026",
    tag: "Production",
    icon: Trophy,
    features: [
      { name: "Hackathon Ready", desc: "Prioritized core features for live demo readiness and stability.", type: "Release" },
      { name: "Production Deployment", desc: "Optimized for Vercel and Railway with stable AI-assisted workflows.", type: "Infrastructure" },
      { name: "UI Polish", desc: "Refined user flows for fast judge understanding and practical usability.", type: "Improvement" }
    ]
  },
  {
    version: "v1.9",
    title: "Role-Based Access Control",
    date: "Apr 2026",
    tag: "Security",
    icon: Shield,
    features: [
      { name: "Authorized Roles", desc: "Restricted advanced operational tools to authorized NGO roles.", type: "Security" },
      { name: "User Segregation", desc: "Defined separate experiences for Volunteers, NGOs, and Customers.", type: "New" }
    ]
  },
  {
    version: "v1.8",
    title: "Nearby Activity Intelligence",
    date: "Mar 2026",
    tag: "Feature",
    icon: MapIcon,
    features: [
      { name: "Geographic Relevance", desc: "Real-time discovery of NGO opportunities focused on local areas.", type: "New" },
      { name: "Map Discovery", desc: "Interactive map-based exploration of community tasks and events.", type: "New" }
    ]
  },
  {
    version: "v1.7",
    title: "Chat Intelligence Upgrade",
    date: "Mar 2026",
    tag: "AI",
    icon: Chat,
    features: [
      { name: "AI Chat Assistant", desc: "Upgraded team chat with AI that detects actionable opportunities in conversations.", type: "AI" },
      { name: "Smart Prompts", desc: "Automated task creation and summaries directly from chat logs.", type: "New" }
    ]
  },
  {
    version: "v1.6",
    title: "Inventory Management",
    date: "Feb 2026",
    tag: "Utility",
    icon: Package,
    features: [
      { name: "Live Tracking", desc: "Real-time inventory system for equipment and resource availability management.", type: "New" },
      { name: "AI Gear Suggestions", desc: "Automated equipment recommendations based on mission requirements.", type: "AI" }
    ]
  },
  {
    version: "v1.5",
    title: "Volunteer Energy System",
    date: "Feb 2026",
    tag: "Core",
    icon: Zap,
    features: [
      { name: "Fatigue-Aware Logic", desc: "Energy score system (0-100) to ensure sustainable volunteer deployment.", type: "New" },
      { name: "Readiness Logic", desc: "Assignment logic based on volunteer stamina and availability.", type: "Improvement" }
    ]
  },
  {
    version: "v1.4",
    title: "Mission Intelligence System",
    date: "Jan 2026",
    tag: "Intelligence",
    icon: Target,
    features: [
      { name: "Request Conversion", desc: "Convert scattered help requests into organized, prioritized missions.", type: "AI" },
      { name: "Structured Missions", desc: "Dynamic mission cards with area, priority, and status recommendations.", type: "New" }
    ]
  },
  {
    version: "v1.3",
    title: "AI Intelligence Layer",
    date: "Jan 2026",
    tag: "Architecture",
    icon: Cpu,
    features: [
      { name: "Operational AI", desc: "Integrated smart matching and mission prioritization engines.", type: "AI" },
      { name: "Profile Insights", desc: "Skill-based recommendations and readiness scoring for all users.", type: "New" }
    ]
  },
  {
    version: "v1.2",
    title: "Gamification Layer",
    date: "Dec 2025",
    tag: "Engagement",
    icon: Trophy,
    features: [
      { name: "XP & Levels", desc: "Implemented XP points and rank progression to improve participation.", type: "New" },
      { name: "Achievement Matrix", desc: "Digital badges and milestones for contribution tracking.", type: "New" }
    ]
  },
  {
    version: "v1.1",
    title: "Platform Structure",
    date: "Dec 2025",
    tag: "Architecture",
    icon: Layers,
    features: [
      { name: "Core Architecture", desc: "Designed the multi-page system (Dashboard, Missions, Profiles, Groups).", type: "Infrastructure" },
      { name: "Communication Grid", desc: "Introduced integrated chat and inventory systems.", type: "New" }
    ]
  },
  {
    version: "v1.0",
    title: "Initial Concept",
    date: "Nov 2025",
    tag: "Vision",
    icon: Rocket,
    features: [
      { name: "Core Vision", desc: "Defined the AI-powered Volunteer Management Platform concept.", type: "Genesis" },
      { name: "User Groups", desc: "Identified Volunteers, NGOs, and Customers as primary stakeholders.", type: "Strategy" }
    ]
  }
]

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">

      {/* Hero */}
      <section className="px-6 md:px-12 pt-36 pb-16 max-w-4xl mx-auto">
        <motion.div {...fadeUp} className="space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-indigo-600 transition-colors"
          >
            <ArrowRight className="h-4 w-4 rotate-180" /> Back to home
          </Link>
          <span className="inline-flex items-center gap-2 text-indigo-600 text-[10px] font-bold uppercase tracking-widest">
            <Clock className="h-3.5 w-3.5" /> Development Log
          </span>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
            How we got<br />
            <span className="text-indigo-600">here.</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed max-w-xl">
            A precise timeline of ImpactQuest's journey — from initial concept to a production-grade platform.
          </p>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex flex-wrap gap-6 mt-10"
        >
          {[
            { label: "Versions", value: "11" },
            { label: "Features", value: "22+" },
            { label: "Status", value: "Live" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-secondary/40 border border-border/40">
              <span className="text-xl font-bold text-foreground">{s.value}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Timeline */}
      <section className="px-6 md:px-12 pb-24 max-w-4xl mx-auto">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-600/40 via-border/30 to-transparent" />

          <div className="space-y-2">
            {updates.map((update, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.04, duration: 0.6 }}
                className="relative pl-16"
              >
                {/* Timeline dot */}
                <div className={cn(
                  "absolute left-[15px] top-7 h-3 w-3 rounded-full border-2 bg-background z-10 transition-all",
                  i === 0
                    ? "border-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.6)]"
                    : "border-border/60 group-hover:border-indigo-600"
                )} />

                <div className="group py-6 border-b border-border/20 last:border-0">
                  {/* Header row */}
                  <div className="flex flex-wrap items-start gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-secondary/50 border border-border/40 flex items-center justify-center shrink-0 group-hover:bg-indigo-600/10 group-hover:border-indigo-600/20 transition-all">
                      <update.icon className="h-5 w-5 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{update.version}</span>
                        <span className="text-[10px] text-muted-foreground/30">·</span>
                        <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{update.date}</span>
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                          tagColor[update.tag] || "bg-secondary text-muted-foreground"
                        )}>
                          {update.tag}
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground group-hover:text-indigo-600 transition-colors">
                        {update.title}
                      </h2>
                    </div>
                  </div>

                  {/* Feature items */}
                  <div className="space-y-4 pl-1">
                    {update.features.map((feat, fi) => (
                      <div key={fi} className="flex items-start gap-3">
                        <span className={cn(
                          "mt-0.5 shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                          typeColor[feat.type] || "bg-secondary text-muted-foreground border-border/40"
                        )}>
                          {feat.type}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-foreground">{feat.name}</p>
                          <p className="text-sm text-muted-foreground font-medium leading-relaxed mt-0.5">{feat.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="px-6 md:px-12 py-10 border-t border-border/30 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
          © 2026 ImpactQuest · v2.0 Stable
        </p>
        <Link to="/pricing">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600/10 text-indigo-600 text-[11px] font-bold uppercase tracking-wider hover:bg-indigo-600/20 transition-all">
            View Pricing <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Link>
      </div>

    </div>
  )
}
