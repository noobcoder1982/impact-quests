import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowRight,
  Search,
  Check,
  User,
  Zap,
  Award,
  Sparkles,
  RotateCw,
  Plus,
  Compass
} from "lucide-react"
import { Button } from "./ui/button"
import { apiRequest } from "../lib/api"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

interface Skill {
  _id: string;
  name: string;
  category: string;
}

const VOLUNTEER_SKILLS = [
  "Teaching & Mentoring", "Community Outreach", "Event Management", "Fundraising",
  "Public Speaking", "Leadership", "Team Coordination", "Administration",
  "Volunteer Coordination", "Healthcare Assistance", "Mental Health Support", "Child Welfare",
  "Elderly Care", "Animal Welfare", "Environmental Conservation", "Disaster Relief",
  "Food Distribution", "Logistics Support", "Counseling", "Conflict Resolution",
  "Social Work", "Advocacy & Awareness", "Cultural Programs", "Sports & Recreation",
  "Photography", "Videography", "Graphic Design", "Content Writing",
  "Translation & Interpretation", "Research & Documentation", "Legal Assistance", "Finance & Accounting",
  "Human Resources", "Training & Workshops", "Hospitality & Guest Support", "Crowd Management",
  "Emergency Response", "Sustainability Initiatives", "Partnership & Networking", "Creative Arts & Crafts",
  "Music & Performance Arts", "Project Coordination", "Communication & PR", "Women Empowerment",
  "Youth Development", "Rural Development", "Accessibility Support", "Community Health",
  "Relief Camp Support", "General Volunteering"
];

