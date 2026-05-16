import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowRight01Icon as ArrowRight,
  Search01Icon as Search,
  Tick01Icon as Check,
  UserIcon as User,
  FlashIcon as Zap,
  Compass01Icon as Compass,
  AiChat01Icon as Bot,
  Award01Icon as Medal
} from "hugeicons-react"
import { Button } from "./ui/button"
import { apiRequest } from "../lib/api"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

interface Skill {
  _id: string;
  name: string;
  category: string;
}

export default function OnboardingPage() {
  const [step, setStep] = React.useState(1);
  const [skills, setSkills] = React.useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [nickname, setNickname] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [customSkill, setCustomSkill] = React.useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await apiRequest('/skills');
        if (res.success) {
          setSkills(res.data.skills);
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
    if (selectedSkills.length === 0) return "Anonymous_Operator";
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
        // Update local storage user data
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.nickname = nickname;
        user.selectedSkills = selectedSkills;
        user.isOnboarded = true;
        localStorage.setItem('user', JSON.stringify(user));
        
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error("Onboarding failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSkills = skills.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-600/30 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #312e81 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-600/10 blur-[200px] rounded-full animate-pulse" />

      <div className="max-w-4xl w-full relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-500 text-[10px] font-black uppercase tracking-[0.4em]">
                <Zap size={14} /> System Initialized
              </div>
              <h1 className="text-7xl font-black tracking-tighter lowercase leading-tight">
                welcome to the <br/> <span className="text-indigo-600 italic">impactquest</span> network.
              </h1>
              <p className="text-xl text-white/40 max-w-2xl mx-auto italic leading-relaxed">
                "You have successfully registered your operator node. Before deployment, we need to calibrate your profile and identify your tactical specialties."
              </p>
              <Button 
                onClick={() => setStep(2)}
                className="h-20 px-12 rounded-[2rem] bg-indigo-600 text-white text-xl font-black tracking-widest gap-4 hover:scale-105 transition-all shadow-2xl shadow-indigo-600/20"
              >
                begin calibration <ArrowRight size={20} />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <div className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.4em]">Step 02 / 03</div>
                  <h2 className="text-5xl font-black tracking-tighter lowercase">define your <span className="text-indigo-600 italic">skillset.</span></h2>
                  <p className="text-white/40 italic">Select up to 5 tactical specialties from the database.</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black text-indigo-600">{selectedSkills.length}<span className="text-white/20">/5</span></div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20">Selected</div>
                </div>
              </div>

              {/* Skill Search & Selection */}
              <div className="space-y-6">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search tactical database (e.g. Python, Crisis Management)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-20 bg-white/5 border border-white/10 rounded-[1.5rem] pl-16 pr-8 text-lg font-bold outline-none focus:border-indigo-600/50 transition-all placeholder:text-white/10"
                  />
                </div>

                {/* Selected Tags */}
                <div className="flex flex-wrap gap-3">
                  {selectedSkills.map(skill => (
                    <motion.button
                      layoutId={`skill-${skill}`}
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-black flex items-center gap-3 shadow-lg shadow-indigo-600/20 group"
                    >
                      {skill} <Check size={14} className="opacity-60" />
                    </motion.button>
                  ))}
                  {selectedSkills.length === 0 && (
                    <div className="text-white/10 text-sm font-bold italic py-3">No skills selected yet...</div>
                  )}
                </div>

                <div className="h-[350px] overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredSkills.map(skill => (
                      <button
                        key={skill._id}
                        onClick={() => toggleSkill(skill.name)}
                        disabled={selectedSkills.length >= 5 && !selectedSkills.includes(skill.name)}
                        className={cn(
                          "p-4 rounded-2xl border text-left transition-all group relative overflow-hidden",
                          selectedSkills.includes(skill.name) 
                            ? "bg-indigo-600/20 border-indigo-600/50 text-indigo-500" 
                            : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/20 disabled:opacity-30"
                        )}
                      >
                        <div className="font-bold tracking-tight">{skill.name}</div>
                        {selectedSkills.includes(skill.name) && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2">
                            <Check size={12} className="text-indigo-500" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Skill Input */}
                  <div className="pt-6 border-t border-white/5">
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="Other specialty..."
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                        className="flex-1 h-14 bg-white/5 border border-white/10 rounded-xl px-6 text-sm font-bold outline-none focus:border-indigo-600/50 transition-all"
                      />
                      <Button 
                        variant="secondary" 
                        onClick={handleAddCustomSkill}
                        className="h-14 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest"
                      >
                        Add Custom
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-8">
                <Button variant="ghost" onClick={() => setStep(1)} className="h-16 px-8 rounded-2xl text-white/40 hover:text-white uppercase text-[10px] font-black tracking-widest">Back</Button>
                <Button 
                  onClick={handleNextStep}
                  disabled={selectedSkills.length === 0}
                  className="h-16 px-12 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest gap-3 shadow-lg shadow-indigo-600/20"
                >
                  Confirm specialties <ArrowRight size={16} />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-12"
            >
              <div className="space-y-4">
                <div className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.4em]">Final Step / Neural Link</div>
                <h2 className="text-6xl font-black tracking-tighter lowercase">establish your <span className="text-indigo-600 italic">alias.</span></h2>
                <p className="text-white/40 italic">"In the interest of operational security, your real name is private. Choose your network handle."</p>
              </div>

              <div className="max-w-md mx-auto space-y-8">
                <div className="relative group">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-[2rem] pl-20 pr-8 text-3xl font-black tracking-tighter text-indigo-500 outline-none focus:border-indigo-600/50 transition-all text-center"
                  />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-black border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-white/40">Network handle</div>
                </div>

                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 space-y-6">
                  <div className="text-[9px] font-black uppercase tracking-widest text-white/30">Calibration Summary</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedSkills.map(s => (
                      <span key={s} className="px-3 py-1 rounded-full bg-indigo-600/10 border border-indigo-600/20 text-indigo-500 text-[10px] font-bold">{s}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                      <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">Impact Quotient</div>
                      <div className="text-xl font-black italic">0.00</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                      <div className="text-[8px] font-black uppercase tracking-widest text-white/20 mb-1">System Rank</div>
                      <div className="text-xl font-black italic text-indigo-600">Novice</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-6">
                <Button 
                  onClick={handleSubmit}
                  disabled={!nickname || isSubmitting}
                  className="h-24 px-16 rounded-[2.5rem] bg-indigo-600 text-white text-2xl font-black tracking-[0.2em] gap-6 shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all lowercase"
                >
                  {isSubmitting ? 'Synchronizing...' : 'Deploy to Network'} <Medal size={24} />
                </Button>
                <button onClick={() => setStep(2)} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-indigo-600 transition-colors">Recalibrate Specialties</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.4);
        }
      `}</style>
    </div>
  )
}
