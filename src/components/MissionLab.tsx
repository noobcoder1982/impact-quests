import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Target01Icon as Target, ZapIcon as Zap, CpuIcon as Cpu, DocumentCodeIcon as FileText, Shield02Icon as Shield, AlertCircleIcon as Alert, Tick01Icon as Check, FlashIcon as Flash, Search01Icon as Search, Upload01Icon as Upload } from 'hugeicons-react'
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { apiRequest } from "../lib/api"

import { useLocation } from "react-router-dom"

export default function MissionLab() {
  const location = useLocation()
  const [description, setDescription] = React.useState("")
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [analysis, setAnalysis] = React.useState<any>(null)
  const [isDeploying, setIsDeploying] = React.useState(false)
  const [manualLocation, setManualLocation] = React.useState("")
  const [durationHours, setDurationHours] = React.useState(4)
  const [activeTasks, setActiveTasks] = React.useState<any[]>([])
  
  const [isParsing, setIsParsing] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Handle auto-fill from chat
  React.useEffect(() => {
    if (location.state?.autoFill) {
      setDescription(location.state.autoFill)
      // Trigger analysis after a short delay to ensure description state is updated
      setTimeout(() => {
        handleAnalyzeDirectly(location.state.autoFill)
      }, 500)
    }
  }, [location.state])

  const handleAnalyzeDirectly = async (text: string) => {
    if (!text.trim()) return
    setIsAnalyzing(true)
    try {
      const res = await apiRequest('/ai/analyze', {
        method: 'POST',
        body: { description: text }
      })
      if (res.success) {
        setAnalysis(res.data)
        setDurationHours(res.data.estimated_duration_hours || 4)
      }
    } catch (err) {
      console.error("AI Analysis failed", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await apiRequest('/ai/parse-document', {
        method: 'POST',
        body: formData
      });
      
      if (res.success) {
        setAnalysis(res.intelligence);
        setDescription("Document Successfully Parsed. Mission Auto-Generated.");
        // Refresh tasks
        const taskRes = await apiRequest('/tasks');
        if (taskRes.success) setActiveTasks(taskRes.data.filter((t: any) => t.expiresAt));
      }
    } catch (err) {
      console.error("Document upload failed", err);
      alert("Error parsing document");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Fetch active tasks for the countdown timers
  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await apiRequest('/tasks');
        if (res.success) {
          setActiveTasks(res.data.filter((t: any) => t.expiresAt));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchTasks();
    const interval = setInterval(fetchTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  // Live timer effect
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = async () => {
    if (!description.trim()) return
    setIsAnalyzing(true)
    try {
      const res = await apiRequest('/ai/analyze', {
        method: 'POST',
        body: { description }
      })
      if (res.success) {
        setAnalysis(res.data)
        setDurationHours(res.data.estimated_duration_hours || 4)
        if (!res.data.location) {
          setManualLocation("")
        }
      }
    } catch (err) {
      console.error("AI Analysis failed", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDeploy = async () => {
    if (!description.trim()) return
    setIsDeploying(true)
    try {
      const res = await apiRequest('/ai/generate-mission', {
        method: 'POST',
        body: { 
          description, 
          source: 'Mission Intelligence Lab',
          manualLocation: manualLocation.trim() || undefined,
          durationHours
        }
      })
      if (res.success) {
        setAnalysis(null)
        setDescription("")
        setManualLocation("")
        alert("Strategic Mission Deployed Successfully")
        // Refresh tasks
        const taskRes = await apiRequest('/tasks');
        if (taskRes.success) setActiveTasks(taskRes.data.filter((t: any) => t.expiresAt));
      }
    } catch (err) {
      console.error("Deployment failed", err)
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background font-body text-foreground pb-32 selection:bg-indigo-500/10 h-screen scrollbar-hide">
      <div className="max-w-6xl mx-auto p-10 space-y-12 pt-20">
        
        {/* Header Section */}
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Cpu className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Neural Integration Active</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter leading-none">Mission <span className="text-muted-foreground/20">Lab</span></h1>
            <p className="text-muted-foreground/60 mt-4 text-lg font-medium max-w-xl">Convert raw crisis intelligence into strategic operational blueprints using advanced neural synthesis.</p>
          </div>
          <div className="flex gap-4 mb-2">
            <div className="px-6 py-4 rounded-3xl bg-card border border-border shadow-sm text-center min-w-[140px]">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">AI Engine</p>
              <p className="text-sm font-black uppercase tracking-widest text-emerald-500">NVIDIA NIM</p>
            </div>
            <div className="px-6 py-4 rounded-3xl bg-card border border-border shadow-sm text-center min-w-[140px]">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Status</p>
              <p className="text-sm font-black uppercase tracking-widest text-indigo-600">Optimal</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Intelligence Input */}
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-600/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FileText className="h-32 w-32 rotate-12" />
               </div>
               
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center">
                        <Zap className="h-4 w-4 text-indigo-600" />
                     </div>
                     <h3 className="text-lg font-black tracking-tight uppercase">Neural Input</h3>
                  </div>

                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the crisis incident in detail (e.g., 'Flash flood reported in Sector Alpha. 20 families stranded on rooftops near the bridge. Immediate rescue and medical assistance required.')"
                    className="w-full h-64 bg-background/50 border border-border rounded-3xl p-6 text-sm font-medium focus:ring-2 focus:ring-indigo-600/20 transition-all resize-none outline-none placeholder:text-muted-foreground/30"
                  />

                  <div className="flex gap-4">
                     <Button 
                       onClick={handleAnalyze}
                       disabled={isAnalyzing || isParsing || !description.trim()}
                       className="flex-1 h-16 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                     >
                        {isAnalyzing ? "Scanning via Neural Net..." : "Analyze Intelligence"}
                     </Button>
                     
                     <input 
                       type="file" 
                       ref={fileInputRef} 
                       onChange={handleFileUpload} 
                       className="hidden" 
                       accept=".pdf,.doc,.docx,.txt" 
                     />
                     
                     <Button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isParsing}
                        variant="outline" 
                        className={cn(
                          "h-16 w-16 rounded-2xl border-border hover:bg-secondary transition-all",
                          isParsing && "opacity-50 animate-pulse"
                        )}
                     >
                        <Upload className="h-6 w-6" />
                     </Button>
                  </div>
               </div>
            </div>

            {/* Quick Templates */}
            <div className="grid grid-cols-3 gap-4">
               {['Medical Emergency', 'Resource Shortage', 'Search & Rescue'].map(label => (
                 <button 
                  key={label}
                  onClick={() => setDescription(`URGENT: ${label} reported in Sector Gamma. Multiple casualties suspected. Deployment required.`)}
                  className="p-4 rounded-2xl bg-card border border-border hover:border-indigo-600/50 hover:bg-indigo-600/5 transition-all text-left group"
                 >
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 group-hover:text-indigo-600 transition-colors mb-1">Template</p>
                    <p className="text-[10px] font-black uppercase tracking-tight">{label}</p>
                 </button>
               ))}
            </div>
          </div>

          {/* AI Synthesis Output */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {!analysis ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[500px] border-2 border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 space-y-6"
                >
                   <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center animate-pulse">
                      <Target className="h-10 w-10 text-muted-foreground/20" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-black tracking-tight uppercase text-muted-foreground/40">Awaiting Data</h3>
                      <p className="text-sm font-medium text-muted-foreground/30 max-w-[280px]">Input tactical data to begin AI-powered mission synthesis and resource allocation.</p>
                   </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  {/* Analysis Card */}
                  <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl space-y-10 border border-white/5 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                     
                     <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                              <Shield className="h-4 w-4" />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Intelligence Briefing</span>
                        </div>
                        <div className={cn(
                          "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                          analysis.urgency === 'Critical' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-900'
                        )}>
                          {analysis.urgency} Urgency
                        </div>
                     </div>

                     <div className="space-y-8 relative z-10">
                        <div className="grid grid-cols-2 gap-8">
                           <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Operation Category</p>
                              <p className="text-2xl font-black uppercase tracking-tighter">{analysis.category}</p>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Target Population</p>
                              <p className="text-2xl font-black uppercase tracking-tighter">{analysis.people_count} Specialists</p>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Neural Summary</p>
                           <p className="text-lg font-medium leading-relaxed opacity-80 italic italic-font">"{analysis.understood_reasoning}"</p>
                        </div>

                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                           <div className="flex items-center gap-2">
                              <Cpu className="h-3 w-3 text-indigo-400" />
                              <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Thought Process Trace</p>
                           </div>
                           <p className="text-xs font-medium leading-relaxed text-white/60 line-clamp-4">{analysis.thought_process}</p>
                        </div>

                        {/* Location & Time Configurator */}
                        <div className="space-y-6 pt-4 border-t border-white/10">
                           {analysis.location ? (
                             <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                               <MapPin className="h-5 w-5 text-emerald-500" />
                               <div>
                                 <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Location Synced</p>
                                 <p className="text-sm font-bold">{analysis.location}</p>
                               </div>
                             </div>
                           ) : (
                             <div className="space-y-2">
                               <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Location Missing - Manual Input Required</p>
                               <input 
                                 type="text" 
                                 value={manualLocation}
                                 onChange={e => setManualLocation(e.target.value)}
                                 placeholder="Enter exact address or coordinates..."
                                 className="w-full bg-black/40 border border-rose-500/30 rounded-xl px-4 py-3 text-sm focus:border-rose-500 outline-none transition-colors"
                               />
                             </div>
                           )}

                           <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Mission Duration (Hours)</p>
                                <span className="text-xl font-black text-indigo-400">{durationHours}h</span>
                              </div>
                              <input 
                                type="range" 
                                min="1" max="48" step="1"
                                value={durationHours}
                                onChange={e => setDurationHours(parseInt(e.target.value))}
                                className="w-full accent-indigo-500 h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                              />
                              <div className="flex justify-between text-[8px] uppercase tracking-widest text-white/30 font-bold">
                                <span>1h</span>
                                <span>24h</span>
                                <span>48h</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="pt-4 relative z-10">
                        <Button 
                          onClick={handleDeploy}
                          disabled={isDeploying}
                          className="w-full h-18 rounded-3xl bg-indigo-600 hover:bg-white hover:text-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-indigo-600/40"
                        >
                           {isDeploying ? "Deploying..." : "Initialize Tactical Deployment"}
                        </Button>
                     </div>
                  </div>

                  {/* Operational Readiness Check */}
                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-6 rounded-[2rem] bg-card border border-border flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                           <Check className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Resource Availability</p>
                           <p className="text-xs font-black uppercase">Sufficient Units</p>
                        </div>
                     </div>
                     <div className="p-6 rounded-[2rem] bg-card border border-border flex items-center gap-4">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600">
                           <Flash className="h-5 w-5" />
                        </div>
                        <div>
                           <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Neural Sync</p>
                           <p className="text-xs font-black uppercase">Synchronized</p>
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Live Active Missions Countdown */}
        {activeTasks.length > 0 && (
          <div className="pt-16 space-y-8">
            <h2 className="text-2xl font-black tracking-tight uppercase border-b border-border/40 pb-4">Live Mission Chronometers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {activeTasks.map(task => {
                 const expiresAt = new Date(task.expiresAt).getTime();
                 const timeLeft = Math.max(0, expiresAt - now);
                 const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                 const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                 const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                 const isExpiring = timeLeft < 3600000; // less than 1 hour

                 return (
                   <div key={task._id} className={cn(
                     "relative overflow-hidden rounded-[2rem] p-6 border shadow-xl transition-all",
                     isExpiring ? "bg-rose-500/5 border-rose-500/30" : "bg-card border-border"
                   )}>
                     <div className="flex justify-between items-start mb-4 relative z-10">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                          task.priority === 'Critical' ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'
                        )}>{task.priority}</span>
                        {isExpiring && <Alert className="h-4 w-4 text-rose-500 animate-pulse" />}
                     </div>
                     <p className="text-sm font-bold leading-tight mb-6 relative z-10">{task.title}</p>
                     
                     <div className="flex items-center gap-4 relative z-10">
                        <div className="h-12 w-12 rounded-xl bg-background flex items-center justify-center border border-border">
                           <Flash className={cn("h-5 w-5", isExpiring ? "text-rose-500" : "text-indigo-500")} />
                        </div>
                        <div>
                           <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50 mb-0.5">Time Remaining</p>
                           <p className={cn("text-2xl font-black tracking-tighter tabular-nums", isExpiring ? "text-rose-500" : "text-foreground")}>
                             {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                           </p>
                        </div>
                     </div>

                     {/* Progress bar background */}
                     <div className="absolute bottom-0 left-0 h-1 bg-secondary w-full">
                       <motion.div 
                         className={cn("h-full", isExpiring ? "bg-rose-500" : "bg-indigo-500")}
                         initial={{ width: '100%' }}
                         animate={{ width: `${(timeLeft / (task.durationHours * 60 * 60 * 1000)) * 100}%` }}
                         transition={{ ease: "linear" }}
                       />
                     </div>
                   </div>
                 );
               })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
