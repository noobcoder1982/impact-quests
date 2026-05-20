import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  AnalyticsUpIcon as TrendingUp, 
  FlashIcon as Zap, 
  Target01Icon as Target, 
  Activity01Icon as Activity, 
  Share02Icon as Share2, 
  ArrowUpRight01Icon as ArrowUpRight, 
  GlobeIcon as Globe, 
  UserGroupIcon as Users,
  Award01Icon as Trophy,
  StarIcon as Star,
  Clock01Icon as Clock,
  Refresh01Icon as RefreshIcon,
  CheckmarkCircle01Icon as CheckCircle,
  HelpCircleIcon as HelpCircle,
} from "hugeicons-react"
import { Button } from "./ui/button"
import { apiRequest } from "../lib/api"

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  level: number;
  tasksCompleted: number;
  badgeCount: number;
  reliabilityScore: number;
  currentStreak: number;
}

export default function ImpactScorePage() {
  const [user, setUser] = React.useState<any>(null);
  const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [syncing, setSyncing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'personal' | 'leaderboard'>('personal');
  const [selectedBadge, setSelectedBadge] = React.useState<any>(null);
  const [isSimulated, setIsSimulated] = React.useState(false);

  // XP Projection Calculator state
  const [targetLevel, setTargetLevel] = React.useState<number>(1);
  const [simLow, setSimLow] = React.useState(0);
  const [simMedium, setSimMedium] = React.useState(0);
  const [simHigh, setSimHigh] = React.useState(0);
  const [simCritical, setSimCritical] = React.useState(0);

  const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000];

  React.useEffect(() => {
    fetchCoreTelemetry();
  }, []);

  const fetchCoreTelemetry = async () => {
    try {
      const [meResponse, lbResponse] = await Promise.all([
        apiRequest('/auth/me'),
        apiRequest('/volunteers/leaderboard?limit=10'),
      ]);
      
      const freshUser = meResponse?.data?.user;
      if (!freshUser) throw new Error("No user returned");
      
      setUser(freshUser);
      setLeaderboard(lbResponse?.data?.leaderboard || []);
      setIsSimulated(false);
      
      // Update local storage to keep state clean
      localStorage.setItem('user', JSON.stringify(freshUser));
      
      // Set default target level projection to current level + 1
      if (freshUser.level) {
        setTargetLevel(Math.min(10, freshUser.level + 1));
      }
    } catch (err) {
      console.warn("Failed to load impact details, entering simulated mode:", err);
      setIsSimulated(true);
      
      // Fallback to local storage if API fails or offline
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.name) {
            setUser(parsed);
            setTargetLevel(Math.min(10, (parsed.level || 1) + 1));
          } else {
            throw new Error("Invalid user structure");
          }
        } catch (e) {
          loadDemoUserFallback();
        }
      } else {
        loadDemoUserFallback();
      }
      
      // Fallback leaderboard
      setLeaderboard([
        { rank: 1, name: "Operative Prime", points: 8200, level: 9, tasksCompleted: 104, badgeCount: 8, reliabilityScore: 98, currentStreak: 15 },
        { rank: 2, name: "Alex Mercer", points: 4100, level: 8, tasksCompleted: 53, badgeCount: 6, reliabilityScore: 95, currentStreak: 7 },
        { rank: 3, name: "Sarah Connor", points: 2600, level: 7, tasksCompleted: 35, badgeCount: 5, reliabilityScore: 91, currentStreak: 3 },
        { rank: 4, name: "Operative Zero", points: 1250, level: 5, tasksCompleted: 18, badgeCount: 5, reliabilityScore: 94.5, currentStreak: 4 },
        { rank: 5, name: "Marcus Wright", points: 950, level: 4, tasksCompleted: 12, badgeCount: 3, reliabilityScore: 89, currentStreak: 1 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadDemoUserFallback = () => {
    const demoUser = {
      name: "Operative Zero",
      points: 1250,
      level: 5,
      reliabilityScore: 94.5,
      tasksCompleted: 18,
      currentStreak: 4,
      longestStreak: 12,
      badges: [
        { name: "🌱 First Steps", description: "Completed your first task", awardedAt: new Date().toISOString() },
        { name: "🤝 Helping Hand", description: "Completed 5 tasks", awardedAt: new Date().toISOString() },
        { name: "⭐ Rising Star", description: "Reached Level 3", awardedAt: new Date().toISOString() },
        { name: "🛡️ Reliable", description: "Reliability score above 80", awardedAt: new Date().toISOString() },
        { name: "👑 Elite", description: "Reached Level 5+", awardedAt: new Date().toISOString() }
      ],
      role: "volunteer"
    };
    setUser(demoUser);
    setTargetLevel(6);
    localStorage.setItem('user', JSON.stringify(demoUser));
  };

  const handleSyncGrid = async () => {
    setSyncing(true);
    await fetchCoreTelemetry();
    setTimeout(() => setSyncing(false), 800);
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen bg-zinc-950 p-10 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
        <div className="space-y-6 text-center z-10 max-w-md w-full">
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="bg-indigo-500 h-full rounded-full"
            />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-550 animate-pulse">Synchronizing Cognitive Ledgers...</p>
        </div>
      </div>
    );
  }

  // Safe variables fallback
  const points = user?.points || 0;
  const currentLevel = user?.level || 1;
  const reliability = user?.reliabilityScore || 0;
  const tasksCompleted = user?.tasksCompleted || 0;
  const currentStreak = user?.currentStreak || 0;
  const longestStreak = user?.longestStreak || 0;
  const badgesEarned = user?.badges || [];

  // Calculate XP within current level
  const currentLevelThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const nextLevelThreshold = LEVEL_THRESHOLDS[currentLevel] || 10000;
  const xpEarnedInLevel = points - currentLevelThreshold;
  const totalLevelXpNeeded = nextLevelThreshold - currentLevelThreshold;
  const xpPercentage = Math.min(100, Math.max(0, (xpEarnedInLevel / totalLevelXpNeeded) * 100));

  // Projected XP logic
  const simPoints = (simLow * 10) + (simMedium * 20) + (simHigh * 40) + (simCritical * 80);
  const totalProjectedPoints = points + simPoints;
  const targetXpThreshold = LEVEL_THRESHOLDS[targetLevel - 1] || 0;
  const pointsNeededForTarget = Math.max(0, targetXpThreshold - points);
  const remainingAfterSim = Math.max(0, pointsNeededForTarget - simPoints);

  // Export ledger format
  const exportLedger = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `impact_ledger_${(user?.name || 'operative').replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const predefinedBadges = [
    { name: '🌱 First Steps', description: 'Completed your first task', requirement: 'Tasks Completed >= 1' },
    { name: '🤝 Helping Hand', description: 'Completed 5 tasks', requirement: 'Tasks Completed >= 5' },
    { name: '⭐ Rising Star', description: 'Reached Level 3', requirement: 'Level >= 3' },
    { name: '🦸 Community Hero', description: 'Completed 25 tasks', requirement: 'Tasks Completed >= 25' },
    { name: '🏛️ Centurion', description: 'Earned 500+ points', requirement: 'Points >= 500' },
    { name: '🏆 Legend', description: 'Completed 100 tasks', requirement: 'Tasks Completed >= 100' },
    { name: '🔥 On Fire', description: 'Maintained a 3-day streak', requirement: 'Current Streak >= 3' },
    { name: '💎 Streak Master', description: 'Maintained a 7-day streak', requirement: 'Current Streak >= 7' },
    { name: '🛡️ Reliable', description: 'Reliability score above 80', requirement: 'Reliability Score >= 80' },
    { name: '👑 Elite', description: 'Reached Level 5+', requirement: 'Level >= 5' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-zinc-950 font-sans selection:bg-indigo-500/10 transition-all select-none">
      
      {/* Swiss grid alignment matrix */}
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

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* HEADER BLOCK */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-900">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono tracking-widest text-zinc-550 uppercase mb-4">
              🛡️ Decentralized Operational Matrix
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase leading-none">
              Impact <span className="text-indigo-400 font-light italic">Dynamics</span>
            </h1>
            <p className="text-xs font-mono text-zinc-500 mt-2">MONITOR VOLUNTEER METRICS // MANAGE COMMUNITY XP LEDGERS</p>
          </div>
          <div className="flex gap-3">
             <Button 
               variant="outline" 
               onClick={exportLedger}
               className="rounded-xl h-12 border-zinc-850 bg-zinc-950 hover:bg-zinc-900 text-xs font-mono uppercase tracking-wider text-zinc-350"
             >
                <Share2 className="h-4 w-4 mr-2" /> Export Ledger
             </Button>
             <Button 
               onClick={handleSyncGrid}
               disabled={syncing}
               className="rounded-xl h-12 bg-white text-zinc-950 hover:bg-zinc-100 text-xs font-black uppercase tracking-widest px-6"
             >
                {syncing ? (
                  <RefreshIcon className="h-4 w-4 mr-2 animate-spin text-indigo-500" />
                ) : (
                  <RefreshIcon className="h-4 w-4 mr-2" />
                )}
                Sync Core Grid
             </Button>
          </div>
        </header>

        {isSimulated && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-wider text-amber-400">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Offline / Simulation Mode Active — Displaying Local Biometric Dossier Ledger</span>
            </div>
            <span className="text-zinc-500">[ API Link Unreachable ]</span>
          </div>
        )}

        {/* INTERACTIVE NAVIGATION CONTROL */}
        <div className="flex items-center border-b border-zinc-900 pb-1">
          <div className="flex gap-6 font-mono text-xs uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('personal')}
              className={`pb-3 relative transition-colors cursor-pointer ${activeTab === 'personal' ? 'text-white font-bold' : 'text-zinc-650 hover:text-zinc-400'}`}
            >
              [ 01 // Biometric Dossier ]
              <div className={`absolute bottom-0 inset-x-0 h-[2px] bg-indigo-500 transition-all duration-300 ${activeTab === 'personal' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`} />
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`pb-3 relative transition-colors cursor-pointer ${activeTab === 'leaderboard' ? 'text-white font-bold' : 'text-zinc-650 hover:text-zinc-400'}`}
            >
              [ 02 // Global Leaderboard ]
              <div className={`absolute bottom-0 inset-x-0 h-[2px] bg-indigo-500 transition-all duration-300 ${activeTab === 'leaderboard' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`} />
            </button>
          </div>
        </div>

        {activeTab === 'personal' ? (
          <>
            {/* DOSSIER SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Point Metric */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-[2.5rem] border border-zinc-900 bg-zinc-900/10 flex flex-col justify-between h-48 relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-125 transition-transform duration-700">
                  <Zap className="h-28 w-28 text-indigo-400" />
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[9px] text-zinc-600">[ 01 ]</span>
                  <span className="text-[8px] font-mono uppercase text-indigo-400 font-bold bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/30">Sync Nominal</span>
                </div>
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500">CUMULATIVE EXPERIENCE POINTS</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black tracking-tighter">{points}</span>
                    <span className="text-zinc-600 font-mono text-sm">XP</span>
                  </div>
                </div>
              </motion.div>

              {/* Reliability Indicator */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-8 rounded-[2.5rem] border border-zinc-900 bg-zinc-900/10 flex flex-col justify-between h-48 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-125 transition-transform duration-700">
                  <Activity className="h-28 w-28 text-emerald-400" />
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[9px] text-zinc-600">[ 02 ]</span>
                  <span className="text-[8px] font-mono uppercase text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/30">Verified Rating</span>
                </div>
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500">OPERATIONAL RELIABILITY</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black tracking-tighter">{reliability.toFixed(1)}%</span>
                  </div>
                </div>
              </motion.div>

              {/* Tasks completed */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-8 rounded-[2.5rem] border border-zinc-900 bg-zinc-900/10 flex flex-col justify-between h-48 relative overflow-hidden group hover:border-orange-500/20 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-125 transition-transform duration-700">
                  <Target className="h-28 w-28 text-orange-400" />
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[9px] text-zinc-600">[ 03 ]</span>
                  <span className="text-[8px] font-mono uppercase text-orange-400 font-bold bg-orange-950/40 px-2 py-0.5 rounded border border-orange-900/30">Directives Sync</span>
                </div>
                <div>
                  <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-zinc-500">TASKS SUCCESSFULLY COMPLETED</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black tracking-tighter">{tasksCompleted}</span>
                    <span className="text-zinc-600 font-mono text-xs uppercase">Committed</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* PROGRESSION LEVEL GAUGE */}
            <div className="border border-zinc-900 bg-zinc-900/10 rounded-[3rem] p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
                <div className="space-y-1">
                  <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2.5">
                    LEVEL PROGRESSION ENGINE
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-900/30 text-indigo-400 text-[10px] font-mono uppercase tracking-widest font-black shrink-0">
                      LEVEL {currentLevel}
                    </span>
                  </h3>
                  <p className="text-[9px] font-mono text-zinc-500">OPERATIVE EVOLUTION XP THRESHOLDS Matrix</p>
                </div>
                <div className="font-mono text-right text-xs">
                  <span className="text-[8px] text-zinc-500 uppercase block">XP FOR LVL {currentLevel + 1}</span>
                  <span className="text-zinc-200 font-bold">{points} / {nextLevelThreshold} XP</span>
                </div>
              </div>

              {/* XP Progress slider */}
              <div className="space-y-3">
                <div className="h-3 w-full bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden relative p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                  />
                </div>
                <div className="flex justify-between font-mono text-[9px] text-zinc-550 uppercase tracking-widest">
                  <span>Level {currentLevel} ({currentLevelThreshold} XP)</span>
                  <span>{xpPercentage.toFixed(1)}% Completed</span>
                  <span>Level {currentLevel + 1} ({nextLevelThreshold} XP)</span>
                </div>
              </div>

              {/* LEVEL CHEATSHEET MARKERS */}
              <div className="border-t border-zinc-900/60 pt-6">
                <p className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-3">[ Core Evolution Milestones ]</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-[9px] text-zinc-400">
                  {LEVEL_THRESHOLDS.slice(1, 6).map((threshold, idx) => {
                    const targetLvl = idx + 2;
                    const isPassed = currentLevel >= targetLvl;
                    return (
                      <div key={targetLvl} className={`p-3 rounded-xl border flex flex-col justify-between h-16 ${
                        isPassed ? 'bg-indigo-950/15 border-indigo-900/20 text-indigo-400' : 'bg-zinc-950 border-zinc-900/50 text-zinc-600'
                      }`}>
                        <span className="font-bold">LEVEL {targetLvl}</span>
                        <span className="text-[8px] uppercase tracking-wider">{threshold} XP REQUIRED</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* TWIN PANEL SECTION: BADGES & XP PRESET SIMULATOR */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* BADGE CABINET (lg:span-7) */}
              <div className="lg:col-span-7 border border-zinc-900 bg-zinc-900/10 rounded-[3rem] p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black uppercase tracking-wider">DECORATIVE CABNET</h3>
                    <p className="text-[9px] font-mono text-zinc-500">OPERATIVE BADGES EARNED & ACHIEVABLE</p>
                  </div>
                  <div className="font-mono text-right text-xs">
                    <span className="text-[8px] text-zinc-500 uppercase block">EARNED CODES</span>
                    <span className="text-zinc-200 font-bold">{badgesEarned.length} / {predefinedBadges.length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {predefinedBadges.map((badgeDef) => {
                    const isEarned = badgesEarned.some((b: any) => b.name === badgeDef.name);
                    const actualBadgeData = badgesEarned.find((b: any) => b.name === badgeDef.name);

                    return (
                      <button
                        key={badgeDef.name}
                        onClick={() => setSelectedBadge({ ...badgeDef, ...actualBadgeData, isEarned })}
                        className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all active:scale-95 ${
                          isEarned
                            ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                            : 'bg-zinc-900/20 border-zinc-900/60 opacity-40 hover:opacity-60'
                        }`}
                      >
                        <div className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-lg border shadow-lg ${
                          isEarned ? 'bg-indigo-950/20 border-indigo-900/40 text-indigo-400' : 'bg-zinc-900 border-zinc-850 text-zinc-600'
                        }`}>
                          {badgeDef.name.split(' ')[0]}
                        </div>
                        <div>
                          <p className="text-[9.5px] font-bold text-zinc-200 uppercase leading-none truncate max-w-[120px]">{badgeDef.name.replace(/^\S+\s*/, '')}</p>
                          <p className="text-[8px] font-mono text-zinc-550 mt-1 uppercase tracking-wider">
                            {isEarned ? 'UNLOCKED' : 'LOCKED'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* XP PRESET SIMULATOR (lg:span-5) */}
              <div className="lg:col-span-5 border border-zinc-900 bg-zinc-900/10 rounded-[3rem] p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black uppercase tracking-wider">PROJECTION CALC</h3>
                    <p className="text-[9px] font-mono text-zinc-550">SIMULATE REMAINING SHIFTS NEEDED TO REACH A LEVEL GOAL</p>
                  </div>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  {/* Select Level Target */}
                  <div className="space-y-2">
                    <label className="text-[9px] text-zinc-400 uppercase tracking-widest">Select Target Level</label>
                    <select
                      value={targetLevel}
                      onChange={(e) => setTargetLevel(parseInt(e.target.value))}
                      className="w-full h-11 bg-zinc-950 border border-zinc-850 rounded-xl px-4 text-zinc-300 outline-none text-xs"
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                        <option key={lvl} value={lvl} disabled={lvl <= currentLevel}>
                          Level {lvl} ({LEVEL_THRESHOLDS[lvl - 1]} XP Goal) {lvl <= currentLevel ? '[PASS]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Drag / Click simulators */}
                  <div className="space-y-2.5 pt-2">
                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest">[ Simulate Directives Completion ]</p>
                    
                    <div className="space-y-2">
                      {[
                        { label: "🚨 Critical Shifts (+80 XP)", value: simCritical, setter: setSimCritical },
                        { label: "⚡ High Urgency (+40 XP)", value: simHigh, setter: setSimHigh },
                        { label: "📦 Medium Urgency (+20 XP)", value: simMedium, setter: setSimMedium },
                        { label: "🤝 Low Urgency (+10 XP)", value: simLow, setter: setSimLow },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-zinc-950 border border-zinc-900 p-2.5 rounded-xl">
                          <span className="text-[10px] text-zinc-400">{item.label}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => item.setter(Math.max(0, item.value - 1))}
                              className="h-6 w-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-zinc-400 hover:text-white"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold text-zinc-200">{item.value}</span>
                            <button
                              onClick={() => item.setter(item.value + 1)}
                              className="h-6 w-6 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-zinc-400 hover:text-white"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calculator output */}
                  <div className="border-t border-zinc-900 pt-4 space-y-2 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">XP NEEDED FOR LVL {targetLevel}:</span>
                      <span className="text-zinc-300 font-bold">{pointsNeededForTarget} XP</span>
                    </div>
                    <div className="flex justify-between text-indigo-400">
                      <span>SIMULATED SHIFT XP EARNED:</span>
                      <span className="font-bold">+{simPoints} XP</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-900/60 pt-2 font-bold text-xs">
                      <span className={remainingAfterSim === 0 ? 'text-emerald-400' : 'text-zinc-400'}>
                        {remainingAfterSim === 0 ? '🎯 GOAL REACHED!' : 'XP STILL REQUIRED:'}
                      </span>
                      <span className={remainingAfterSim === 0 ? 'text-emerald-400' : 'text-orange-400'}>
                        {remainingAfterSim} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STREAK MASTERY BANNER */}
            <div className="border border-zinc-900 bg-zinc-900/10 rounded-[3rem] p-8 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-lg font-black uppercase tracking-wider flex items-center justify-center sm:justify-start gap-2">
                  STREAK MASTERY ENGINE
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
                </h3>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Maintain active daily synchronization checks to retain XP multiplier matrix</p>
              </div>

              <div className="flex items-center gap-8 font-mono text-center shrink-0">
                <div className="space-y-1">
                  <span className="text-[8px] text-zinc-500 uppercase block">CURRENT FIRE</span>
                  <span className="text-3xl font-black text-orange-500">{currentStreak} <span className="text-zinc-650 font-mono text-sm">Days</span></span>
                </div>
                <div className="w-px h-8 bg-zinc-900" />
                <div className="space-y-1">
                  <span className="text-[8px] text-zinc-500 uppercase block">RECORD STREAK</span>
                  <span className="text-3xl font-black text-indigo-400">{longestStreak} <span className="text-zinc-650 font-mono text-sm">Days</span></span>
                </div>
              </div>
            </div>

            {/* BADGE DRAWER OVERLAY */}
            <AnimatePresence>
              {selectedBadge && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
                  onClick={() => setSelectedBadge(null)}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 15 }}
                    className="border border-zinc-900 bg-zinc-950 p-8 rounded-[3.5rem] w-full max-w-sm text-center relative space-y-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="h-20 w-20 rounded-full mx-auto flex items-center justify-center font-bold text-3xl bg-indigo-950/20 border border-indigo-900/40 text-indigo-400 shadow-2xl relative">
                      {selectedBadge.name.split(' ')[0]}
                      {selectedBadge.isEarned && (
                        <div className="absolute inset-0 border border-indigo-500/20 border-dashed rounded-full animate-[spin_10s_linear_infinite]" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xl font-black uppercase tracking-tight text-white">{selectedBadge.name.replace(/^\S+\s*/, '')}</h4>
                      <p className="text-xs font-mono text-zinc-400 px-4 leading-relaxed">{selectedBadge.description}</p>
                    </div>

                    <div className="border-t border-zinc-900 pt-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest space-y-2">
                      <div className="flex justify-between px-2">
                        <span>REQUIREMENT:</span>
                        <span className="text-zinc-400 font-bold">{selectedBadge.requirement}</span>
                      </div>
                      <div className="flex justify-between px-2 border-t border-zinc-900/40 pt-2">
                        <span>AWARD STATUS:</span>
                        <span className={selectedBadge.isEarned ? 'text-emerald-400 font-bold' : 'text-zinc-650'}>
                          {selectedBadge.isEarned ? 'UNLOCKED' : 'LOCKED'}
                        </span>
                      </div>
                      {selectedBadge.awardedAt && (
                        <div className="flex justify-between px-2 border-t border-zinc-900/40 pt-2 text-[8.5px]">
                          <span>AWARDED AT:</span>
                          <span className="text-zinc-450">
                            {new Date(selectedBadge.awardedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedBadge(null)}
                      className="w-full h-11 bg-white hover:bg-zinc-100 text-zinc-950 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all active:scale-95 cursor-pointer"
                    >
                      Close Dossier
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          /* GLOBAL LEADERBOARD SECTION */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-zinc-900 bg-zinc-900/10 rounded-[3rem] p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase tracking-wider">GLOBAL VOLUNTEER HIERARCHY</h3>
                <p className="text-[9px] font-mono text-zinc-500">REAL-TIME RANKINGS RATED BY OPERATIVE EXPERIENCE POINTS (XP)</p>
              </div>
              <div className="bg-zinc-950 border border-zinc-900 px-3.5 py-1.5 rounded-xl font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                Nodes Synced: {leaderboard.length} Online
              </div>
            </div>

            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((lbUser, index) => {
                  const isSelf = lbUser.name === user?.name;
                  const rankStr = String(lbUser.rank).padStart(2, '0');

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-2xl border flex items-center justify-between font-mono text-xs leading-none transition-all ${
                        isSelf
                          ? 'bg-indigo-950/15 border-indigo-900/35 shadow-[0_0_15px_rgba(99,102,241,0.06)]'
                          : 'bg-zinc-950 border-zinc-900 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        {/* Rank indicator */}
                        <span className={`text-[10px] font-bold ${
                          lbUser.rank === 1 ? 'text-amber-400' :
                          lbUser.rank === 2 ? 'text-zinc-300' :
                          lbUser.rank === 3 ? 'text-orange-400' :
                          'text-zinc-600'
                        }`}>
                          #{rankStr}
                        </span>
                        
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold border shrink-0 ${
                            isSelf ? 'bg-indigo-950/20 border-indigo-900/40 text-indigo-400' : 'bg-zinc-900 border-zinc-850 text-zinc-400'
                          }`}>
                            {lbUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-200 text-[11px] uppercase flex items-center gap-2">
                              {lbUser.name}
                              {isSelf && (
                                <span className="text-[8px] bg-indigo-500/10 border border-indigo-900/30 text-indigo-400 px-1.5 py-0.5 rounded font-black tracking-widest shrink-0">
                                  YOU
                                </span>
                              )}
                            </p>
                            <p className="text-[8px] text-zinc-650 mt-1 uppercase tracking-wider">
                              Level {lbUser.level} Operative · {lbUser.badgeCount} Seals Earned
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-8 font-mono shrink-0">
                        <div className="hidden sm:block text-zinc-550 text-[10px] uppercase">
                          <span className="font-bold text-zinc-400">{lbUser.tasksCompleted}</span> Tasks Done
                        </div>
                        <div className="hidden sm:block text-zinc-550 text-[10px] uppercase">
                          <span className="font-bold text-emerald-500">{Math.round(lbUser.reliabilityScore)}%</span> Rel
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">
                            {lbUser.points}
                          </span>
                          <span className="text-[7.5px] text-zinc-550 uppercase tracking-widest block mt-0.5">
                            XP LEDGER
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center font-mono text-zinc-500 text-xs">
                No active global coordination channels detected. Let other operatives join the coordinate grid!
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
