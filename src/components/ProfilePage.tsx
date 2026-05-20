import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Award01Icon as Trophy,
  Target01Icon as Target,
  Location01Icon as MapPin,
  Settings01Icon as Settings,
  Shield01Icon as ShieldCheck,
  FlashIcon as Zap,
  ArrowRight01Icon as ArrowRight,
  ArrowRight01Icon as ChevronRight,
  Briefcase01Icon as Briefcase,
  StarIcon as Star,
  Share01Icon as ExternalLink,
  Comment01Icon as MessageSquare,
  Share02Icon as Share2,
  Notification01Icon as Bell,
  CpuIcon as Cpu,
  GlobeIcon as Globe,
  Add01Icon as Plus,
  Cancel01Icon as X,
  Time01Icon as Clock,
  CheckmarkCircle01Icon as CheckCircle2,
  UserGroupIcon as Users,
  Calendar01Icon as Calendar,
  SparklesIcon as Sparkles,
  AnalyticsUpIcon as TrendingUp,
  DashboardCircleIcon as Layout,
  Award01Icon as Award,
  CircleIcon as Circle,
  Logout01Icon as LogOut
} from "hugeicons-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { apiRequest } from "../lib/api"
import { PREDEFINED_SKILLS } from "../data/skills"
import { useNavigate } from "react-router-dom"

// Dynamic data will be drawn from the user object

// --- COMPONENTS ---

