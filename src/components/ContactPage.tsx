import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Mail01Icon as MailIcon,
  ArrowRight01Icon as ArrowRight,
  SparklesIcon as Sparkles,
  CheckmarkCircle01Icon as CheckCircle,
  MessageAdd01Icon as MessageIcon,
  GlobeIcon as Globe,
} from "hugeicons-react"
import { cn } from "@/lib/utils"

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
}

const contactLinks = [
  { label: "Email us", value: "hello@impactquest.org", sub: "Fastest response", href: "mailto:hello@impactquest.org" },
  { label: "Twitter / X", value: "@impactquest", sub: "Updates & announcements", href: "https://twitter.com" },
  { label: "GitHub", value: "github.com/impactquest", sub: "Open source protocols", href: "https://github.com" },
]

export default function ContactPage() {
  const [form, setForm] = React.useState({ name: '', email: '', role: 'Volunteer', message: '' })
  const [submitting, setSubmitting] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const FORMCARRY_ID = import.meta.env.VITE_FORMCARRY_ID;
      const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      console.log("Submitting to Formcarry with ID:", FORMCARRY_ID ? "Found" : "MISSING");

      // 1. Send to Formcarry
      if (FORMCARRY_ID) {
        const fcResponse = await fetch(`https://formcarry.com/s/${FORMCARRY_ID}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(form)
        });
        
        if (!fcResponse.ok) {
          const errData = await fcResponse.json();
          throw new Error(`Formcarry Error: ${errData.message || fcResponse.statusText}`);
        }
        console.log("Formcarry submission successful!");
      }

      // 2. Send via EmailJS
      if (SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY) {
        const emailjs = await import('@emailjs/browser');
        
        await emailjs.default.send(
          SERVICE_ID, 
          TEMPLATE_ID, 
          {
            from_name: form.name,
            from_email: form.email,
            role: form.role,
            message: form.message,
            to_name: 'ImpactQuest Team',
            to_email: 'abhijeetpanda21@gmail.com',
            reply_to: form.email,
          },
          PUBLIC_KEY
        );
        console.log("Notification sent successfully!");
      }

      setSuccess(true)
      setForm({ name: '', email: '', role: 'Volunteer', message: '' })
    } catch (error: any) {
      console.error("Submission failed:", error)
      alert(`Submission Error: ${error.message || "Please try again later."}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">

      {/* Hero */}
      <section className="px-6 md:px-12 pt-36 pb-16 max-w-4xl mx-auto">
        <motion.div {...fadeUp} className="space-y-6">
          <span className="inline-flex items-center gap-2 text-indigo-600 text-[10px] font-bold uppercase tracking-widest">
            <MessageIcon className="h-3.5 w-3.5" /> Get in Touch
          </span>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-foreground leading-tight">
            We'd love to<br />
            <span className="text-indigo-600">hear from you.</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-medium leading-relaxed max-w-xl">
            Whether you're an NGO looking to partner, a volunteer ready to join, or just curious — drop us a line.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">We typically reply within 24 hours</span>
          </div>
        </motion.div>
      </section>

      {/* Two-column layout: form + contact links */}
      <section className="px-6 md:px-12 pb-24 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

          {/* Contact Form */}
          <motion.div {...fadeUp} className="order-1">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center py-16 space-y-6 border border-emerald-500/20 rounded-3xl bg-emerald-500/5"
                >
                  <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Message sent!</h2>
                    <p className="text-base text-muted-foreground font-medium">We'll get back to you within 24 hours.</p>
                  </div>
                  <button
                    onClick={() => { setSuccess(false); setForm({ name: '', email: '', role: 'Volunteer', message: '' }) }}
                    className="text-indigo-600 text-sm font-bold hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Your Name</label>
                    <input
                      required
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Jane Doe"
                      className="w-full h-13 px-4 py-3.5 rounded-2xl bg-secondary/40 border border-border/50 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/30 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Email Address</label>
                    <input
                      required
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      className="w-full h-13 px-4 py-3.5 rounded-2xl bg-secondary/40 border border-border/50 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/30 transition-all"
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">I am a...</label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full h-13 px-4 py-3.5 rounded-2xl bg-secondary/40 border border-border/50 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 outline-none text-sm font-medium text-foreground transition-all cursor-pointer appearance-none"
                    >
                      <option value="Volunteer">Volunteer</option>
                      <option value="NGO">NGO / Non-profit</option>
                      <option value="Partner">Strategic Partner</option>
                      <option value="Developer">Developer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Message</label>
                    <textarea
                      required
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us what's on your mind..."
                      rows={5}
                      className="w-full px-4 py-3.5 rounded-2xl bg-secondary/40 border border-border/50 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground/30 transition-all resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-14 rounded-2xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <>Send Message <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>

                  <p className="text-[10px] font-medium text-muted-foreground/40 text-center pt-1">
                    By submitting, you agree to our Privacy Policy and Terms of Service.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Contact Links + Info */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="order-2 space-y-8"
          >
            {/* Quick links */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Other ways to reach us</span>
              <div className="space-y-3">
                {contactLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between p-5 rounded-2xl border border-border/50 bg-card hover:border-indigo-500/30 hover:bg-indigo-600/5 transition-all duration-300"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{link.label}</span>
                      <p className="text-sm font-bold text-foreground group-hover:text-indigo-600 transition-colors">{link.value}</p>
                      <p className="text-[11px] text-muted-foreground/50 font-medium">{link.sub}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/30" />

            {/* FAQ teaser */}
            <div className="p-6 rounded-2xl bg-indigo-600/5 border border-indigo-600/10 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Before you reach out</span>
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                Check out our <a href="/pricing" className="text-indigo-600 font-bold hover:underline">FAQ on the Pricing page</a> — we've answered the most common questions about plans, NGO discounts, and data security there.
              </p>
            </div>

            {/* Response time */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-secondary/30 border border-border/30">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">We're a small, focused team</p>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Every message gets a real reply. We don't use bots for initial contact.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <div className="px-6 md:px-12 py-8 border-t border-border/30 max-w-4xl mx-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 text-center">
          © 2026 ImpactQuest · Making impact accessible
        </p>
      </div>

    </div>
  )
}
