import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CheckmarkCircle01Icon as Check,
  Cancel01Icon as X,
  ArrowRight01Icon as ArrowRight,
  SparklesIcon as Sparkles,
  Shield01Icon as Shield,
  GlobeIcon as Globe,
  Add01Icon as Plus,
  RemoveCircleIcon as Minus
} from "hugeicons-react"
import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
}

export default function PricingPage() {
  const [billing, setBilling] = React.useState<'monthly' | 'yearly'>('monthly')

  const tiers = [
    {
      name: "Community",
      price: { monthly: "0", yearly: "0" },
      desc: "Essential tools for local groups and small initiatives.",
      tag: "Free Forever",
      color: "indigo",
      features: [
        "1 Active Chapter",
        "Group Communication Tools",
        "Unlimited Volunteer Logs",
        "Basic Impact Export",
      ],
      missing: [
        "AI-Powered Skill Matching",
        "Dedicated Support",
        "Custom Coordinator Roles",
        "Organization Branding",
      ],
      cta: "Start Free",
      highlight: false,
    },
    {
      name: "Impact",
      price: { monthly: "49", yearly: "36" },
      desc: "Precision management for growing NGOs and non-profits.",
      tag: "Most Popular",
      color: "purple",
      features: [
        "10 Activity Zones",
        "Group Communication Tools",
        "Automated Hour Verification",
        "AI-Powered Skill Matching",
        "Live Impact Dashboards",
        "Dedicated Success Manager",
        "Custom Coordinator Roles",
      ],
      missing: [
        "Organization Branding",
      ],
      cta: "Get Started",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: { monthly: "149", yearly: "112" },
      desc: "Full-scale governance for global humanitarian operations.",
      tag: "Large-Scale",
      color: "amber",
      features: [
        "Unlimited Regions",
        "Group Communication Tools",
        "Blockchain-Verified Tracking",
        "AI-Powered Skill Matching",
        "Custom Audit Reports",
        "24/7 Priority Support",
        "Custom Coordinator Roles",
        "Organization Custom Branding",
      ],
      missing: [],
      cta: "Contact Sales",
      highlight: false,
      ultra: true,
    }
  ]

  const faqs = [
    { q: "What defines an 'Active Chapter'?", a: "A chapter is a localized team or location that manages its own volunteers and missions independently." },
    { q: "Can we upgrade at any time?", a: "Absolutely. You can scale your plan as your community grows. New features unlock immediately." },
    { q: "Do you offer discounts for NGOs?", a: "Yes — ImpactQuest provides subsidized pricing for verified humanitarian non-profits. Reach out to our team." },
    { q: "How secure is volunteer data?", a: "All data is encrypted with industry-standard protocols and complies with global data protection regulations." }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden relative selection:bg-indigo-650 selection:text-white pt-20">
      
      {/* Structural Swiss Grid Lines (Visual backdrop decoration) */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.02]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-20 pb-16 max-w-4xl mx-auto text-center relative z-10">
        <motion.div {...fadeUp} className="space-y-6">
          <span className="inline-flex items-center gap-2 border-[2.5px] border-foreground px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="h-3.5 w-3.5" /> DEPLOYMENT COST PROTOCOL
          </span>
          <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-foreground uppercase leading-[0.95]">
            Plans built for<br />
            <span className="text-indigo-600 dark:text-indigo-400">maximum impact.</span>
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground font-bold leading-relaxed max-w-xl mx-auto font-mono">
            &gt; Transact community resilience at any scale. Fully open. Transparent modules. Zero hidden variables.
          </p>
        </motion.div>

        {/* Billing Toggle (Swiss Brutalist) */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex justify-center mt-12"
        >
          <div className="flex items-center border-[3px] border-foreground p-1 bg-card rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
            {(['monthly', 'yearly'] as const).map(cycle => (
              <button
                key={cycle}
                onClick={() => setBilling(cycle)}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-200 relative",
                  billing === cycle
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                )}
              >
                {cycle}
                {cycle === 'yearly' && (
                  <span className="absolute -top-3.5 -right-2 px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded-none border border-foreground shadow-[2px_2px_0px_#000]">
                    -25%
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards (Swiss Semi-Brutalist Grid) */}
      <section className="px-6 md:px-12 pb-24 max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {tiers.map((tier, i) => {
            const shadowColor = tier.ultra ? "#d97706" : tier.highlight ? "#9333ea" : "#4f46e5";
            const shadowClass = tier.ultra 
              ? "shadow-[8px_8px_0px_0px_#d97706] hover:shadow-[12px_12px_0px_0px_#d97706]" 
              : tier.highlight 
              ? "shadow-[8px_8px_0px_0px_#9333ea] hover:shadow-[12px_12px_0px_0px_#9333ea]" 
              : "shadow-[8px_8px_0px_0px_#4f46e5] hover:shadow-[12px_12px_0px_0px_#4f46e5]";

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.7 }}
                className={cn(
                  "rounded-2xl border-[3px] border-foreground bg-card p-6 md:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-x-1 hover:-translate-y-1",
                  shadowClass
                )}
              >
                {/* Badge Tag */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  <span className={cn(
                    "px-2.5 py-1 text-[9px] font-black uppercase tracking-wider border-2 border-foreground rounded-md",
                    tier.ultra ? "bg-amber-500 text-black" : tier.highlight ? "bg-purple-600 text-white" : "bg-secondary text-foreground"
                  )}>
                    {tier.tag}
                  </span>
                </div>

                <div className="space-y-6">
                  {/* Top Block: Title & Price */}
                  <div className="space-y-2 border-b-2 border-foreground/10 pb-6 pt-4">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-[0.25em] font-mono",
                      tier.ultra ? "text-amber-500" : tier.highlight ? "text-purple-600" : "text-indigo-600"
                    )}>
                      {tier.name}
                    </span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-muted-foreground/50 text-xl font-bold font-mono">$</span>
                      <span className="text-6xl font-black tracking-tighter leading-none text-foreground font-sans">
                        {tier.price[billing]}
                      </span>
                      <span className="text-muted-foreground/60 text-xs font-mono font-bold ml-1">/MONTH</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold leading-relaxed pt-2">
                      {tier.desc}
                    </p>
                  </div>

                  {/* Middle Block: Features list */}
                  <div className="space-y-4 pt-2">
                    <span className="text-[9px] font-black tracking-widest text-muted-foreground uppercase block font-mono">
                      // Core Privileges
                    </span>
                    <div className="space-y-3">
                      {tier.features.map((f, fi) => (
                        <div key={fi} className="flex items-center gap-3">
                          <div className={cn(
                            "h-5 w-5 rounded-md border-2 border-foreground flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]",
                            tier.ultra ? "bg-amber-500 text-black" : tier.highlight ? "bg-purple-600 text-white" : "bg-indigo-600 text-white"
                          )}>
                            <Check className="h-3 w-3 stroke-[3px]" />
                          </div>
                          <span className="text-xs font-bold text-foreground">{f}</span>
                        </div>
                      ))}
                      {tier.missing.map((f, fi) => (
                        <div key={fi} className="flex items-center gap-3 opacity-30">
                          <div className="h-5 w-5 rounded-md border-2 border-foreground/40 bg-secondary/50 flex items-center justify-center shrink-0">
                            <X className="h-3 w-3 text-muted-foreground stroke-[2px]" />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground line-through">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Block: Call to Action */}
                <div className="pt-8">
                  <Link to="/signin" className="block">
                    <button className={cn(
                      "w-full h-14 rounded-xl border-[3px] border-foreground font-black text-xs uppercase tracking-widest gap-2 flex items-center justify-center transition-all relative overflow-hidden active:translate-x-0.5 active:translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
                      tier.highlight
                        ? "bg-purple-600 text-white hover:bg-purple-700"
                        : tier.ultra
                        ? "bg-amber-500 text-black hover:bg-amber-400"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    )}>
                      {tier.cta} <ArrowRight className="h-4 w-4 stroke-[3.5px]" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Enterprise Bento Box Callout (Semi-Brutalist Layout) */}
      <section className="px-6 md:px-12 pb-24 max-w-5xl mx-auto relative z-10">
        <motion.div
          {...fadeUp}
          className="bg-card border-[3px] border-foreground rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-[8px_8px_0px_0px_#4f46e5]"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 border-2 border-foreground rounded-lg bg-indigo-500/10 flex items-center justify-center shadow-[2px_2px_0px_#000]">
                <Globe className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 dark:text-indigo-400 font-mono">GLOBAL FEDERATED SYSTEMS</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-foreground uppercase">
              Managing a multi-sector network?
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground font-bold leading-relaxed max-w-xl font-mono">
              &gt; Get bespoke governance systems, localized sub-domains, priority ledger access, and white-glove setup. Talk directly to our protocols coordinator.
            </p>
          </div>
          <Link to="/contact" className="w-full md:w-auto shrink-0">
            <button className="w-full md:w-auto h-14 px-8 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 border-[3px] border-foreground shadow-[4px_4px_0px_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#000] transition-all whitespace-nowrap">
              Talk to Sales <ArrowRight className="h-4 w-4 stroke-[3px]" />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* FAQ (Swiss Brutalist Tab Accordions) */}
      <section className="px-6 md:px-12 pb-24 max-w-4xl mx-auto relative z-10">
        <motion.div {...fadeUp} className="space-y-10">
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 font-mono">// DISCLOSURES</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase">Frequently audited queries.</h2>
          </div>

          <FaqAccordion faqs={faqs} />
        </motion.div>
      </section>

      {/* Footer strip */}
      <div className="px-6 md:px-12 py-8 border-t-[3px] border-foreground max-w-5xl mx-auto relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/45 text-center font-mono">
          © 2026 IMPACTQUEST DATA NODE · CYCLES SUBJECT TO PROTOCOL AUDIT WITH ADVANCE NOTICE
        </p>
      </div>

    </div>
  )
}

function FaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  return (
    <div className="space-y-5">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.6 }}
            className={cn(
              "rounded-xl border-[3px] border-foreground overflow-hidden transition-all duration-300 bg-card",
              isOpen
                ? "shadow-[6px_6px_0px_0px_#4f46e5]"
                : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.25)]"
            )}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center gap-5 px-6 py-5 text-left group cursor-pointer"
            >
              {/* Number badge */}
              <div className={cn(
                "h-10 w-10 shrink-0 border-2 border-foreground rounded-lg flex items-center justify-center text-xs font-black transition-all shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]",
                isOpen
                  ? "bg-indigo-600 text-white"
                  : "bg-secondary text-foreground group-hover:bg-indigo-500/10 group-hover:text-indigo-600"
              )}>
                0{i + 1}
              </div>

              <span className={cn(
                "flex-1 text-base font-black tracking-tight transition-colors",
                isOpen ? "text-indigo-600 dark:text-indigo-400" : "text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
              )}>
                {faq.q}
              </span>

              <div className={cn(
                "h-8 w-8 shrink-0 border-2 border-foreground rounded-full flex items-center justify-center transition-all shadow-[1px_1px_0px_#000] dark:shadow-[1px_1px_0px_#fff]",
                isOpen ? "bg-indigo-600 text-white rotate-180" : "bg-secondary text-foreground"
              )}>
                {isOpen
                  ? <Minus className="h-4 w-4" />
                  : <Plus className="h-4 w-4" />
                }
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden border-t-2 border-foreground bg-secondary/20"
                >
                  <div className="px-6 py-6 pl-20">
                    <p className="text-xs md:text-sm text-muted-foreground font-bold leading-relaxed font-mono">
                      &gt; {faq.a}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
