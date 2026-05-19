import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CheckmarkCircle01Icon as CheckCircle,
  Loading02Icon as LoadingSpinner,
  Shield01Icon as Shield,
  Briefcase01Icon as Building,
  Mail01Icon as Mail,
  CallIcon as Phone,
  GlobeIcon as Globe,
  UserGroupIcon as Users,
  Calendar01Icon as Calendar,
  DocumentCodeIcon as FileText,
  ArrowRight01Icon as ArrowRight,
  ArrowLeft01Icon as ArrowLeft,
  SparklesIcon as Sparkles,
  InformationCircleIcon as Info,
  Shield01Icon as ShieldCheck,
} from "hugeicons-react"
import { cn } from "@/lib/utils"
import { apiRequest } from "../lib/api"
import { useNavigate } from "react-router-dom"

const VERIFICATION_QUESTIONS = [
  {
    key: 'missionStatement',
    label: 'Mission Statement',
    placeholder: 'Describe your NGO\'s mission and core purpose in 2-3 sentences...',
    icon: Sparkles,
    required: true,
    type: 'textarea' as const,
  },
  {
    key: 'registrationNumber',
    label: 'Registration / License Number',
    placeholder: 'e.g. NGO/2024/12345 or your government registration ID',
    icon: FileText,
    required: false,
    type: 'text' as const,
  },
  {
    key: 'yearsActive',
    label: 'Years Active',
    placeholder: 'How many years has your organization been operating?',
    icon: Calendar,
    required: false,
    type: 'text' as const,
  },
  {
    key: 'teamSize',
    label: 'Team Size',
    placeholder: 'Approximate number of team members / volunteers',
    icon: Users,
    required: false,
    type: 'text' as const,
  },
  {
    key: 'website',
    label: 'Website / Social Media',
    placeholder: 'https://yourorganization.org or social media links',
    icon: Globe,
    required: false,
    type: 'text' as const,
  },
  {
    key: 'areasOfOperation',
    label: 'Areas of Operation',
    placeholder: 'List the geographic areas or sectors your NGO operates in...',
    icon: Building,
    required: false,
    type: 'textarea' as const,
  },
  {
    key: 'proofDescription',
    label: 'Additional Proof / Description',
    placeholder: 'Any other details that can help verify your legitimacy (previous work, partnerships, references, etc.)',
    icon: Info,
    required: false,
    type: 'textarea' as const,
  },
]

export default function NgoVerificationPage() {
  const navigate = useNavigate()
  const [step, setStep] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, string>>({})
  const [contactPhone, setContactPhone] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [existingStatus, setExistingStatus] = React.useState<string | null>(null)

  // Check existing verification status
  React.useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await apiRequest('/admin/ngo-verify/my-status')
        if (res.data?.status && res.data.status !== 'none') {
          setExistingStatus(res.data.status)
        }
      } catch { /* ignore */ }
    }
    checkStatus()
  }, [])

  const currentQuestion = VERIFICATION_QUESTIONS[step]
  const totalSteps = VERIFICATION_QUESTIONS.length

  const handleNext = () => {
    if (currentQuestion.required && !answers[currentQuestion.key]?.trim()) {
      setError(`${currentQuestion.label} is required`)
      return
    }
    setError(null)
    if (step < totalSteps - 1) {
      setStep(step + 1)
    }
  }

  const handlePrev = () => {
    setError(null)
    if (step > 0) setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (VERIFICATION_QUESTIONS[0].required && !answers.missionStatement?.trim()) {
      setError('Mission Statement is required')
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await apiRequest('/admin/ngo-verify/submit', {
        method: 'POST',
        body: JSON.stringify({ answers, contactPhone }),
      })
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Failed to submit verification')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Already has verification
  if (existingStatus && existingStatus !== 'rejected') {
    const statusConfig: Record<string, { color: string, label: string, desc: string }> = {
      pending: { color: 'text-amber-500', label: 'Pending Review', desc: 'Your verification request is awaiting admin review. You\'ll be notified once reviewed.' },
      under_review: { color: 'text-blue-500', label: 'Under Review', desc: 'An admin is currently reviewing your application. Hang tight!' },
      approved: { color: 'text-emerald-500', label: 'Verified ✓', desc: 'Congratulations! Your NGO is verified. You now have the green badge and all pro features.' },
    }
    const cfg = statusConfig[existingStatus] || statusConfig.pending

    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-background min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg p-10 rounded-[3rem] bg-card border border-border shadow-2xl text-center space-y-6"
        >
          <div className="h-20 w-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center">
            <Shield className="h-10 w-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Verification Status</h1>
          <p className={cn("text-xl font-black uppercase tracking-widest", cfg.color)}>{cfg.label}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{cfg.desc}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full h-14 rounded-2xl bg-foreground text-background text-sm font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  // Success state
  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-background min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg p-10 rounded-[3rem] bg-card border border-border shadow-2xl text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            className="h-24 w-24 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center"
          >
            <CheckCircle className="h-12 w-12 text-emerald-500" />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight">Submitted!</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your verification request has been submitted successfully. Our admin team will review it and contact you if needed. This usually takes 1-3 business days.
          </p>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs font-bold text-amber-600">What happens next?</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              An admin will review your answers, may call or email for further verification, then approve your NGO. You'll receive a green verified badge and all pro features for free.
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full h-14 rounded-2xl bg-foreground text-background text-sm font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  const progress = ((step + 1) / totalSteps) * 100

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-emerald-500" />
          <span className="text-lg font-black tracking-tight text-foreground">NGO Verification</span>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-6 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
            Step {step + 1} of {totalSteps}
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden border border-border/30">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="h-full bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"
          />
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex items-start md:items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Question header */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <currentQuestion.icon className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-foreground">
                    {currentQuestion.label}
                    {currentQuestion.required && <span className="text-rose-500 ml-1">*</span>}
                  </h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-0.5">
                    {currentQuestion.required ? 'Required' : 'Optional'}
                  </p>
                </div>
              </div>

              {/* Input */}
              {currentQuestion.type === 'textarea' ? (
                <textarea
                  value={answers[currentQuestion.key] || ''}
                  onChange={e => setAnswers({ ...answers, [currentQuestion.key]: e.target.value })}
                  placeholder={currentQuestion.placeholder}
                  rows={5}
                  className="w-full bg-card text-foreground border border-border rounded-2xl p-5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-muted-foreground/30 resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={answers[currentQuestion.key] || ''}
                  onChange={e => setAnswers({ ...answers, [currentQuestion.key]: e.target.value })}
                  placeholder={currentQuestion.placeholder}
                  className="w-full h-16 bg-card text-foreground border border-border rounded-2xl px-5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-muted-foreground/30"
                />
              )}

              {/* Phone number on last step */}
              {step === totalSteps - 1 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                      Contact Phone (Optional)
                    </label>
                  </div>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full h-14 bg-card text-foreground border border-border rounded-2xl px-5 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-muted-foreground/30"
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-sm font-medium text-red-500">
                  {error}
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                {step > 0 && (
                  <button
                    onClick={handlePrev}
                    className="h-14 px-6 rounded-2xl border border-border bg-card text-foreground text-sm font-bold flex items-center gap-2 hover:bg-secondary/50 active:scale-95 transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                )}
                {step < totalSteps - 1 ? (
                  <button
                    onClick={handleNext}
                    className="flex-1 h-14 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 h-14 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <LoadingSpinner className="h-5 w-5 animate-spin" />
                    ) : (
                      <>Submit Verification <CheckCircle className="h-4 w-4" /></>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