const StatCard = ({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="relative p-6 rounded-3xl bg-card border border-border shadow-xl shadow-black/5 group overflow-hidden"
  >
     <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 transition-transform">
        <Icon className="h-16 w-16" />
     </div>
     <div className="flex flex-col gap-1 relative z-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{label}</span>
        <span className="text-3xl font-black tracking-tighter text-foreground">{value}</span>
     </div>
  </motion.div>
)

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [bannerImage, setBannerImage] = React.useState<string | null>(null);
  const [pfpImage, setPfpImage] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<any>({
    name: '',
    organizationName: '',
    skills: [],
    bio: '',
    pfp: '',
    banner: ''
  });
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || '',
        organizationName: parsedUser.organizationName || '',
        skills: parsedUser.skills || [],
        bio: parsedUser.bio || '',
        pfp: parsedUser.pfp || '',
        banner: parsedUser.banner || ''
      });
      setPfpImage(parsedUser.pfp || null);
      setBannerImage(parsedUser.banner || null);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'pfp') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert("File exceeds 5MB optimal payload limit.");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      if (type === 'banner') {
        setBannerImage(base64Str);
        setFormData((prev: any) => ({ ...prev, banner: base64Str }));
      } else {
        setPfpImage(base64Str);
        setFormData((prev: any) => ({ ...prev, pfp: base64Str }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const endpoint = user.role === 'ngo' ? '/auth/update-ngo' : '/volunteers/update';
      const response = await apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      if (response.success) {
        const freshUser = response.data.user || response.data.volunteer;
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
        setIsEditing(false);
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/signin');
    window.location.reload();
  };

  if (!user) return null;

  const xpProgress = ((user.points || 0) % 1000) / 10;
  const currentLevel = Math.floor((user.points || 0) / 1000) + 1;

  // ── shared spring config ──────────────────────────────────────────────────
  const spring = { type: "spring" as const, stiffness: 340, damping: 28 };

  return (
    <>
    {/* ════════════════════════════════════════════════════════════════════════
        MOBILE PROFILE  (md:hidden)
    ════════════════════════════════════════════════════════════════════════ */}
    <div className="md:hidden flex flex-col overflow-y-auto scrollbar-hide pb-40 bg-zinc-950 text-white relative">
      {/* Blueprint Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '2.5rem 2.5rem',
        }}
      />

      {/* ── Hero banner ── */}
      <div className="relative h-44 w-full overflow-hidden border-b border-zinc-900 z-10">
        {bannerImage
          ? <img src={bannerImage} alt="banner" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          : <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 opacity-60" />}
        
        {/* Subtle decorative grid/crosshair or dots for Swiss design */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(39,39,42,0.5),transparent)] pointer-events-none" />
        <div className="absolute top-4 left-4 font-mono text-[9px] uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 bg-zinc-950/80 backdrop-blur px-2 py-0.5 border border-zinc-900 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-slow-pulse" />
          SYSTEM_TERM_ACTIVE
        </div>

        {/* banner upload */}
        <label className="absolute top-4 right-4 h-7 px-3 rounded bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 flex items-center gap-2 cursor-pointer active:scale-95 transition-all text-zinc-400 select-none">
          <Settings className="h-3 w-3" />
          <span className="text-[9px] font-mono uppercase tracking-widest">Cover</span>
          <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'banner')} />
        </label>
      </div>

      {/* ── Identity ── */}
      <div className={cn("px-5 relative z-10 mb-8", bannerImage ? "-mt-10" : "mt-6")}>
        {/* avatar */}
        <div className="relative w-fit mb-5">
          <div className="h-24 w-24 rounded-xl bg-zinc-950 border border-zinc-800 p-1 shadow-2xl overflow-hidden">
            <div className="w-full h-full rounded-lg overflow-hidden bg-zinc-900">
              {pfpImage
                ? <img src={pfpImage} alt="av" className="w-full h-full object-cover" />
                : <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}&backgroundColor=f8faff`} alt="av" className="w-full h-full object-cover" />}
            </div>
          </div>
          <label className="absolute -bottom-1 -right-1 h-7 w-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-lg hover:bg-zinc-800 text-zinc-400">
            <Plus className="h-3.5 w-3.5" />
            <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'pfp')} />
          </label>
          <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-lg text-emerald-500">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
        </div>

        <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500 mb-1 flex items-center gap-1.5">
          <span>[ OPERATIVE TYPE ]</span>
          <span className="text-zinc-600">·</span>
          <span className="text-indigo-400 font-bold">Strategic Volunteer</span>
        </p>

        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <h1 className="text-3xl font-black tracking-tighter text-white">{user.name}</h1>
          {user.isNgoVerified && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[8px] font-mono uppercase tracking-widest shrink-0">
              <ShieldCheck className="h-2.5 w-2.5" /> NGO_VERIFIED
            </span>
          )}
        </div>
        {user.role === 'ngo' && user.organizationName && (
          <p className="text-xs font-mono text-zinc-400 mb-2">{user.organizationName}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900/50 border border-zinc-800/80 text-[9px] font-mono uppercase tracking-wider text-zinc-300">
            <Award className="h-3 w-3 text-indigo-400" /> LVL {currentLevel}
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 text-[9px] font-mono uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-slow-pulse" /> AVAILABLE
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900/50 border border-zinc-800/80 text-[9px] font-mono uppercase tracking-wider text-zinc-400">
            <Calendar className="h-3.5 w-3.5" /> {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
          </span>
        </div>

        {/* XP bar */}
        <div className="space-y-1.5 mb-6 bg-zinc-900/30 p-3 rounded-lg border border-zinc-900">
          <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider text-zinc-500">
            <span>EXPERIENCE POINT PROGRESS</span>
            <span className="text-zinc-400">{user.points || 0} / {currentLevel * 1000} XP</span>
          </div>
          <div className="h-2 w-full bg-zinc-950 rounded overflow-hidden border border-zinc-900">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded"
            />
          </div>
        </div>

        {/* Edit and Actions list */}
        <div className="flex flex-col gap-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditing(true)}
            className="w-full h-11 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-[10px] font-mono uppercase tracking-widest font-black active:scale-98 transition-all flex items-center justify-center gap-1.5"
          >
            EDIT CONFIGURATION
          </motion.button>

          {/* NGO Verified Badge + Verify CTA */}
          {user.role === 'ngo' && user.isNgoVerified && (
            <div className="flex items-center justify-center gap-2 h-11 rounded bg-emerald-950/20 border border-emerald-900/30">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">VERIFIED ORGANIZATION</span>
            </div>
          )}
          {user.role === 'ngo' && !user.isNgoVerified && user.ngoVerificationStatus !== 'pending' && user.ngoVerificationStatus !== 'under_review' && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/ngo-verify')}
              className="w-full h-11 rounded border border-emerald-900 bg-emerald-950/10 text-emerald-400 text-[10px] font-mono uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-950/20 transition-all"
            >
              <ShieldCheck className="h-4 w-4" /> SUBMIT NGO VERIFICATION
            </motion.button>
          )}
          {user.role === 'ngo' && (user.ngoVerificationStatus === 'pending' || user.ngoVerificationStatus === 'under_review') && (
            <div className="flex items-center justify-center gap-2 h-11 rounded bg-amber-950/20 border border-amber-900/30">
              <ShieldCheck className="h-4 w-4 text-amber-400 animate-slow-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">VERIFICATION IN REVIEW</span>
            </div>
          )}

          {/* Admin Panel Button */}
          {(user.isAdmin || user.email === 'abhijeetpanda21@gmail.com') && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/admin')}
              className="w-full h-11 rounded border border-violet-900 bg-violet-950/20 hover:bg-violet-950/40 text-violet-400 text-[10px] font-mono uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all"
            >
              🛡️ SYSTEM CONTROL PANEL
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Stats Bento Grid ── */}
      <div className="px-5 mb-8">
        <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500 mb-3 flex items-center gap-2">
          <span>[ METRICS OVERVIEW ]</span>
          <span className="h-[1px] flex-1 bg-zinc-900" />
        </p>
        <div className="grid grid-cols-2 gap-3">
          
          {/* Stat 1: Tasks Done (standard bento) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.05 }}
            className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 flex flex-col justify-between h-28 relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2.5 opacity-5 group-hover:opacity-10 transition-opacity">
              <CheckCircle2 className="h-10 w-10 text-zinc-400" />
            </div>
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-mono text-zinc-600">[ 01 ]</span>
              <span className="text-[8px] font-mono uppercase text-zinc-500 tracking-wider">COMPLETED</span>
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight text-white">{user.tasksCompleted || 24}</p>
              <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mt-0.5">Directives</p>
            </div>
          </motion.div>

          {/* Stat 2: Active Tasks (standard bento) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 flex flex-col justify-between h-28 relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2.5 opacity-5 group-hover:opacity-10 transition-opacity">
              <Target className="h-10 w-10 text-zinc-400" />
            </div>
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-mono text-zinc-600">[ 02 ]</span>
              <span className="text-[8px] font-mono uppercase text-zinc-500 tracking-wider">ONGOING</span>
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight text-white">2</p>
              <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mt-0.5">Active Directives</p>
            </div>
          </motion.div>

          {/* Stat 3: Impact Score (PREMIUM GEMINI SHIMMERING CARD) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 }}
            className="col-span-2 p-5 rounded-xl gemini-gradient-bg gemini-gradient-border border-transparent bg-zinc-950/20 flex flex-col justify-between h-36 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-25">
              <Sparkles className="h-14 w-14 text-indigo-400/30 animate-slow-pulse" />
            </div>
            <div className="flex justify-between items-start relative z-10">
              <span className="text-[9px] font-mono text-indigo-400">[ IMPACT QUOTIENT ]</span>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8px] font-mono uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> COGNITION_SYNCED
              </span>
            </div>
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <p className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">{user.points || 1250}</p>
                <p className="text-[9px] font-mono uppercase tracking-widest text-indigo-300/80 mt-1">Global Impact Score</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-mono text-zinc-500 block">TIER RATING</span>
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">Elite Operator</span>
              </div>
            </div>
          </motion.div>

          {/* Stat 4: Hours Served (standard bento) */}
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.2 }}
            className="col-span-2 p-5 rounded-xl bg-zinc-900/20 border border-zinc-900/80 flex flex-col justify-between h-28 relative group overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Clock className="h-12 w-12 text-zinc-400" />
            </div>
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-mono text-zinc-600">[ 03 ]</span>
              <span className="text-[8px] font-mono uppercase text-zinc-500 tracking-wider">OPERATION DURATION</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-black tracking-tight text-white">142h</p>
                <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mt-0.5">Cumulative Service Hours</p>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-mono text-zinc-600 block">RELIABILITY RATING</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">98.4% NOMINAL</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── Skills ── */}
      <div className="px-5 mb-8">
        <div className="flex items-center justify-between mb-3.5">
          <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-2">
            <span>[ SKILLS & EXPERTISE ]</span>
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[9px] font-mono uppercase tracking-widest hover:bg-zinc-800 active:scale-95 transition-all select-none"
          >
            <Plus className="h-3 w-3" /> ADD_CAPABILITY
          </motion.button>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {(user.skills?.length ? user.skills : ['Communication', 'Logistics', 'Digital Strategy']).map((skill: string, i: number) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: i * 0.05 }}
                className="flex items-center gap-3 p-3.5 rounded-lg bg-zinc-950 border border-zinc-900 group cursor-default hover:border-zinc-800 transition-colors"
              >
                <div className="h-8 w-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:border-zinc-700 group-hover:text-indigo-400 transition-all duration-300 shrink-0">
                  <Zap className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono tracking-tight font-bold text-zinc-200">{skill.toUpperCase()}</p>
                  <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-500 mt-0.5">Competency Level · Verified Operator</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-700 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── AI Insights ── */}
      <div className="px-5 mb-8">
        <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500 mb-3 flex items-center gap-2">
          <span>[ COGNITIVE ANALYSIS ]</span>
        </p>
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="rounded-xl bg-indigo-950/10 border border-indigo-900/30 p-4 space-y-3 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Sparkles className="h-12 w-12 text-indigo-400" />
          </div>

          <div className="flex items-center gap-2 pb-1.5 border-b border-indigo-900/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-slow-pulse" />
            <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-400 font-bold">COGNITION ENGINE LOGS</span>
          </div>

          {[
            { title: 'RECOMMENDED OPERATIONAL DIRECTIVE', body: 'Based on your logistics skill profile — Supply Chain Refresh aligns with critical mission demand.', color: 'text-indigo-400', bg: 'bg-zinc-950/60 border-indigo-900/20' },
            { title: 'COMPETENCY EXPANSION OPPORTUNITY',        body: 'Acquiring "Digital Forensics" unlocks high-priority Tier 4 Specialist operations.', color: 'text-emerald-400', bg: 'bg-zinc-950/60 border-emerald-900/20' },
          ].map((ins, i) => (
            <motion.div
              key={ins.title}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.08 + i * 0.05 }}
              className={`p-3 rounded border ${ins.bg} space-y-1`}
            >
              <p className={`text-[8px] font-mono uppercase tracking-wider ${ins.color} font-bold`}>{ins.title}</p>
              <p className="text-[10px] font-mono text-zinc-400 leading-relaxed">{ins.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Achievements ── */}
      <div className="px-5 mb-8">
        <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500 mb-3 flex items-center gap-2">
          <span>[ DECORATIVE PROTOCOL ]</span>
        </p>
        {(!user.badges || user.badges.length === 0) ? (
          <div className="p-6 rounded-xl bg-zinc-900/10 border border-zinc-900 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-zinc-600" />
            <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">NO DECORATIVE SEALS RECORDED</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {user.badges.map((badge: any, i: number) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...spring, delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-900 flex flex-col items-center gap-3 text-center group cursor-default"
                >
                  <div className={cn("h-12 w-12 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg relative", badge.color || 'from-indigo-400 to-indigo-600')}>
                    <Award className="h-6 w-6 text-white" />
                    <div className="absolute inset-1 border border-white/20 rounded-full border-dashed animate-[spin_10s_linear_infinite]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-tight text-zinc-200 font-bold leading-tight">{badge.name.toUpperCase()}</p>
                    <p className="text-[8px] font-mono text-zinc-500 leading-tight mt-1 truncate max-w-full italic">{badge.flavor}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Activity ── */}
      <div className="px-5 mb-8">
        <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500 mb-3 flex items-center gap-2">
          <span>[ RECENT OPERATIONAL LOGS ]</span>
        </p>
        {(!user.activities || user.activities.length === 0) ? (
          <div className="p-6 rounded-xl bg-zinc-900/10 border border-zinc-900 text-center">
            <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">NO OPERATIONAL ENTRIES FOUND</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {user.activities.slice(0, 5).map((act: any, i: number) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: i * 0.05 }}
                  className="flex items-center gap-3.5 p-3 rounded-lg bg-zinc-900/10 border border-zinc-900/80 group"
                >
                  <div className={cn(
                    "h-8 w-8 rounded flex items-center justify-center shrink-0 border",
                    act.status === 'Success'     ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' :
                    act.status === 'Achievement' ? 'bg-amber-950/20  border-amber-900/30  text-amber-400'  :
                                                   'bg-indigo-950/20 border-indigo-900/30 text-indigo-400'
                  )}>
                    {act.status === 'Success' ? <CheckCircle2 className="h-3.5 w-3.5" /> :
                     act.status === 'Achievement' ? <Trophy className="h-3.5 w-3.5" /> :
                     <ActivityIcon className="h-3.5 w-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-zinc-300 truncate group-hover:text-indigo-400 transition-colors font-bold uppercase">{act.action}</p>
                    <p className="text-[8px] font-mono uppercase tracking-widest text-zinc-500 mt-0.5">{act.time}</p>
                  </div>
                  {act.xp && act.xp !== '0' && (
                    <span className="text-[9px] font-mono text-emerald-400 uppercase shrink-0">+{act.xp} XP</span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Logout ── */}
      <div className="px-5 mb-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full h-11 rounded border border-rose-950 bg-rose-950/10 text-rose-400 text-[10px] font-mono uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 active:scale-98 transition-all hover:bg-rose-950/20 duration-200"
        >
          <LogOut className="h-3.5 w-3.5" /> DEAUTHORIZE_SESSION
        </motion.button>
      </div>

    </div>

    {/* ════════════════════════════════════════════════════════════════════════
        DESKTOP PROFILE  (hidden md:block) — completely unchanged
    ════════════════════════════════════════════════════════════════════════ */}
    <div className="hidden md:block flex-1 overflow-y-auto bg-background selection:bg-indigo-600/10 font-sans transition-colors duration-500 pb-40">
      
      {/* 1. PROFILE OVERVIEW HEADER */}
      <div className="h-96 w-full relative overflow-hidden group/banner">
         {bannerImage ? (
            <img src={bannerImage} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
         ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900" />
         )}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.1),transparent)]" />
         <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent to-background" />
         
         <label className="absolute top-8 right-8 px-6 py-3 rounded-full bg-black/50 hover:bg-black/80 text-white text-[10px] font-black uppercase tracking-widest cursor-pointer backdrop-blur-md border border-white/10 opacity-0 group-hover/banner:opacity-100 transition-all flex items-center gap-2 shadow-2xl">
            <Settings className="h-4 w-4" /> Update Cover (Max 5MB)
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'banner')} />
         </label>
      </div>

      <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-20 -mt-48 relative z-10 space-y-16">
         
         {/* Identity Hub */}
         <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-end justify-between">
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-end">
               <div className="relative group">
                  <div className="h-44 w-44 md:h-56 md:w-56 rounded-[3.5rem] bg-card border-8 border-background shadow-2xl overflow-hidden relative rotate-3 group-hover:rotate-0 transition-transform duration-700 cursor-pointer group/pfp">
                     {pfpImage ? (
                        <img src={pfpImage} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}&backgroundColor=f8faff`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                     )}
                     <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/pfp:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer z-20">
                        <Plus className="h-8 w-8 mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Update Photo</span>
                        <span className="text-[8px] opacity-70 mt-1">Max 5MB</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'pfp')} />
                     </label>
                     <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 h-12 w-12 rounded-2xl bg-emerald-500 border-4 border-background flex items-center justify-center shadow-xl shadow-emerald-500/20 text-white">
                     <ShieldCheck className="h-6 w-6" />
                  </div>
               </div>

               <div className="space-y-6 text-center md:text-left">
                  <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Strategic Operator</span>
                      <div className="flex items-center gap-4 flex-wrap">
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground">{user.name}</h1>
                        {user.isNgoVerified && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shrink-0 shadow-lg shadow-emerald-500/30">
                            <ShieldCheck className="h-3 w-3" /> Verified NGO
                          </span>
                        )}
                      </div>
                      {user.role === 'ngo' && user.organizationName && (
                        <p className="text-base font-medium text-muted-foreground/60">{user.organizationName}</p>
                      )}
                   </div>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                     <div className="flex items-center gap-3 bg-secondary/50 px-4 py-2 rounded-2xl border border-border/60">
                        <Award className="h-4 w-4 text-indigo-500" />
                        <span className="text-xs font-bold">Level {currentLevel} Volunteer</span>
                     </div>
                     <div className="flex items-center gap-2 text-muted-foreground/60 text-xs font-black uppercase tracking-widest pl-1">
                        <Calendar className="h-3.5 w-3.5" /> Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">
                        <Circle className="h-2 w-2 fill-current" /> Available
                     </div>
                  </div>

                  {/* Level Progress */}
                  <div className="w-full md:w-80 space-y-2">
                     <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                        <span>XP Progress</span>
                        <span>{user.points || 0} / {(currentLevel) * 1000}</span>
                     </div>
                     <div className="h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden p-0.5 border border-border/40">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${xpProgress}%` }}
                          className="h-full bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" 
                        />
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-3 w-full lg:w-auto">
              <div className="flex gap-3">
               <Button 
                onClick={() => setIsEditing(true)}
                className="flex-1 lg:flex-none h-16 px-10 rounded-[2rem] bg-foreground text-background font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
               >
                 Edit Configuration
               </Button>
               <Button variant="outline" className="h-16 w-16 rounded-[2rem] border-border bg-card hover:bg-secondary active:scale-95 transition-all">
                  <Settings className="h-6 w-6 text-muted-foreground" />
               </Button>
              </div>
              {/* NGO Verify Button */}
              {user.role === 'ngo' && !user.isNgoVerified && user.ngoVerificationStatus !== 'pending' && user.ngoVerificationStatus !== 'under_review' && (
                <button onClick={() => navigate('/ngo-verify')}
                  className="w-full h-12 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500/20 active:scale-95 transition-all"
                >
                  <ShieldCheck className="h-4 w-4" /> Apply for NGO Verification
                </button>
              )}
              {user.role === 'ngo' && (user.ngoVerificationStatus === 'pending' || user.ngoVerificationStatus === 'under_review') && (
                <div className="w-full h-12 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Verification Pending
                </div>
              )}
              {/* Admin Panel Button */}
              {(user.isAdmin || user.email === 'abhijeetpanda21@gmail.com') && (
                <button onClick={() => navigate('/admin')}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 hover:shadow-violet-600/40 active:scale-95 transition-all"
                >
                  🛡️ Admin Panel
                </button>
              )}
            </div>
         </div>

         {/* 2. CONTRIBUTION SUMMARY CARD ROW */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard label="Tasks Completed" value={user.tasksCompleted || 24} icon={CheckCircle2} />
            <StatCard label="Active Directives" value={2} icon={Target} />
            <StatCard label="Impact Quotient" value={user.points || 1250} icon={Zap} />
            <StatCard label="Service Hours" value="142h" icon={Clock} />
         </div>

         {/* 3. SKILLS & AI INSIGHTS */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8 bg-card border border-border rounded-[3.5rem] p-10 shadow-xl shadow-black/5">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <h3 className="text-xl font-bold">Skills & Expertise</h3>
                      <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/30">Verified Competency Matrix</p>
                   </div>
                   <Button size="sm" className="rounded-xl gap-2 bg-indigo-600 text-[10px] font-black uppercase tracking-widest h-9">
                      <Plus className="h-3.5 w-3.5" /> Add Capability
                   </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {(user.skills || ["Communication", "Logistics", "Digital Strategy"]).map((skill: string, i: number) => (
                      <motion.div 
                        key={i} 
                        whileHover={{ scale: 1.02 }}
                        className="p-5 rounded-2xl bg-secondary/30 border border-border/50 flex items-center justify-between group cursor-default"
                      >
                         <div className="flex gap-4 items-center">
                            <div className="h-12 w-12 rounded-xl bg-background border border-border flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                               <Zap className="h-5 w-5" />
                            </div>
                            <div>
                               <p className="font-bold text-sm tracking-tight">{skill}</p>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-indigo-400">Intermediate</span>
                                  <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                  <span className="text-[8px] font-medium text-muted-foreground/60 italic flex items-center gap-1">
                                     <ShieldCheck className="h-2.5 w-2.5" /> Verified
                                  </span>
                               </div>
                            </div>
                         </div>
                         <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                      </motion.div>
                   ))}
                </div>
            </div>

            <div className="bg-indigo-600/5 border border-indigo-600/20 rounded-[3.5rem] p-10 space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles className="h-24 w-24 text-indigo-600" />
               </div>
               <div className="relative z-10 space-y-6">
                  <div className="space-y-1">
                     <h3 className="text-xl font-bold flex items-center gap-3">AI Insights <Sparkles className="h-4 w-4 text-indigo-500" /></h3>
                     <p className="text-[10px] uppercase font-black tracking-widest text-indigo-600/40">Suggested Optimizations</p>
                  </div>
                  
                  <div className="space-y-4">
                     <div className="p-5 rounded-2xl bg-background border border-indigo-600/10 shadow-sm space-y-3">
                        <p className="text-xs font-bold tracking-tight">Recommended Missions</p>
                        <p className="text-[10px] text-muted-foreground/60 leading-relaxed italic">Based on your "Logistics" skill, we suggest the <span className="text-indigo-600 font-bold">Supply Chain Refresh</span> task.</p>
                     </div>
                     <div className="p-5 rounded-2xl bg-background border border-emerald-600/10 shadow-sm space-y-3">
                        <p className="text-xs font-bold tracking-tight text-emerald-500">Skill Growth</p>
                        <p className="text-[10px] text-muted-foreground/60 leading-relaxed italic">Acquiring "Digital Forensics" could unlock Level 4 Specialist missions.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* 4. ACTIVITY & TASKS/GROUPS GRID */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Left Column: Activity Log */}
            <div className="space-y-8">
               <div className="flex justify-between items-center px-4">
                  <h3 className="text-xl font-bold">Activity Protocol</h3>
                  <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Full Archive</Button>
               </div>
               
               <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide py-2">
                  {(!user.activities || user.activities.length === 0) ? (
                     <div className="p-8 text-center bg-card border border-border rounded-[2.5rem]">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No recent activity</p>
                     </div>
                  ) : user.activities.map((act: any) => (
                     <motion.div 
                       key={act.id}
                       initial={{ opacity: 0, x: -20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       className="p-6 rounded-[2.5rem] bg-card border border-border hover:shadow-lg transition-all group flex items-center gap-6"
                     >
                        <div className={cn(
                          "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border",
                          act.status === 'Success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                          act.status === 'Achievement' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                        )}>
                           {act.status === 'Success' ? <CheckCircle2 className="h-6 w-6" /> : 
                            act.status === 'Achievement' ? <Trophy className="h-6 w-6" /> : <ActivityIcon className="h-6 w-6" />}
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">{act.time}</span>
                              {act.xp && act.xp !== '0' && <span className="text-[9px] font-black text-emerald-500 uppercase">{act.xp} XP</span>}
                           </div>
                           <p className="text-sm font-bold text-foreground group-hover:text-indigo-600 transition-colors">{act.action}</p>
                        </div>
                     </motion.div>
                  ))}
               </div>
            </div>

            {/* Right Column: Tasks & Groups */}
            <div className="space-y-12">
               
               {/* Active Tasks */}
               <div className="space-y-6">
                  <h3 className="text-xl font-bold px-4">Assigned Directives</h3>
                  <div className="space-y-4">
                     {(!user.tasks || user.tasks.length === 0) ? (
                        <div className="p-8 text-center bg-card border border-border rounded-[3rem]">
                           <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No active tasks</p>
                        </div>
                     ) : user.tasks.map((task: any) => (
                        <div key={task.id} className="p-8 rounded-[3rem] bg-card border border-border shadow-sm space-y-6">
                           <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                 <h4 className="text-lg font-black tracking-tight">{task.title}</h4>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{task.status}</p>
                              </div>
                              <span className="text-[10px] font-bold text-muted-foreground/40">{task.deadline}</span>
                           </div>
                           
                           <div className="space-y-3">
                              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                                 <span>Operation Progress</span>
                                 <span>{task.progress}%</span>
                              </div>
                              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                 <div className="h-full bg-indigo-600" style={{ width: `${task.progress}%` }} />
                              </div>
                           </div>
                           
                           <Button className="w-full h-12 rounded-2xl bg-secondary/50 hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">Mark as Completed</Button>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Groups */}
               <div className="space-y-6">
                  <h3 className="text-xl font-bold px-4">Network Affiliations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {(!user.groups || user.groups.length === 0) ? (
                        <div className="col-span-full p-8 text-center bg-card border border-border rounded-[2.5rem]">
                           <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No network affiliations</p>
                        </div>
                     ) : user.groups.map((group: any) => (
                        <div key={group.id} className="p-6 rounded-[2.5rem] bg-card border border-border flex flex-col justify-between h-44 hover:shadow-md transition-all group">
                           <div className="flex justify-between items-start">
                              <div className="h-10 w-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                                 <Users className="h-5 w-5" />
                              </div>
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest",
                                group.role === 'Leader' ? 'bg-indigo-600 text-white' : 'bg-secondary text-muted-foreground'
                              )}>{group.role}</span>
                           </div>
                           <div className="space-y-1">
                              <h5 className="font-bold text-sm tracking-tight">{group.name}</h5>
                              <p className="text-[9px] font-medium text-muted-foreground/60 italic">{group.members} active members</p>
                           </div>
                           <Button variant="ghost" className="h-8 p-0 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500 justify-start hover:bg-transparent hover:translate-x-2 transition-all">View Network →</Button>
                        </div>
                     ))}
                  </div>
               </div>

            </div>
         </div>

         {/* 5. ACHIEVEMENTS CABINET */}
         <div className="space-y-8 bg-slate-900/40 rounded-[4rem] p-12 border border-white/5 relative overflow-hidden ring-1 ring-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent h-full w-full pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
               <Trophy className="h-7 w-7 text-amber-500" />
               <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight">Hall of Merit</h3>
                  <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/30">Strategic Milestone Verification</p>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
               {(!user.badges || user.badges.length === 0) ? (
                  <div className="col-span-full p-8 text-center border border-white/5 rounded-[3rem]">
                     <p className="text-xs font-bold text-white/40 uppercase tracking-widest">No badges earned yet</p>
                  </div>
               ) : user.badges.map((badge: any) => (
                  <motion.div 
                    key={badge.id}
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    className="p-8 rounded-[3rem] bg-card border border-border shadow-2xl space-y-6 text-center ring-1 ring-white/5 relative group cursor-default"
                  >
                     <div className={cn("h-24 w-24 mx-auto rounded-full bg-gradient-to-br flex items-center justify-center shadow-2xl relative", badge.color || 'from-indigo-400 to-indigo-600')}>
                        <Award className="h-12 w-12 text-white" />
                        <div className="absolute inset-2 border-2 border-white/20 rounded-full border-dashed animate-[spin_10s_linear_infinite]" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="text-lg font-black tracking-tighter">{badge.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-medium italic opacity-60 leading-tight">{badge.flavor}</p>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>

          {/* Logout Button - Mobile Visible */}
          <div className="pt-8 pb-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 h-16 rounded-3xl border border-red-500/20 bg-red-500/5 text-red-500 font-bold text-sm uppercase tracking-wider hover:bg-red-500/10 active:scale-95 transition-all"
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </button>
          </div>

      </div>
    </div>
    </>
  )
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
