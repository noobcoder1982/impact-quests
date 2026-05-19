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
    <div className="md:hidden flex flex-col overflow-y-auto scrollbar-hide pb-40 bg-background text-foreground">

      {/* ── Hero banner ── */}
      <div className="relative h-52 w-full overflow-hidden">
        {bannerImage
          ? <img src={bannerImage} alt="banner" className="absolute inset-0 w-full h-full object-cover" />
          : <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        {/* banner upload */}
        <label className="absolute top-4 right-4 h-9 px-4 rounded-full bg-white/10 border border-white/10 flex items-center gap-2 cursor-pointer active:scale-95 transition-all">
          <Settings className="h-3.5 w-3.5 text-white/70" />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Cover</span>
          <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'banner')} />
        </label>
      </div>

      {/* ── Identity ── */}
      <div className="px-5 -mt-16 relative z-10 mb-6">
        {/* avatar */}
        <div className="relative w-fit mb-4">
          <div className="h-24 w-24 rounded-[1.75rem] bg-card border-4 border-background shadow-2xl overflow-hidden">
            {pfpImage
              ? <img src={pfpImage} alt="av" className="w-full h-full object-cover" />
              : <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}&backgroundColor=f8faff`} alt="av" className="w-full h-full object-cover" />}
          </div>
          <label className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-indigo-600 border-2 border-background flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-lg shadow-indigo-600/30">
            <Plus className="h-4 w-4 text-white" />
            <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'pfp')} />
          </label>
          <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="h-3 w-3 text-white" />
          </div>
        </div>

        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-1">Strategic Operator</p>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-3xl font-black tracking-tighter text-foreground">{user.name}</h1>
          {user.isNgoVerified && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest shrink-0">
              <ShieldCheck className="h-2.5 w-2.5" /> NGO
            </span>
          )}
        </div>
        {user.role === 'ngo' && user.organizationName && (
          <p className="text-xs font-medium text-muted-foreground/60 mb-1">{user.organizationName}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-[10px] font-black uppercase tracking-widest">
            <Award className="h-3 w-3 text-indigo-400" /> Lvl {currentLevel}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
            <Circle className="h-2 w-2 fill-current" /> Available
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            <Calendar className="h-3 w-3" /> {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* XP bar */}
        <div className="space-y-1.5 mb-5">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
            <span>XP Progress</span>
            <span>{user.points || 0} / {currentLevel * 1000}</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
              className="h-full bg-indigo-600 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.6)]"
            />
          </div>
        </div>

        {/* Edit button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(true)}
          className="w-full h-12 rounded-2xl bg-foreground text-background text-[11px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all duration-300"
        >
          Edit Profile
        </motion.button>

        {/* NGO Verified Badge + Verify CTA */}
        {user.role === 'ngo' && user.isNgoVerified && (
          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Verified NGO</span>
          </div>
        )}
        {user.role === 'ngo' && !user.isNgoVerified && user.ngoVerificationStatus !== 'pending' && user.ngoVerificationStatus !== 'under_review' && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/ngo-verify')}
            className="w-full h-12 rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-600 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <ShieldCheck className="h-4 w-4" /> Get NGO Verified
          </motion.button>
        )}
        {user.role === 'ngo' && (user.ngoVerificationStatus === 'pending' || user.ngoVerificationStatus === 'under_review') && (
          <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Verification Pending</span>
          </div>
        )}

        {/* Admin Panel Button */}
        {(user.isAdmin || user.email === 'abhijeetpanda21@gmail.com') && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin')}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 active:scale-95 transition-all"
          >
            🛡️ Admin Panel
          </motion.button>
        )}
      </div>

      {/* ── Stats row ── */}
      <div className="px-5 mb-6">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-3">Impact Overview</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Tasks Done',    value: user.tasksCompleted || 24, icon: CheckCircle2 },
            { label: 'Impact Score',  value: user.points || 1250,       icon: Zap },
            { label: 'Active Tasks',  value: 2,                          icon: Target },
            { label: 'Hours Served',  value: '142h',                     icon: Clock },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: i * 0.07 }}
              whileHover={{ y: -5, scale: 1.01 }}
              className="relative p-5 rounded-[2rem] bg-card border border-border/50 shadow-xl shadow-black/5 overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <s.icon className="h-12 w-12" />
              </div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-1">{s.label}</p>
              <p className="text-2xl font-black tracking-tighter text-foreground">{s.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Skills ── */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Skills & Expertise</p>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            <Plus className="h-3 w-3" /> Add
          </motion.button>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {(user.skills?.length ? user.skills : ['Communication', 'Logistics', 'Digital Strategy']).map((skill: string, i: number) => (
              <motion.div
                key={skill}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: i * 0.06 }}
                whileHover={{ y: -5, scale: 1.01 }}
                className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-card border border-border/50 group cursor-default"
              >
                <div className="h-10 w-10 rounded-xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shrink-0">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold tracking-tight truncate">{skill}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mt-0.5">Intermediate · Verified</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ── AI Insights ── */}
      <div className="px-5 mb-6">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-3">AI Insights</p>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="rounded-[2rem] bg-indigo-600/5 border border-indigo-600/20 p-5 space-y-3 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles className="h-16 w-16 text-indigo-400" />
          </div>
          {[
            { title: 'Recommended Mission', body: 'Based on your Logistics skill — Supply Chain Refresh is a strong match.', color: 'text-indigo-400', bg: 'bg-background border-indigo-600/10' },
            { title: 'Skill Growth',        body: 'Acquiring Digital Forensics could unlock Level 4 Specialist missions.', color: 'text-emerald-400', bg: 'bg-background border-emerald-600/10' },
          ].map((ins, i) => (
            <motion.div
              key={ins.title}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.1 + i * 0.08 }}
              className={`p-4 rounded-2xl border ${ins.bg} space-y-1`}
            >
              <p className={`text-[10px] font-black uppercase tracking-widest ${ins.color}`}>{ins.title}</p>
              <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{ins.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── Achievements ── */}
      <div className="px-5 mb-6">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-3">Hall of Merit</p>
        {(!user.badges || user.badges.length === 0) ? (
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-amber-500/30" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">No badges yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <AnimatePresence>
              {user.badges.map((badge: any, i: number) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...spring, delay: i * 0.07 }}
                  whileHover={{ y: -5, scale: 1.01 }}
                  className="p-5 rounded-[2rem] bg-card border border-border/50 shadow-xl shadow-black/5 flex flex-col items-center gap-3 text-center"
                >
                  <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${badge.color || 'from-indigo-400 to-indigo-600'} flex items-center justify-center shadow-xl`}>
                    <Award className="h-7 w-7 text-white" />
                  </div>
                  <p className="text-xs font-black tracking-tight leading-tight">{badge.name}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Activity ── */}
      <div className="px-5 mb-6">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 mb-3">Recent Activity</p>
        {(!user.activities || user.activities.length === 0) ? (
          <div className="p-8 rounded-[2rem] bg-card border border-border/50 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {user.activities.slice(0, 5).map((act: any, i: number) => (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: i * 0.06 }}
                  className="flex items-center gap-4 p-4 rounded-[1.5rem] bg-card border border-border/50 group"
                >
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border",
                    act.status === 'Success'     ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    act.status === 'Achievement' ? 'bg-amber-500/10  border-amber-500/20  text-amber-500'  :
                                                   'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                  )}>
                    {act.status === 'Success' ? <CheckCircle2 className="h-4 w-4" /> :
                     act.status === 'Achievement' ? <Trophy className="h-4 w-4" /> :
                     <ActivityIcon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-indigo-400 transition-colors">{act.action}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mt-0.5">{act.time}</p>
                  </div>
                  {act.xp && act.xp !== '0' && (
                    <span className="text-[9px] font-black text-emerald-500 uppercase shrink-0">{act.xp} XP</span>
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
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-full h-12 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-500 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all duration-300"
        >
          <LogOut className="h-4 w-4" /> Sign Out
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