export default function OnboardingPage() {
  const [step, setStep] = React.useState(1);
  const [skills, setSkills] = React.useState<Skill[]>(() => 
    VOLUNTEER_SKILLS.map((name, idx) => ({
      _id: `predefined-${idx}`,
      name,
      category: "Volunteer Management"
    }))
  );
  const [suggestedSkills, setSuggestedSkills] = React.useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [nickname, setNickname] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [customSkill, setCustomSkill] = React.useState("");
  const navigate = useNavigate();

  // Shuffle 10 random skills from the pre-defined list
  const shuffleSuggestions = React.useCallback(() => {
    const shuffled = [...VOLUNTEER_SKILLS].sort(() => 0.5 - Math.random());
    setSuggestedSkills(shuffled.slice(0, 10));
  }, []);

  React.useEffect(() => {
    shuffleSuggestions();
  }, [shuffleSuggestions]);

  // Fetch additional skills from the backend and merge them cleanly
  React.useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await apiRequest('/skills');
        if (res.success && res.data.skills.length > 0) {
          const fetched = res.data.skills;
          setSkills(prev => {
            const existingNames = new Set(prev.map(s => s.name.toLowerCase()));
            const uniqueFetched = fetched.filter((s: Skill) => !existingNames.has(s.name.toLowerCase()));
            return [...prev, ...uniqueFetched];
          });
        }
      } catch (err) {
        console.error("Failed to fetch skills", err);
      }
    };
    fetchSkills();
  }, []);

  const toggleSkill = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    } else if (selectedSkills.length < 5) {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim()) && selectedSkills.length < 5) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const generateNickname = () => {
    if (selectedSkills.length === 0) return "Operator_Node";
    const prefix = selectedSkills[0].replace(/\s+/g, '');
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}_${suffix}`;
  };

  const handleNextStep = () => {
    if (step === 2) {
      setNickname(generateNickname());
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest('/auth/complete-onboarding', {
        method: 'POST',
        body: JSON.stringify({
          nickname,
          selectedSkills
        })
      });

      if (res.success) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.nickname = nickname;
        user.selectedSkills = selectedSkills;
        user.isOnboarded = true;
        localStorage.setItem('user', JSON.stringify(user));
        
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error("Onboarding failed", err);
      // Fallback for local testing/mock accounts so they never get stuck
      if (!(import.meta.env.PROD || window.location.search.includes('prod-preview'))) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.nickname = nickname;
        user.selectedSkills = selectedSkills;
        user.isOnboarded = true;
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = '/dashboard';
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter skills based on search query
  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-600/30 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Cinematic Background Grid */}
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #4f46e5 1.5px, transparent 0)`, backgroundSize: '36px 36px' }} />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full" />

      <div className="max-w-3xl w-full relative z-10">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: INITIALIZED CALIBRATION */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card bg-white/[0.02] border border-white/[0.08] backdrop-blur-2xl rounded-[2.5rem] p-10 md:p-14 text-center space-y-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)]"
            >
              <div className="inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Calibration Node Active
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-white">
                Welcome to the <br/> <span className="text-indigo-500 italic font-black">ImpactQuest</span> network.
              </h1>
              <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto font-medium leading-relaxed">
                Before deploying operator commands, we need to calibrate your custom specialties and establish your tactical identity on the grid.
              </p>
              <div className="pt-4">
                <Button 
                  onClick={() => setStep(2)}
                  className="h-18 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-base font-black tracking-wider gap-3 hover:scale-[1.02] active:scale-98 transition-all shadow-xl shadow-indigo-600/20"
                >
                  Begin Calibration <ArrowRight size={18} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DEFINE SPECIALTIES */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card bg-white/[0.02] border border-white/[0.08] backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 space-y-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)]"
            >
              {/* Refreshed Step Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/[0.05] pb-6">
                <div className="space-y-1.5">
                  <div className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">Calibration Node / Step 02 of 03</div>
                  <h2 className="text-4xl font-black tracking-tight text-white">Define your <span className="text-indigo-500 italic">specialties.</span></h2>
                  <p className="text-white/40 text-sm font-medium">Select up to 5 areas of expertise you wish to contribute to.</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-3 text-center min-w-[100px]">
                  <div className="text-3xl font-black text-indigo-400">{selectedSkills.length}<span className="text-white/20">/5</span></div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-white/40 mt-0.5">Selected</div>
                </div>
              </div>

              {/* Real-time Chosen Chips */}
              <div className="flex flex-wrap gap-2.5 min-h-[44px]">
                {selectedSkills.map(skill => (
                  <motion.button
                    layoutId={`selected-skill-${skill}`}
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className="px-4.5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/10 group"
                  >
                    {skill} <Check size={13} className="opacity-80" />
                  </motion.button>
                ))}
                {selectedSkills.length === 0 && (
                  <div className="text-white/20 text-xs font-bold italic py-2">No specialties locked in yet...</div>
                )}
              </div>

              {/* Dynamic Search & Input Wrapper */}
              <div className="space-y-6">
                
                {/* Search Field */}
                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search volunteer database (e.g. Disaster Relief, Public Speaking, Community Outreach)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-15 bg-white/[0.03] border border-white/[0.08] rounded-2xl pl-13 pr-6 text-sm font-semibold outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20 text-white"
                  />
                </div>

                {/* Grid of Results / Predefined Suggestions */}
                <div className="space-y-4">
                  
                  {/* CASE 1: Searching inside the Database */}
                  {searchQuery.trim().length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Search Results</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredSkills.slice(0, 24).map(skill => {
                          const isSelected = selectedSkills.includes(skill.name);
                          return (
                            <button
                              key={skill._id}
                              onClick={() => toggleSkill(skill.name)}
                              disabled={selectedSkills.length >= 5 && !isSelected}
                              className={cn(
                                "p-3 rounded-xl border text-left text-xs font-bold transition-all relative overflow-hidden group/btn",
                                isSelected 
                                  ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-400" 
                                  : "bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.05] hover:text-white hover:border-white/20 disabled:opacity-30"
                              )}
                            >
                              <div className="truncate pr-4">{skill.name}</div>
                              {isSelected && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3">
                                  <Check size={12} className="text-indigo-400" />
                                </motion.div>
                              )}
                            </button>
                          );
                        })}
                        {filteredSkills.length === 0 && (
                          <div className="col-span-full text-center text-white/30 text-xs font-bold italic py-6">
                            No matching specialties found. Type in "Other specialty" below to add a custom one!
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // CASE 2: Showing 10 Random Quick Suggestions
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                          <Sparkles size={12} /> Suggested Specialties
                        </div>
                        <button
                          type="button"
                          onClick={shuffleSuggestions}
                          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/30 hover:text-white transition-all bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1.5 active:scale-95"
                        >
                          <RotateCw size={10} /> Shuffle Suggestions
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {suggestedSkills.map(skillName => {
                          const isSelected = selectedSkills.includes(skillName);
                          return (
                            <button
                              type="button"
                              key={skillName}
                              onClick={() => toggleSkill(skillName)}
                              disabled={selectedSkills.length >= 5 && !isSelected}
                              className={cn(
                                "p-3 rounded-xl border text-left text-xs font-bold transition-all relative group/pill truncate",
                                isSelected 
                                  ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-400 shadow-md shadow-indigo-600/5" 
                                  : "bg-white/[0.02] border-white/[0.06] text-white/50 hover:bg-white/[0.05] hover:text-white hover:border-white/20 disabled:opacity-30"
                              )}
                            >
                              <div className="truncate pr-4">{skillName}</div>
                              {isSelected && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3">
                                  <Check size={12} className="text-indigo-400" />
                                </motion.div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Custom Skill Input */}
                  <div className="pt-6 border-t border-white/[0.05] space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Or lock in a custom specialty</div>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="Other custom specialty..."
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                        className="flex-1 h-12 bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 text-xs font-semibold outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20 text-white"
                      />
                      <button 
                        type="button"
                        onClick={handleAddCustomSkill}
                        disabled={!customSkill.trim() || selectedSkills.length >= 5}
                        className="h-12 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none transition-all text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-white/[0.05]"
                      >
                        <Plus size={14} /> Add Custom
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Navigation */}
              <div className="flex justify-between pt-6 border-t border-white/[0.05]">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(1)} 
                  className="h-13 px-6 rounded-xl text-white/40 hover:text-white uppercase text-[10px] font-black tracking-widest"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={selectedSkills.length === 0}
                  className="h-13 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-indigo-600/10 hover:scale-[1.02] active:scale-98 transition-all"
                >
                  Lock in specialties <ArrowRight size={14} />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: ESTABLISH ALIAS */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="glass-card bg-white/[0.02] border border-white/[0.08] backdrop-blur-2xl rounded-[2.5rem] p-10 md:p-12 space-y-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)]"
            >
              <div className="text-center space-y-3">
                <div className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em]">Calibration Node / Final Calibration</div>
                <h2 className="text-4xl font-black tracking-tight text-white">Establish your <span className="text-indigo-500 italic">alias.</span></h2>
                <p className="text-white/40 text-sm font-medium max-w-md mx-auto">Choose a tactical nickname that will identify your operator node on the grid.</p>
              </div>

              <div className="max-w-md mx-auto space-y-6">
                
                {/* Nickname Capsule */}
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={22} />
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full h-20 bg-white/[0.03] border border-white/[0.08] rounded-2xl pl-16 pr-6 text-2xl font-black tracking-tight text-indigo-400 outline-none focus:border-indigo-500/50 transition-all text-center focus:shadow-md focus:shadow-indigo-600/5"
                  />
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-black border border-white/[0.08] rounded-full text-[8px] font-black uppercase tracking-widest text-white/40">Codename</div>
                </div>

                {/* Summary Matrix */}
                <div className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.06] space-y-5">
                  <div className="text-[9px] font-black uppercase tracking-widest text-white/30 text-center">Locked Specialties Matrix</div>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {selectedSkills.map(s => (
                      <span key={s} className="px-3 py-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold">{s}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.03] text-center">
                      <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-0.5">Tactical Rank</div>
                      <div className="text-base font-black text-indigo-400 italic">Novice</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.03] text-center">
                      <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-0.5">Node Score</div>
                      <div className="text-base font-black text-white italic">0.00</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit / Finish buttons */}
              <div className="flex flex-col items-center gap-4 pt-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={!nickname.trim() || isSubmitting}
                  className="h-16 px-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-base font-black tracking-wider gap-3 shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-98 transition-all"
                >
                  {isSubmitting ? 'Syncing Profile...' : 'Lock Profile & Deploy'} <Award size={18} />
                </Button>
                <button 
                  type="button"
                  onClick={() => setStep(2)} 
                  className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-indigo-400 transition-colors"
                >
                  Recalibrate specialties
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.4);
          border-radius: 8px;
        }
      `}</style>
    </div>
  )
}
