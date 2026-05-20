import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Zap,
  Clock,
  Calendar,
  Shield,
  Activity,
  Coffee,
  RefreshCw,
  Droplet,
  Moon,
  Sparkles,
  Heart,
  ChevronRight,
  Info,
  CheckCircle,
  AlertOctagon,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface EnergyHistory {
  value: number;
  timestamp: string;
  reason: string;
}

interface EnergyData {
  energy: {
    current: number;
    max: number;
    lastUpdated: string;
    history: EnergyHistory[];
  };
  burnout: {
    score: number;
    risk: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  };
  focus: {
    score: number;
  };
  workload: {
    capacity: number;
    recommended: number;
    restNeeded: boolean;
  };
  activityPatterns: {
    averageTasksPerDay: number;
    averageWorkHours: number;
    peakProductivityHours: number[];
    restDays: string[];
    lastActive: string;
  };
  trustScore: number;
  recommendations: string[];
}

const EnergyDashboardPage: React.FC = () => {
  const [energyData, setEnergyData] = useState<EnergyData | null>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [takingRest, setTakingRest] = useState(false);
  const [restAction, setRestAction] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  
  // Feedback Simulator state
  const [simTask, setSimTask] = useState('active-patrol');
  const [mentalDrain, setMentalDrain] = useState<'very-low' | 'low' | 'medium' | 'high' | 'very-high'>('medium');
  const [focusQuality, setFocusQuality] = useState<number>(4);
  const [capacityForMore, setCapacityForMore] = useState<'yes' | 'maybe' | 'no'>('maybe');
  const [actualDifficulty, setActualDifficulty] = useState<'easy' | 'medium' | 'hard' | 'very-hard'>('medium');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statusResponse, historyResponse] = await Promise.all([
        apiRequest('/energy'),
        apiRequest('/energy/history?days=7'),
      ]);
      if (!statusResponse?.data) throw new Error("No data returned");
      
      setEnergyData(statusResponse.data);
      setHistoryData(historyResponse?.data || null);
      setIsSimulated(false);
    } catch (error) {
      console.warn('Failed to fetch live energy data, entering simulation mode:', error);
      setIsSimulated(true);
      
      const demoEnergy = {
        energy: {
          current: 78,
          max: 100,
          lastUpdated: new Date().toISOString(),
          history: [
            { value: 90, timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), reason: "Power Nap" },
            { value: 82, timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), reason: "Hydration Intake" },
            { value: 50, timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), reason: "High Urgency Task" },
          ]
        },
        burnout: {
          score: 34,
          risk: 'low' as const,
          factors: ["Prolonged Cognitive Focus", "Consecutive High Urgency Tasks"],
        },
        focus: {
          score: 82,
        },
        workload: {
          capacity: 85,
          recommended: 60,
          restNeeded: false,
        },
        activityPatterns: {
          averageTasksPerDay: 4.2,
          averageWorkHours: 6.5,
          peakProductivityHours: [9, 10, 14, 15],
          restDays: ["Sunday"],
          lastActive: new Date().toISOString(),
        },
        trustScore: 98.4,
        recommendations: [
          "Hydration replenishment suggested in 25 minutes.",
          "Schedule a short physical recovery block before next medium/high task.",
          "Cognitive clarity remains high; focus index nominal.",
        ]
      };
      setEnergyData(demoEnergy);
      
      const demoHistory = {
        history: [
          { value: 90, timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), reason: "Power Nap" },
          { value: 82, timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), reason: "Hydration Intake" },
          { value: 50, timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), reason: "High Urgency Task" },
          { value: 65, timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), reason: "Completed Assignment" },
          { value: 70, timestamp: new Date(Date.now() - 3600000 * 30).toISOString(), reason: "Brief Rest Block" }
        ],
        statistics: {
          average: 74,
          minimum: 50,
          maximum: 90,
          current: 78,
          trend: 'stable'
        },
        burnoutScore: 34,
        focusScore: 82
      };
      setHistoryData(demoHistory);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    await fetchData();
    setTimeout(() => setSyncing(false), 800);
  };

  const handleTakeRestCustom = async (hours: number, type: string) => {
    setTakingRest(true);
    setRestAction(type);
    try {
      await apiRequest('/energy/rest', {
        method: 'POST',
        body: JSON.stringify({ hours }),
      });
      await fetchData();
      
      // Update global user storage to sync with rest of layout
      const storedUser = localStorage.getItem('user');
      if (storedUser && energyData) {
        const parsed = JSON.parse(storedUser);
        if (parsed.energy) {
          parsed.energy.current = Math.min(100, parsed.energy.current + (hours * 10));
          localStorage.setItem('user', JSON.stringify(parsed));
        }
      }
    } catch (error) {
      console.error('Failed to record rest:', error);
    } finally {
      setTakingRest(false);
      setRestAction(null);
    }
  };

  const submitFeedbackSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    setFeedbackSuccess(false);
    setWarningMessage(null);

    try {
      const res = await apiRequest('/energy/feedback', {
        method: 'POST',
        body: JSON.stringify({
          taskId: simTask === 'active-patrol' ? '65f1a9a8f152d119c488abc1' : '65f1a9a8f152d119c488abc2', // Realistic Mock ObjectIDs
          mentalDrain,
          focusQuality,
          capacityForMore,
          actualDifficulty,
        }),
      });

      if (res.success) {
        setFeedbackSuccess(true);
        if (res.data.warning) {
          setWarningMessage(res.data.warning);
        }
        await fetchData();
        setTimeout(() => setFeedbackSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error('Failed to submit feedback simulation:', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8 flex flex-col items-center justify-center relative">
        {/* Dot pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
        <div className="space-y-6 text-center z-10 max-w-md w-full">
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="bg-orange-500 h-full rounded-full"
            />
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 animate-pulse">Syncing Vital Telemetry Console...</p>
        </div>
      </div>
    );
  }

  if (!energyData) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8 flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        <div className="text-center space-y-4 max-w-sm z-10 border border-zinc-900 bg-zinc-900/30 p-8 rounded-[2rem]">
          <AlertOctagon className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
          <h2 className="text-lg font-black uppercase tracking-widest text-zinc-200">Session Interface Broken</h2>
          <p className="text-xs font-mono text-zinc-500 leading-relaxed">Could not retrieve biometric energy matrices from core grid node. Please re-authenticate.</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl font-mono text-[10px] uppercase tracking-widest text-white transition-all active:scale-[0.98]"
          >
            Reconnect Terminal
          </button>
        </div>
      </div>
    );
  }

  const { energy, burnout, focus, workload, activityPatterns, trustScore, recommendations } = energyData;
  const energyPercent = (energy.current / energy.max) * 100;

  // Custom styling tokens mapped to HSL values
  const getSeverityStyle = (percent: number) => {
    if (percent >= 75) return { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-950/20', color: '#10b981', label: 'Nominal' };
    if (percent >= 45) return { text: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-950/20', color: '#f59e0b', label: 'Draining' };
    if (percent >= 25) return { text: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-950/20', color: '#f97316', label: 'Fatigued' };
    return { text: 'text-rose-500', border: 'border-rose-500/20', bg: 'bg-rose-950/20', color: '#f43f5e', label: 'Critical' };
  };

  const burnoutRiskColor = () => {
    switch (burnout.risk.toLowerCase()) {
      case 'critical': return 'text-rose-400 border-rose-500/30 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]';
      case 'high': return 'text-orange-400 border-orange-500/30 bg-orange-950/20';
      case 'medium': return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
      default: return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
    }
  };

  const currentStyle = getSeverityStyle(energyPercent);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12 relative overflow-hidden font-sans select-none">
      {/* Dynamic Swiss Grid Blueprint background */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '3rem 3rem',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(249,115,22,0.03),transparent_40%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-900">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono tracking-widest text-zinc-450 uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Operative Bio-Telemetry
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase leading-none">
              Energy <span className="text-orange-500 font-light italic">Engine</span>
            </h1>
            <p className="text-xs font-mono text-zinc-500 mt-2">PREVENT BURNOUT // MONITOR REAL-TIME PERFORMANCE CAPACITY</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="h-12 w-12 rounded-2xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 active:scale-95 transition-all flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-orange-500' : ''}`} />
            </button>
            <div className="bg-zinc-900 border border-zinc-800 px-4 rounded-2xl flex flex-col justify-center h-12 font-mono">
              <span className="text-[8px] text-zinc-500 uppercase">TELEMETRY SYNCED</span>
              <span className="text-[10px] text-zinc-300">
                {new Date(energy.lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        </header>

        {isSimulated && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-wider text-amber-400">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Offline / Simulation Mode Active — Displaying Local Biometric Telemetry Matrix</span>
            </div>
            <span className="text-zinc-500">[ API Link Unreachable ]</span>
          </div>
        )}

        {/* MAIN BLUEPRINT GRID CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: ENERGY CIRCULAR MATRIX (lg:span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-zinc-900 bg-zinc-900/10 rounded-[3rem] p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[420px]">
              
              {/* Shimmer backdrop */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-zinc-900/10 to-transparent pointer-events-none" />

              {/* Vector Dial */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Track ring */}
                  <circle
                    cx="128"
                    cy="128"
                    r="108"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    className="text-zinc-900/60"
                  />
                  {/* Progress gauge */}
                  <motion.circle
                    cx="128"
                    cy="128"
                    r="108"
                    stroke={currentStyle.color}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 108}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 108 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 108 * (1 - energyPercent / 100) }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(249,115,22,0.15)]"
                  />
                </svg>
                
                {/* Center read-out */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-[9px] text-zinc-550 uppercase tracking-[0.25em] mb-1">CAPACITY INDEX</span>
                  <div className="flex items-baseline">
                    <span className="text-6xl font-black tracking-tighter text-white">{energy.current}</span>
                    <span className="text-zinc-500 font-mono text-lg font-light">/100</span>
                  </div>
                  <span className={`text-[10px] font-mono uppercase tracking-widest mt-1.5 px-3 py-0.5 rounded border ${currentStyle.border} ${currentStyle.bg} ${currentStyle.text}`}>
                    {currentStyle.label}
                  </span>
                </div>
              </div>

              {/* Recovery Status Alert */}
              <div className="w-full mt-8 border-t border-zinc-900/60 pt-6 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Battery className="w-4 h-4 text-orange-500" />
                  <span>Optimal Loadout</span>
                </div>
                <span className="text-zinc-300 font-bold">{workload.recommended} Tasks Suggested</span>
              </div>
            </div>

            {/* QUICK ACTIONS RESTORATION CABIN */}
            <div className="border border-zinc-900 bg-zinc-900/20 rounded-[2.5rem] p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-900">
                <Coffee className="w-4 h-4 text-orange-500" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">REST SYSTEM PRESETS</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { label: "💧 Micro Hydration Break", hours: 1, restore: "+10 XP", color: "hover:border-blue-500/20 hover:bg-blue-950/10 group-hover:text-blue-400", desc: "Short fluid/breathing break.", key: "hydrate", icon: Droplet },
                  { label: "☕ Power Nap Recovery", hours: 2, restore: "+20 XP", color: "hover:border-amber-500/20 hover:bg-amber-950/10 group-hover:text-amber-400", desc: "Rapid cellular rest period.", key: "nap", icon: Coffee },
                  { label: "💤 Deep Cycle Sleep", hours: 8, restore: "+50 XP", color: "hover:border-purple-500/20 hover:bg-purple-950/10 group-hover:text-purple-400", desc: "Full cognitive repair cycle.", key: "sleep", icon: Moon },
                ].map((act) => (
                  <button
                    key={act.key}
                    onClick={() => handleTakeRestCustom(act.hours, act.key)}
                    disabled={takingRest}
                    className="group border border-zinc-900 bg-zinc-950 hover:bg-zinc-900/40 p-4 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                        <act.icon className={`h-4 w-4 text-zinc-400 transition-colors ${takingRest && restAction === act.key ? 'animate-bounce text-orange-500' : ''}`} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-200">{act.label}</p>
                        <p className="text-[9px] font-mono text-zinc-500 mt-0.5">{act.desc}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-orange-400 bg-orange-950/10 border border-orange-900/20 px-2 py-0.5 rounded">
                        {takingRest && restAction === act.key ? 'Resting...' : act.restore}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER & RIGHT METRICS TERMINAL (lg:span-8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* VITAL TELEMETRY METRIC ROW */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              <div className="border border-zinc-900 bg-zinc-900/20 p-5 rounded-2xl flex flex-col justify-between h-28">
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase">
                  <span>BURNOUT SCORE</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight">{burnout.score}<span className="text-zinc-600 font-mono text-sm">/100</span></p>
                  <p className="text-[9px] font-mono text-zinc-400 mt-1 uppercase tracking-widest">Zone: {burnout.risk}</p>
                </div>
              </div>

              <div className="border border-zinc-900 bg-zinc-900/20 p-5 rounded-2xl flex flex-col justify-between h-28">
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase">
                  <span>FOCUS RATIO</span>
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight">{focus.score}%</p>
                  <p className="text-[9px] font-mono text-zinc-400 mt-1 uppercase tracking-widest">Cognition Ready</p>
                </div>
              </div>

              <div className="border border-zinc-900 bg-zinc-900/20 p-5 rounded-2xl flex flex-col justify-between h-28">
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase">
                  <span>DAILY LOAD</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight">{activityPatterns.averageTasksPerDay.toFixed(1)}</p>
                  <p className="text-[9px] font-mono text-zinc-400 mt-1 uppercase tracking-widest">Avg Tasks/Day</p>
                </div>
              </div>

              <div className="border border-zinc-900 bg-zinc-900/20 p-5 rounded-2xl flex flex-col justify-between h-28">
                <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase">
                  <span>TRUST FACTOR</span>
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight">{trustScore}%</p>
                  <p className="text-[9px] font-mono text-zinc-400 mt-1 uppercase tracking-widest">Anti-Abuse Rating</p>
                </div>
              </div>
            </div>

            {/* DYNAMIC SHIFT FEEDBACK SIMULATOR PANEL */}
            <div className="border border-zinc-900 bg-zinc-900/10 rounded-[3rem] p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                <div className="space-y-1">
                  <h3 className="text-lg font-black uppercase tracking-wider">FATIGUE FEEDBACK SIMULATOR</h3>
                  <p className="text-[9px] font-mono text-zinc-500">SIMULATE A COMPLETED OPERATIONAL SHIFT TO ADJUST SYSTEM ENERGY DRAIN</p>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <form onSubmit={submitFeedbackSimulation} className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Select Completed Task Profile</label>
                    <select
                      value={simTask}
                      onChange={(e) => setSimTask(e.target.value)}
                      className="w-full h-11 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-zinc-300 outline-none focus:border-orange-500/50 transition-colors"
                    >
                      <option value="active-patrol">🚨 Logistics Supply Drop Shift (High Load)</option>
                      <option value="digital-strategy">💻 Crisis Comms Response (Medium Load)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Mental Drain Intensity</label>
                    <div className="grid grid-cols-5 gap-1">
                      {(['very-low', 'low', 'medium', 'high', 'very-high'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setMentalDrain(lvl)}
                          className={`py-2 text-[8px] font-bold uppercase rounded-lg border transition-all ${
                            mentalDrain === lvl
                              ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                              : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                          }`}
                        >
                          {lvl.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Quality of Cognitive Focus</label>
                    <div className="flex gap-2.5 items-center justify-between bg-zinc-950 border border-zinc-900 rounded-xl p-3.5">
                      <span className="text-zinc-500 text-[10px] uppercase">Concentration Ratio</span>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setFocusQuality(val)}
                            className={`h-7 w-7 rounded-lg border flex items-center justify-center font-bold text-[10px] transition-all ${
                              focusQuality === val
                                ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                                : 'bg-zinc-900 border-zinc-850 text-zinc-500 hover:border-zinc-800'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Capacity for Immediate Action</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['yes', 'maybe', 'no'] as const).map((ans) => (
                        <button
                          key={ans}
                          type="button"
                          onClick={() => setCapacityForMore(ans)}
                          className={`py-3 font-bold uppercase rounded-lg border transition-all ${
                            capacityForMore === ans
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                              : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                          }`}
                        >
                          {ans}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-wider">Actual Task Difficulty</label>
                    <div className="grid grid-cols-4 gap-1">
                      {(['easy', 'medium', 'hard', 'very-hard'] as const).map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setActualDifficulty(diff)}
                          className={`py-2 text-[9px] font-bold uppercase rounded-lg border transition-all ${
                            actualDifficulty === diff
                              ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                              : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:border-zinc-800'
                          }`}
                        >
                          {diff.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="w-full h-12 bg-white text-zinc-950 font-black rounded-xl uppercase tracking-widest text-[10px] transition-all hover:bg-orange-500 hover:text-white active:scale-95 flex items-center justify-center gap-2"
                    >
                      {submittingFeedback ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          PROCESING TELEMETRY...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          SUBMIT FIELD FEEDBACK
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              <AnimatePresence>
                {feedbackSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 font-mono text-[10px] flex items-center gap-3"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="font-bold">TELEMETRY FLUID LOCK: ENGAGED</p>
                      <p className="text-emerald-500/80 mt-0.5">Energy level & focus index values successfully updated in core volunteer directory.</p>
                    </div>
                  </motion.div>
                )}
                
                {warningMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 text-rose-400 font-mono text-[10px] flex items-center gap-3"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="font-bold">SYSTEM THRESHOLD EXCEEDED</p>
                      <p className="text-rose-400/85 mt-0.5">{warningMessage}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* NEURAL INTEGRATION AI RECOMMENDATIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="border border-zinc-900 bg-zinc-900/10 rounded-[2.5rem] p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-900">
                  <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">AI CLINICAL SUGGESTIONS</span>
                </div>
                <div className="space-y-2">
                  {recommendations.length > 0 ? (
                    recommendations.map((rec, idx) => (
                      <div key={idx} className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs flex items-start gap-2.5">
                        <span className="text-orange-500 font-bold shrink-0">✦</span>
                        <p className="text-zinc-350 leading-relaxed font-mono text-[11px]">{rec}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 text-xs font-mono">No operational warnings or suggestions required at this time.</p>
                  )}
                </div>
              </div>

              <div className={`border rounded-[2.5rem] p-6 space-y-4 ${burnoutRiskColor()}`}>
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-900/40">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">BURNOUT RISK MATRIX</span>
                </div>
                {burnout.factors.length > 0 ? (
                  <div className="space-y-2">
                    {burnout.factors.map((factor, idx) => (
                      <div key={idx} className="p-3 bg-zinc-950/70 border border-zinc-900/40 rounded-xl text-xs flex items-start gap-2.5">
                        <span className="text-rose-400 shrink-0">⚠️</span>
                        <p className="text-zinc-300 leading-relaxed font-mono text-[11px]">{factor}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-xs font-mono space-y-2">
                    <p className="text-emerald-400 font-bold">🎉 NO BURNOUT RISK DETECTED</p>
                    <p className="text-zinc-500 max-w-xs text-[10px] leading-relaxed">Your recovery thresholds are fully nominal. Keep balancing rest periods with active shift loads!</p>
                  </div>
                )}
              </div>
            </div>

            {/* CHRONOLOGICAL ENERGY FLUID LEDGER (7 DAYS) */}
            {historyData && (
              <div className="border border-zinc-900 bg-zinc-900/10 rounded-[3rem] p-8 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wider">7-DAY TELEMETRY HISTOGRAM</h3>
                    <p className="text-[9px] font-mono text-zinc-500 mt-0.5">CHRONOLOGICAL HISTORICAL TELEMETRY LOGS</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[8px] text-zinc-500 uppercase block">7-DAY AVERAGE</span>
                    <span className="text-lg font-black text-orange-400">{historyData.statistics.average}%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {historyData.history.slice(-5).reverse().map((entry: any, index: number) => {
                    const date = new Date(entry.timestamp);
                    const isRest = entry.reason.toLowerCase().includes('rest') || entry.reason.toLowerCase().includes('hydration') || entry.reason.toLowerCase().includes('nap') || entry.reason.toLowerCase().includes('sleep');
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-900 rounded-xl font-mono text-xs">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            isRest ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-rose-950/20 border-rose-900/30 text-rose-400'
                          }`}>
                            {isRest ? <Coffee className="h-3.5 w-3.5" /> : <Activity className="h-3.5 w-3.5" />}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-200 text-[11px] max-w-sm truncate uppercase">{entry.reason}</p>
                            <p className="text-[9px] text-zinc-550 mt-0.5">
                              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3 shrink-0">
                          <span className={`text-[10px] font-bold ${entry.value >= 70 ? 'text-emerald-400' : entry.value >= 40 ? 'text-amber-400' : 'text-rose-500'}`}>
                            {entry.value}% CAP
                          </span>
                          <div className="w-16 bg-zinc-900 rounded-full h-1 overflow-hidden">
                            <div className={`h-full ${entry.value >= 70 ? 'bg-emerald-400' : entry.value >= 40 ? 'bg-amber-400' : 'bg-rose-500'}`} style={{ width: `${entry.value}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyDashboardPage;
