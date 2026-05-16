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
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
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
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">

      {/* Hero */}
      <section className="px-6 md:px-12 pt-36 pb-16 max-w-4xl mx-auto text-center">
        <motion.div {...fadeUp} className="space-y-6">
          <span className="inline-flex items-center gap-2 text-indigo-600 text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" /> Simple Pricing
          </span>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
            Plans for every<br />
            <span className="text-indigo-600">scale of impact.</span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground font-medium leading-relaxed max-w-xl mx-auto">
            Start free, grow with us. No hidden fees. Cancel any time.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex justify-center mt-10"
        >
          <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-2xl border border-border/40">
            {(['monthly', 'yearly'] as const).map(cycle => (
              <button
                key={cycle}
                onClick={() => setBilling(cycle)}
                className={cn(
                  "px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 relative",
                  billing === cycle
                    ? "bg-foreground text-background shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {cycle}
                {cycle === 'yearly' && (
                  <span className="absolute -top-2.5 -right-1 px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-bold rounded-full">
                    -25%
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 md:px-12 pb-24 max-w-5xl mx-auto">
        <div className="flex flex-col gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              className={cn(
                "rounded-3xl border bg-card p-8 md:p-10 relative overflow-hidden",
                tier.highlight
                  ? "border-purple-500/40 ring-2 ring-purple-500/10 shadow-xl shadow-purple-500/5"
                  : tier.ultra
                  ? "border-amber-500/30"
                  : "border-border/50"
              )}
            >
              {tier.highlight && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-purple-600 text-white text-[9px] font-bold uppercase tracking-widest rounded-full">
                  {tier.tag}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left: Price & Info */}
                <div className="space-y-5">
                  <div className="space-y-1">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      tier.ultra ? "text-amber-500" : tier.highlight ? "text-purple-600" : "text-indigo-600"
                    )}>
                      {tier.name}
                    </span>
                    <div className="flex items-end gap-1.5">
                      <span className="text-muted-foreground/40 text-lg font-bold">$</span>
                      <span className={cn(
                        "text-5xl md:text-6xl font-bold tracking-tight leading-none",
                        tier.ultra ? "text-amber-500" : "text-foreground"
                      )}>
                        {tier.price[billing]}
                      </span>
                      <span className="text-muted-foreground/40 text-sm font-medium mb-1">/mo</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed pt-1">
                      {tier.desc}
                    </p>
                  </div>

                  <Link to="/signin" className="block">
                    <Button className={cn(
                      "w-full h-14 rounded-2xl font-bold text-sm gap-2 transition-all active:scale-95",
                      tier.highlight
                        ? "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/20"
                        : tier.ultra
                        ? "bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                        : "bg-foreground text-background hover:opacity-90"
                    )}>
                      {tier.cta} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                {/* Right: Features */}
                <div className="space-y-3">
                  {tier.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-3">
                      <div className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                        tier.ultra ? "bg-amber-500/10 text-amber-500" : tier.highlight ? "bg-purple-600/10 text-purple-600" : "bg-indigo-600/10 text-indigo-600"
                      )}>
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{f}</span>
                    </div>
                  ))}
                  {tier.missing.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-3 opacity-30">
                      <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <X className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground line-through">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="px-6 md:px-12 pb-24 max-w-5xl mx-auto">
        <motion.div
          {...fadeUp}
          className="bg-secondary/30 border border-border/50 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-indigo-600/10 flex items-center justify-center">
                <Globe className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Global Operations</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Managing a large network?
            </h2>
            <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-lg">
              We offer custom enterprise packages with dedicated onboarding, multisite governance, and white-glove support for organizations operating at scale.
            </p>
          </div>
          <Link to="/contact" className="w-full md:w-auto shrink-0">
            <button className="w-full md:w-auto h-14 px-8 rounded-2xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap">
              Talk to Sales <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </motion.div>
      </section>

      {/* FAQ - Interactive Accordion */}
      <section className="px-6 md:px-12 pb-24 max-w-4xl mx-auto">
        <motion.div {...fadeUp} className="space-y-10">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Common questions.</h2>
          </div>

          <FaqAccordion faqs={faqs} />
        </motion.div>
      </section>

      {/* Footer strip */}
      <div className="px-6 md:px-12 py-8 border-t border-border/30 max-w-4xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 text-center">
          © 2026 ImpactQuest · Pricing subject to change with notice
        </p>
      </div>

    </div>
  )
}

function FaqAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  return (
    <div className="space-y-4">
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
              "rounded-2xl border overflow-hidden transition-all duration-300",
              isOpen
                ? "border-indigo-500/30 bg-indigo-600/5 shadow-lg shadow-indigo-600/5"
                : "border-border/50 bg-card hover:border-indigo-500/20"
            )}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center gap-5 px-6 py-5 text-left group"
            >
              {/* Number badge */}
              <div className={cn(
                "h-9 w-9 shrink-0 rounded-xl flex items-center justify-center text-[11px] font-bold transition-all",
                isOpen
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-secondary text-muted-foreground group-hover:bg-indigo-600/10 group-hover:text-indigo-600"
              )}>
                0{i + 1}
              </div>

              <span className={cn(
                "flex-1 text-base font-bold tracking-tight transition-colors",
                isOpen ? "text-indigo-600" : "text-foreground group-hover:text-indigo-600"
              )}>
                {faq.q}
              </span>

              <div className={cn(
                "h-7 w-7 shrink-0 rounded-full flex items-center justify-center transition-all",
                isOpen ? "bg-indigo-600 text-white rotate-0" : "bg-secondary text-muted-foreground"
              )}>
                {isOpen
                  ? <Minus className="h-3.5 w-3.5" />
                  : <Plus className="h-3.5 w-3.5" />
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
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pl-20">
                    <p className="text-base text-muted-foreground font-medium leading-relaxed">
                      {faq.a}
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
