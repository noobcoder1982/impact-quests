import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Add01Icon as Plus,
  SentIcon as Send,
  HelpCircleIcon as HelpCircle,
  UserGroupIcon as Users,
  CheckmarkCircle01Icon as CheckCircle2,
  FlashIcon as Zap,
  DocumentCodeIcon as FileText,
  AnalyticsUpIcon as TrendingUp,
  ArrowUpRight01Icon as ArrowUpRight,
  More02Icon as MoreVertical,
  Activity01Icon as ActivityIcon,
  Notification01Icon as Bell,
  Time01Icon as Clock,
  Calendar01Icon as CalendarIcon,
  FilterIcon as Filter,
  More01Icon as MoreHorizontal,
  ArrowRight01Icon as ChevronRight,
  ArrowLeft01Icon as ChevronLeft,
  Tick01Icon as Check,
  Target01Icon as Target,
  Shield01Icon as Shield,
  FavouriteIcon as Heart,
  SparklesIcon as Sparkles,
  ArrowRight01Icon as ArrowRight,
  ShoppingBasket01Icon as ShoppingBag,
  DashboardCircleIcon as LayoutIcon,
  GridIcon,
  Layers01Icon as LayersIcon,
  Search01Icon as Search,
  Comment01Icon as MessageSquare,
  UserAdd01Icon as UserPlus,
  ArrowDown01Icon as ChevronDown,
  Maximize01Icon as Maximize2,
  Menu01Icon as List,
  CommandIcon,
  Settings01Icon as Settings,
  CpuIcon as Cpu
} from "hugeicons-react"
import { Button } from "./ui/button"
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler"
import { cn } from "@/lib/utils"
import { apiRequest } from "../lib/api"
import TacticalDashboardIntel from "./TacticalDashboardIntel"
import MobileDashboard from "./MobileDashboard"

type LayoutMode = 'overview' | 'focus' | 'grid' | 'activity' | 'compact'

const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
}

const graphData = {
  Realtime: Array(24).fill(0),
  Periodic: Array(7).fill(0),
  Quarterly: Array(12).fill(0),
  Annual: Array(6).fill(0)
}

const labels = {
  Realtime: Array.from({length: 24}).map((_, i) => `${i}:00`),
  Periodic: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  Quarterly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  Annual: ['2021', '2022', '2023', '2024', '2025', '2026']
}

const dummyTasks: any[] = []

export default function DashboardPage() {
  const [user, setUser] = React.useState<any>(null)
  const [layoutMode, setLayoutMode] = React.useState<LayoutMode>('overview')
  const [showLayoutMenu, setShowLayoutMenu] = React.useState(false)
  const [selectedPeriod, setSelectedPeriod] = React.useState<keyof typeof graphData>('Quarterly')
  const [showNotifications, setShowNotifications] = React.useState(false)
  
  // Calendar Logic
  const now = new Date()
  const [currentMonth, setCurrentMonth] = React.useState(now.getMonth())
  const [currentYear, setCurrentYear] = React.useState(now.getFullYear())
  const [selectedDate, setSelectedDate] = React.useState<number>(now.getDate())

  const [tasks, setTasks] = React.useState<any[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = React.useState(true)

  const fetchTasks = React.useCallback(async () => {
    try {
      setIsLoadingTasks(true)
      const res = await apiRequest('/tasks')
      if (res.success) {
        setTasks(res.data)
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err)
    } finally {
      setIsLoadingTasks(false)
    }
  }, [])

  React.useEffect(() => {
    const fetchData = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      setUser(storedUser)
      try {
        const profileRes = await apiRequest('/auth/me')
        if (profileRes.success) {
          setUser(profileRes.data.user)
          localStorage.setItem('user', JSON.stringify(profileRes.data.user))
        }
      } catch (err) {}
    }
    fetchData()
    fetchTasks()
  }, [])

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentYear, currentMonth + offset, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear);
  
  const prevMonthPadding = Array.from({ length: firstDay }, (_, i) => prevMonthDays - firstDay + i + 1);
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const nextMonthPaddingCount = 42 - (prevMonthPadding.length + currentMonthDays.length);
  const nextMonthPadding = Array.from({ length: nextMonthPaddingCount }, (_, i) => i + 1);

  const handleLayoutChange = (mode: LayoutMode) => {
    setLayoutMode(mode)
    setShowLayoutMenu(false)
  }

  // --- SUB-RENDERERS ---

  const [weather, setWeather] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchWeather = async () => {
      const CACHE_KEY = 'tactical_weather';
      const CACHE_TIME = 15 * 60 * 1000; // Reduced to 15 mins for testing
      const cached = localStorage.getItem(CACHE_KEY);
      
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TIME) {
          setWeather(data);
          return;
        }
      }

      try {
        const API_KEY = '[REDACTED]';
        let lat = 51.5074, lon = -0.1278; // Default: London Hub
        
        // Wrap Geolocation in a faster promise
        const getPosition = () => new Promise<GeolocationPosition>((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 });
        });

        try {
          const pos = await getPosition();
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
          console.log("Location acquired:", lat, lon);
        } catch (geoErr) {
          console.warn("Location denied or timed out, using fallback hub.");
        }

        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        
        if (res.status === 401) {
          console.error("Weather API key not yet active. Falling back to default data.");
          setWeather({ temp: 10, status: 'Clear', city: 'Mission Hub', aqi: 75 });
          return;
        }

        const data = await res.json();
        if (data.main) {
          const weatherData = {
            temp: Math.round(data.main.temp),
            status: data.weather[0].main,
            city: data.name,
            aqi: 75
          };
          setWeather(weatherData);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: weatherData, timestamp: Date.now() }));
        }
      } catch (err) {
        console.error("Tactical weather failed:", err);
        setWeather({ temp: '--', status: 'Standby', city: 'Unknown Sector', aqi: 0 });
      }
    };
    fetchWeather();
  }, []);

  const [isScheduling, setIsScheduling] = React.useState(false)
  const [taskForm, setTaskForm] = React.useState({
    title: '',
    category: 'General',
    startTime: '10:00',
    endTime: '11:30',
    description: ''
  })

  const handleSchedule = async () => {
    try {
      const taskData = {
        ...taskForm,
        date: new Date(currentYear, currentMonth, selectedDate),
        status: 'Open'
      };
      const res = await apiRequest('/tasks', {
        method: 'POST',
        body: taskData
      })
      if (res.success) {
        setIsScheduling(false)
        setTaskForm({ title: '', category: 'General', startTime: '10:00', endTime: '11:30', description: '' })
        alert("Mission created successfully. View in Mission Board.")
      }
    } catch (err: any) {
      console.error("Failed to create mission", err)
      alert(err.message || "Mission creation failed.")
    }
  }

  const IntelligenceWidget = () => {
    const timeOfDay = now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening";
    return (
      <motion.div {...fadeInUp} className="bg-card border border-border/50 rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-10 shadow-xl relative overflow-hidden group mb-8 md:mb-12">
         <div className="relative z-10 space-y-5 md:space-y-8">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight text-foreground">Welcome back, {user?.name || 'User'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
               <div className="space-y-6">
                  {/* Clock Card */}
                  <div className="bg-secondary/40 border border-border/50 rounded-3xl p-5 md:p-8 space-y-2">
                     <p className="text-2xl md:text-3xl font-black tracking-tighter text-foreground">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                     <p className="text-xs font-medium text-muted-foreground">{now.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}</p>
                  </div>
                  {/* Reminder Card */}
                  <div className="bg-secondary/40 border border-border/50 rounded-3xl p-5 md:p-8 flex items-center gap-4">
                     <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                     <p className="text-[11px] font-medium text-muted-foreground">Next scheduled activity today at <span className="text-foreground font-bold">08:30 PM</span></p>
                  </div>
               </div>

               {/* Weather Card */}
               <div className="bg-secondary/40 border border-border/50 rounded-3xl p-5 md:p-8 flex justify-between items-center relative overflow-hidden">
                  <div className="space-y-4">
                     <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-amber-400 rounded-full blur-md absolute -top-2 -left-2 opacity-20" />
                        <span className="text-3xl font-black tracking-tighter relative z-10 text-foreground">{weather?.status || 'Loading...'} {weather?.temp ?? '--'}°</span>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Location: {weather?.city || 'Detecting...'}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">AQI {weather?.aqi || 75} (Healthy)</p>
                     </div>
                  </div>
                  <div className="h-24 w-24 relative">
                     <div className="absolute inset-0 bg-amber-400 rounded-full blur-2xl opacity-10 animate-pulse" />
                     <div className={cn(
                       "h-full w-full rounded-full shadow-xl shadow-amber-500/20 bg-gradient-to-br",
                       weather?.status === 'Rain' ? 'from-blue-400 to-indigo-600' : 
                       weather?.status === 'Clouds' ? 'from-slate-400 to-slate-600' : 'from-amber-400 to-orange-500'
                     )} />
                  </div>
               </div>
            </div>
         </div>
      </motion.div>
    )
  }

  const renderOverview = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <IntelligenceWidget />
      <TacticalDashboardIntel />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
        {/* Main Impact Card */}
        <motion.div {...fadeInUp} className="bg-card border border-border rounded-[3.5rem] p-12 shadow-xl relative overflow-visible group">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <ActivityIcon className="h-64 w-64 text-indigo-600" />
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <ActivityIcon className="h-4.5 w-4.5 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold">Global Operational Grid</h3>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-7xl font-black tracking-tighter text-foreground italic">{(user?.points || 0).toLocaleString()}<span className="text-3xl text-muted-foreground/20 ml-2 not-italic"> UPLINK</span></span>
                <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/10 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live Telemetry
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 items-center bg-secondary/30 p-1.5 rounded-full border border-border mt-4 md:mt-0">
               {['ALL SECTORS', 'CRITICAL ONLY'].map((tab) => (
                 <button 
                    key={tab} 
                    className={cn(
                      "px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all",
                      tab === 'ALL SECTORS' ? 'bg-foreground text-background shadow-lg' : 'text-muted-foreground hover:text-foreground'
                    )}
                 >
                   {tab}
                 </button>
               ))}
            </div>
          </div>
          
          {/* Tactical Grid Visualization */}
          <div className="h-[200px] md:h-[280px] w-full grid grid-cols-6 md:grid-cols-12 gap-1.5 md:gap-2 mt-6 md:mt-8 relative z-10">
             {Array.from({ length: 48 }).map((_, i) => {
                const isCrit = Math.random() > 0.92;
                const isActive = Math.random() > 0.4;
                const activityLevel = Math.random(); // 0 to 1
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.015 }}
                    className={cn(
                      "rounded-2xl flex flex-col items-center justify-center gap-1.5 border transition-all duration-300 hover:scale-[1.15] cursor-crosshair relative group/cell",
                      isCrit ? "bg-rose-500/10 border-rose-500/40 hover:bg-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.15)] hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] z-20" :
                      isActive ? "bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-400/50 hover:bg-indigo-500/20 hover:z-20" : 
                      "bg-secondary/20 border-border/40 hover:bg-secondary/50 hover:z-20"
                    )}
                  >
                     {isCrit && <div className="absolute inset-0 bg-rose-500/10 animate-pulse rounded-2xl" />}
                     
                     <div className={cn("h-1.5 w-1.5 rounded-full z-10", isCrit ? "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,1)]" : isActive ? "bg-indigo-400" : "bg-muted-foreground/30")} 
                          style={{ opacity: isCrit ? 1 : 0.3 + activityLevel * 0.7 }} />
                     
                     <span className={cn(
                       "text-[8px] font-black uppercase tracking-widest z-10 transition-colors",
                       isCrit ? "text-rose-300" : isActive ? "text-indigo-400/80" : "text-muted-foreground/50"
                     )}>
                       S-{i.toString().padStart(2, '0')}
                     </span>

                     {/* Hover Tooltip */}
                     <div className="absolute opacity-0 group-hover/cell:opacity-100 transition-opacity bottom-full mb-3 bg-zinc-950 border border-white/10 text-white px-4 py-2.5 rounded-xl whitespace-nowrap shadow-2xl pointer-events-none flex flex-col gap-1 items-center">
                        <span className="font-bold text-xs">Sector {i.toString().padStart(2, '0')} Uplink</span>
                        <span className={cn("text-[9px] uppercase font-black tracking-widest", isCrit ? "text-rose-400" : isActive ? "text-emerald-400" : "text-muted-foreground")}>
                          {isCrit ? "CRITICAL ALERT ACTIVE" : isActive ? "NOMINAL OPERATION" : "STANDBY MODE"}
                        </span>
                     </div>
                  </motion.div>
                )
             })}
          </div>
        </motion.div>

        {/* Right Panel: Calendar */}
        <motion.div {...fadeInUp} transition={{delay: 0.1}} className="bg-card/40 border border-border rounded-[2.5rem] p-8 shadow-2xl flex flex-col gap-8">
          <div className="flex justify-between items-center px-2">
            <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} className="h-10 w-10 rounded-xl hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 transition-all"><ChevronLeft className="h-5 w-5" /></Button>
            <div className="text-center">
              <h3 className="text-lg font-bold tracking-tight">{monthNames[currentMonth]}, {currentYear}</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} className="h-10 w-10 rounded-xl hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 transition-all"><ChevronRight className="h-5 w-5" /></Button>
          </div>
          
          <div className="grid grid-cols-7 gap-y-6 text-center font-mono">
             {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map((d) => (
               <div key={d} className="text-[10px] font-black text-muted-foreground/30 tracking-widest">{d}</div>
             ))}
             <AnimatePresence mode="wait">
               <motion.div 
                 key={`${currentMonth}-${currentYear}`} 
                 initial={{ opacity: 0, y: 10 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 exit={{ opacity: 0, y: -10 }} 
                 className="col-span-7 grid grid-cols-7 gap-y-4"
               >
                  {prevMonthPadding.map((d, i) => <div key={`prev-${i}`} className="h-11 w-11 mx-auto flex items-center justify-center text-sm font-medium text-muted-foreground/10">{d}</div>)}
                  {currentMonthDays.map((d) => (
                    <div 
                      key={d} 
                      onClick={() => setSelectedDate(d)}
                      className={cn(
                        "h-11 w-11 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all relative group cursor-pointer",
                        d === selectedDate 
                          ? "bg-emerald-500 text-slate-900 font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
                          : "hover:bg-emerald-500/10 text-foreground/80 hover:text-emerald-500"
                      )}
                    >
                      {d}
                      {(d === 7 || d === 31) && (
                         <div className="absolute top-2 right-2 h-1 w-1 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,1)]" />
                      )}
                    </div>
                  ))}
                  {nextMonthPadding.map((d, i) => <div key={`next-${i}`} className="h-11 w-11 mx-auto flex items-center justify-center text-sm font-medium text-muted-foreground/10">{d}</div>)}
               </motion.div>
             </AnimatePresence>
          </div>

          {/* Intelligence Card */}
          <motion.div 
            layout
            className="bg-secondary/20 border border-border/40 rounded-3xl p-6 space-y-4"
          >
             <div className="flex items-center gap-3 text-emerald-500">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-xs font-bold tracking-tight">{selectedDate} {monthNames[currentMonth]}, {currentYear}</span>
             </div>
             
             <div className="space-y-3">
                {(() => {
                  const dayTasks = tasks.filter(t => {
                    const tDate = new Date(t.date);
                    return tDate.getDate() === selectedDate && 
                           tDate.getMonth() === currentMonth && 
                           tDate.getFullYear() === currentYear;
                  });

                  if (dayTasks.length > 0) {
                    return dayTasks.map((t, i) => (
                      <div key={i} className="bg-background/40 p-3 rounded-2xl border border-border/40 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t.category}</span>
                          <span className="text-[9px] text-muted-foreground font-bold">{t.startTime} - {t.endTime}</span>
                        </div>
                        <p className="text-sm font-bold truncate">{t.title}</p>
                      </div>
                    ));
                  }

                  return (
                    <p className="text-[11px] text-muted-foreground/80 leading-relaxed italic">
                       {selectedDate === now.getDate() && currentMonth === now.getMonth() 
                         ? "Today is a good day, like every other day! Enjoy your time." 
                         : "Standby for mission directives on this date. Calibration required."}
                    </p>
                  );
                })()}
             </div>
          </motion.div>

          <Button 
            onClick={() => setIsScheduling(true)}
            className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-white text-slate-900 transition-all text-xs font-black uppercase tracking-widest gap-3 group shadow-xl shadow-emerald-500/10"
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" /> Create Mission
          </Button>
        </motion.div>
      </div>

      {/* --- SCHEDULING MODAL --- */}
      <AnimatePresence>
         {isScheduling && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-10 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsScheduling(false)}
                className="absolute inset-0 bg-background/80 backdrop-blur-md pointer-events-auto"
              />
              <motion.div 
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.9 }}
                className="w-full max-w-xl bg-card border border-border rounded-[2rem] md:rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col pointer-events-auto p-6 md:p-10 space-y-6 md:space-y-8 max-h-[90vh] overflow-y-auto"
              >
                 <div className="flex justify-between items-center">
                    <div>
                       <h2 className="text-3xl font-black tracking-tighter text-emerald-500">Mission Details</h2>
                       <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40 mt-1">Creating mission for {selectedDate} {monthNames[currentMonth]}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsScheduling(false)} className="rounded-full hover:bg-secondary">
                       <Plus className="h-6 w-6 rotate-45" />
                    </Button>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Mission Title</label>
                       <input 
                         value={taskForm.title}
                         onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                         className="w-full h-16 bg-secondary/30 border border-border rounded-2xl px-6 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                         placeholder="e.g. Supply Chain Refresh..."
                       />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Mission Category</label>
                        <select 
                          value={taskForm.category}
                          onChange={(e) => setTaskForm({...taskForm, category: e.target.value})}
                          className="w-full h-16 bg-secondary/30 border border-border rounded-2xl px-6 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer"
                        >
                           {['General', 'Emergency Response', 'Rescue Mission', 'Medical Camp', 'Food Drive', 'Donation Pickup', 'Volunteer Training', 'Shelter Support', 'Awareness Campaign', 'Admin Work', 'Community Visit'].map(cat => (
                             <option key={cat} value={cat} className="bg-card text-foreground">{cat}</option>
                           ))}
                        </select>
                     </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Start Time</label>
                          <input 
                            type="time"
                            value={taskForm.startTime}
                            onChange={(e) => setTaskForm({...taskForm, startTime: e.target.value})}
                            className="w-full h-14 bg-secondary/30 border border-border rounded-2xl px-6 font-bold focus:outline-none"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">End Time</label>
                          <input 
                            type="time"
                            value={taskForm.endTime}
                            onChange={(e) => setTaskForm({...taskForm, endTime: e.target.value})}
                            className="w-full h-14 bg-secondary/30 border border-border rounded-2xl px-6 font-bold focus:outline-none"
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Objective Description</label>
                       <textarea 
                         value={taskForm.description}
                         onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                         className="w-full h-24 bg-secondary/30 border border-border rounded-2xl p-6 font-medium focus:outline-none resize-none"
                         placeholder="Operational details..."
                       />
                    </div>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <Button onClick={() => setIsScheduling(false)} variant="ghost" className="flex-1 h-16 rounded-2xl text-[10px] font-black uppercase tracking-widest">Abort</Button>
                    <Button 
                      onClick={handleSchedule}
                      className="flex-[2] h-16 rounded-2xl bg-emerald-500 text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20"
                    >
                       Confirm Deployment
                    </Button>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Bottom Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
         <div className="bg-card border border-border rounded-[3rem] p-8 space-y-6">
            <div className="flex items-center gap-3">
               <ActivityIcon className="h-5 w-5 text-emerald-500" />
               <h4 className="font-bold">Recent Impact</h4>
            </div>
            <div className="space-y-4">
               {user?.recentImpact?.length > 0 ? (
                 user.recentImpact.map((i: any) => (
                  <div key={i.id} className="flex gap-4 items-center">
                     <div className="h-10 w-10 rounded-2xl bg-secondary/60 flex items-center justify-center font-bold text-xs">+{i.xp}</div>
                     <div>
                        <p className="text-xs font-bold">{i.label}</p>
                        <p className="text-[10px] text-muted-foreground/60">{i.time}</p>
                     </div>
                  </div>
                 ))
               ) : (
                 <div className="py-10 text-center opacity-20">
                    <ActivityIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest italic">No impact detected</p>
                 </div>
               )}
            </div>
         </div>
         <div className="bg-card border border-border rounded-[3rem] p-8 space-y-6">
            <div className="flex items-center gap-3">
               <Sparkles className="h-5 w-5 text-indigo-500" />
               <h4 className="font-bold">Smart Matches</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">Complete onboarding and select skills to receive personalized mission directives.</p>
            <Button variant="outline" className="w-full h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary" onClick={() => window.location.href='/onboarding'}>Initialize Skills</Button>
         </div>
         <div className="bg-card border border-border rounded-[3rem] p-8 space-y-6 bg-indigo-600 text-white shadow-xl shadow-indigo-600/20">
            <h4 className="font-bold text-xl">Level {Math.floor((user?.points || 0) / 1000) + 1} Reached</h4>
            <div className="space-y-2">
               <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest opacity-60">
                  <span>Progress to Next Tier</span>
                  <span>{((user?.points || 0) % 1000) / 10}%</span>
               </div>
               <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white" style={{ width: `${((user?.points || 0) % 1000) / 10}%` }} />
               </div>
            </div>
            <p className="text-xs font-medium opacity-80">Initial rank assigned. Start contributing to climb the leaderboard.</p>
         </div>
      </div>
    </div>
  )

  const renderFocus = () => (
    <div className="h-[80vh] grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 animate-in fade-in zoom-in-95 duration-1000 items-center">
      <div className="relative h-full flex flex-col justify-center">
        <div className="absolute inset-0 bg-indigo-600/5 blur-[40px] rounded-full animate-pulse pointer-events-none" />
        <motion.div 
          {...fadeInUp} 
          className="bg-card/40 backdrop-blur-md border border-white/10 rounded-[4rem] p-16 shadow-2xl relative z-10 space-y-12 ring-1 ring-white/10"
        >
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-3xl bg-indigo-600 text-white flex items-center justify-center shadow-[0_0_12px_rgba(79,70,229,0.4)]">
               <Zap className="h-10 w-10 fill-current" />
            </div>
            <div>
               <div className="px-4 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2 inline-block">Active Directive</div>
               <h2 className="text-5xl font-black tracking-tighter">Clean Water Initiative</h2>
            </div>
          </div>

          <p className="text-xl text-muted-foreground/80 leading-relaxed font-medium">
            Maintain high-precision logistics flow for the current sector assignment. 
            <span className="text-indigo-600 font-bold block mt-2">Primary Objective: Secure Asset Distribution.</span>
          </p>
          
          <div className="space-y-4 pt-6 border-t border-white/5">
             <div className="flex justify-between text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.4em]">
                <span>Logistics Completion</span>
                <span>84.2%</span>
             </div>
             <div className="h-4 w-full bg-secondary/50 rounded-full overflow-hidden p-1.5 shadow-inner border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '84.2%' }}
                  className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.6)]" 
                />
             </div>
          </div>

          <div className="flex gap-6 pt-4">
             <Button className="flex-1 h-18 rounded-3xl bg-indigo-600 hover:bg-slate-900 text-white font-black text-lg shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 uppercase tracking-widest">Execute Shift</Button>
             <Button variant="outline" className="h-18 w-18 rounded-3xl border-white/10 hover:bg-white/5 backdrop-blur-md"><Search className="h-7 w-7" /></Button>
          </div>
        </motion.div>
      </div>

      {/* Focus Sidebar: Operational Telemetry */}
      <motion.div 
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8 h-full flex flex-col justify-center"
      >
         <div className="bg-card/30 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-10 space-y-10 shadow-xl ring-1 ring-white/5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Live Telemetry</h3>
            {[
              { label: "Signal Strength", val: "98.4%", color: "text-emerald-500" },
              { label: "Asset Velocity", val: "12 units/h", color: "text-indigo-400" },
              { label: "Local Latency", val: "24ms", color: "text-blue-400" },
              { label: "System Load", val: "Nominal", color: "text-slate-400" },
            ].map(stat => (
              <div key={stat.label} className="space-y-2 group cursor-default">
                 <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 leading-none group-hover:text-white/50 transition-colors">{stat.label}</p>
                 <div className={cn("text-3xl font-black tracking-tighter", stat.color)}>{stat.val}</div>
              </div>
            ))}
         </div>
         <Button variant="ghost" className="h-14 rounded-2xl border border-dashed border-white/10 text-muted-foreground/40 text-[10px] uppercase font-black tracking-[0.4em] hover:bg-white/5 hover:text-indigo-400">Abort Operation</Button>
      </motion.div>
    </div>
  )

  const renderCompact = () => (
    <div className="animate-in fade-in zoom-in-95 duration-700 space-y-10">
      {/* Tactical Header Bar */}
      <div className="flex items-center justify-between bg-card/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-xl ring-1 ring-white/5">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 border-r border-white/10 pr-8">
               <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
               <span className="text-[11px] font-black uppercase tracking-widest leading-none">System Grid Active</span>
            </div>
            <div className="flex gap-4">
               {[1, 2, 3].map(i => <div key={i} className="h-2 w-8 bg-indigo-500/20 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-1/2" /></div>)}
            </div>
         </div>
         <div className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">HID (High Information Density) Layout Enabled</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {dummyTasks.concat(dummyTasks).slice(0, 12).map((task, i) => (
            <motion.div 
               key={i} 
               {...fadeInUp}
               transition={{ delay: i * 0.02 }}
               className="bg-card/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 hover:bg-indigo-600/5 hover:border-indigo-500/30 transition-all cursor-pointer group shadow-sm ring-1 ring-white/5"
            >
               <div className="flex justify-between items-start mb-6">
                  <div className="h-10 w-10 rounded-2xl bg-secondary/50 group-hover:bg-indigo-600 transition-all duration-500 flex items-center justify-center shrink-0">
                     <Cpu className="h-5 w-5 text-muted-foreground group-hover:text-white" />
                  </div>
                  <div className="text-right">
                     <span className="text-[11px] font-black text-indigo-500 block leading-none">+{task.xp} XP</span>
                     <span className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-tighter">Yield</span>
                  </div>
               </div>
               <h5 className="text-sm font-bold text-foreground leading-[1.3] truncate mb-2">{task.title}</h5>
               <div className="flex items-center gap-2">
                  <div className="flex-1 h-[2px] bg-secondary/60 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-500/40 w-1/3" />
                  </div>
                  <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">{task.status}</span>
               </div>
            </motion.div>
         ))}
      </div>
    </div>
  )

  const renderGrid = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
         <div className="space-y-2">
            <h2 className="text-3xl font-bold">Opportunity Explorer</h2>
            <p className="text-sm text-muted-foreground">Discover and join community initiatives based on your skills.</p>
         </div>
         <div className="flex bg-secondary/40 p-2 rounded-2xl border border-border items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 border-r border-border/40">
               <Filter className="h-4 w-4 text-muted-foreground" />
               <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Filters</span>
            </div>
            {['All', 'Active', 'Social', 'High XP'].map(f => (
              <button key={f} className={cn("px-5 py-2 rounded-xl text-[11px] font-bold transition-all", f === 'All' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                {f}
              </button>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {dummyTasks.map((task, i) => (
           <motion.div 
            key={task.id} 
            {...fadeInUp}
            transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-[3rem] p-8 group hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-600/5 transition-all cursor-pointer relative overflow-hidden"
          >
             <div className="flex justify-between items-start mb-10">
                <div className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest", 
                  task.difficulty === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-500'
                )}>
                  {task.difficulty} Complexity
                </div>
                <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                   <Maximize2 className="h-4 w-4" />
                </div>
             </div>
             <h4 className="text-xl font-bold text-foreground mb-4 group-hover:translate-x-1 transition-transform">{task.title}</h4>
             <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/40">
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">Reward Pool</span>
                   <span className="text-base font-black text-indigo-600">+{task.xp} XP</span>
                </div>
                <Button className="h-10 px-5 rounded-full bg-secondary/50 group-hover:bg-indigo-600 group-hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">Commit</Button>
             </div>
           </motion.div>
         ))}
      </div>
    </div>
  )

  const renderActivity = () => (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="space-y-8">
         <h2 className="text-3xl font-bold px-4">Activity Stream</h2>
         <div className="space-y-6 relative pl-10">
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-500/40 via-indigo-500/10 to-transparent" />
            {[
              { type: 'Task', name: 'Water Logistics Completed', time: '12m ago', val: '+450 XP', color: 'bg-emerald-500' },
              { type: 'Level', name: 'Advanced Contributor Status', time: '2h ago', val: 'New Badge', color: 'bg-indigo-600' },
              { type: 'Chat', name: 'Marcus Chen sent a message', time: '5h ago', val: 'Unread', color: 'bg-blue-500' },
              { type: 'System', name: 'Night Shift Data Sync', time: '1d ago', val: 'Stable', color: 'bg-slate-400' },
            ].map((act, i) => (
              <motion.div 
                key={i} 
                {...fadeInUp}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-[2.5rem] p-7 flex items-center gap-6 relative shadow-sm group hover:shadow-lg transition-all"
              >
                 <div className={cn("absolute -left-8 h-4 w-4 rounded-full border-4 border-background z-20", act.color)} />
                 <div className="h-12 w-12 rounded-2xl bg-secondary/60 flex items-center justify-center shrink-0">
                    <ActivityIcon className="h-5 w-5 text-muted-foreground" />
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">{act.type}</span>
                       <span className="text-[10px] font-bold text-muted-foreground/60">{act.time}</span>
                    </div>
                    <p className="text-base font-bold text-foreground">{act.name}</p>
                 </div>
                 <div className="px-4 py-2 rounded-2xl bg-secondary/40 text-xs font-black uppercase text-foreground">
                    {act.val}
                 </div>
              </motion.div>
            ))}
         </div>
      </div>
      <div className="space-y-8">
         <h2 className="text-3xl font-bold">Insights</h2>
         <div className="bg-card border border-border rounded-[3.5rem] p-10 space-y-12 shadow-sm">
            {[
              { label: "Completion Rate", val: "94%", trend: "up" },
              { label: "Community Rank", val: "#12", trend: "up" },
              { label: "Active Connections", val: "48", trend: "stable" }
            ].map(stat => (
              <div key={stat.label} className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 leading-none">{stat.label}</p>
                 <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-black text-foreground">{stat.val}</span>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Mobile-only purpose-built UI ── */}
      <MobileDashboard />

      {/* ── Desktop UI (md and above) — completely unchanged ── */}
    <div className="hidden md:flex flex-1 bg-background font-body overflow-y-auto transition-colors duration-500 selection:bg-indigo-500/10 h-full scrollbar-hide py-6 md:py-10 px-4 md:px-8">
      <main className="max-w-[1700px] mx-auto space-y-8 md:space-y-12 pb-32">
        
        {/* Header Protocol */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
           <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500/60 leading-none">Status: Primary Hub Optimized</span>
              </div>
              <h1 className="text-3xl md:text-6xl font-bold tracking-tighter text-foreground">
                Dashboard <span className="font-display italic font-medium text-indigo-600 underline decoration-indigo-500/30 underline-offset-8">Overview</span>
              </h1>
              <p className="hidden md:block text-muted-foreground/60 text-sm font-medium tracking-tight">Managing community impact and volunteer logistics through high-fidelity oversight.</p>
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto relative">
              {/* LAYOUT SELECTOR ▾ */}
              <div className="relative">
                <Button 
                  onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                  className="h-14 px-8 rounded-3xl bg-slate-900 hover:bg-black text-white font-bold gap-4 shadow-2xl shadow-slate-900/20 active:scale-95 transition-all min-w-[180px] justify-between"
                >
                   <div className="flex items-center gap-3">
                      <LayoutIcon className="h-5 w-5 text-indigo-400" />
                      <span className="text-sm font-black uppercase tracking-widest">Layout</span>
                   </div>
                   <ChevronDown className={cn("h-5 w-5 transition-transform duration-500", showLayoutMenu && "rotate-180")} />
                </Button>

                <AnimatePresence>
                  {showLayoutMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute right-0 top-full mt-4 w-[280px] rounded-[2.5rem] shadow-[0_30px_90px_-15px_rgba(0,0,0,0.6)] z-[100] p-4 flex flex-col gap-2 border border-white/20 overflow-hidden"
                      style={{ 
                        backgroundColor: "rgba(255, 255, 255, 0.03)", 
                        backdropFilter: "blur(12px) saturate(180%)",
                        WebkitBackdropFilter: "blur(12px) saturate(180%)"
                      }}
                    >
                       {[
                         { id: 'overview', icon: CommandIcon, label: 'Overview Mode', sub: 'Standard' },
                         { id: 'focus', icon: Maximize2, label: 'Focus Mode', sub: 'Deep Work' },
                         { id: 'grid', icon: GridIcon, label: 'Grid Mode', sub: 'Discovery' },
                         { id: 'activity', icon: List, label: 'Activity Mode', sub: 'Timeline' },
                         { id: 'compact', icon: LayersIcon, label: 'Compact Mode', sub: 'Density' },
                       ].map((opt) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              handleLayoutChange(opt.id as LayoutMode);
                              setShowLayoutMenu(false);
                            }}
                            className={cn(
                              "w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all group relative overflow-hidden",
                              layoutMode === opt.id ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "hover:bg-white/10 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <opt.icon className="h-5 w-5 shrink-0" />
                            <div>
                               <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{opt.label}</p>
                               <p className="text-[9px] font-medium opacity-60 italic">{opt.sub}</p>
                            </div>
                         </button>
                       ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="hidden md:block h-10 w-[1px] bg-border/40" />

              <div className="flex items-center gap-3 bg-secondary/30 p-2 border border-border/50 rounded-3xl shadow-inner relative ml-auto">
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="h-12 w-12 flex items-center justify-center rounded-2xl hover:bg-card transition-all relative group shadow-sm bg-background border border-border/60"
                  >
                      <Bell className="h-5 w-5 text-muted-foreground group-hover:text-indigo-600" />
                      <span className="absolute top-3 right-3 h-2 w-2 bg-rose-500 rounded-full border-2 border-background" />
                  </button>
                  
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        className="absolute right-0 mt-4 w-80 rounded-[2.5rem] shadow-[0_30px_90px_-15px_rgba(0,0,0,0.6)] z-[100] p-8 space-y-6 border border-white/20 overflow-hidden"
                        style={{ 
                          backgroundColor: "rgba(255, 255, 255, 0.03)", 
                          backdropFilter: "blur(12px) saturate(180%)",
                          WebkitBackdropFilter: "blur(12px) saturate(180%)"
                        }}
                      >
                         <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Inbox Signals</span>
                            <span className="text-[10px] text-indigo-400 font-bold cursor-pointer hover:underline">Clear Signals</span>
                         </div>
                         <div className="space-y-4">
                            <div className="flex gap-4 p-3 hover:bg-white/10 rounded-2xl transition-colors cursor-pointer group">
                               <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                </div>
                               <div>
                                  <p className="text-xs font-bold text-foreground">Initiative Approved</p>
                                  <p className="text-[10px] text-muted-foreground/60">Sector 4 deployment validated.</p>
                               </div>
                            </div>
                            <div className="flex gap-4 p-3 hover:bg-white/10 rounded-2xl transition-colors cursor-pointer group">
                               <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/10">
                                  <MessageSquare className="h-5 w-5 text-indigo-400" />
                               </div>
                               <div>
                                  <p className="text-xs font-bold text-foreground">New Signal</p>
                                  <p className="text-[10px] text-muted-foreground/60">Coordinated logs for Sector 7.</p>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatedThemeToggler className="h-12 w-12 rounded-2xl bg-background border border-border/60 shadow-sm" />
              </div>
           </div>
        </div>

        {/* Dynamic Layout Engine */}
        <div className="min-h-screen">
          <AnimatePresence mode="wait">
            {layoutMode === 'overview' && <motion.div key="overview" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>{renderOverview()}</motion.div>}
            {layoutMode === 'focus' && <motion.div key="focus" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>{renderFocus()}</motion.div>}
            {layoutMode === 'grid' && <motion.div key="grid" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>{renderGrid()}</motion.div>}
            {layoutMode === 'activity' && <motion.div key="activity" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>{renderActivity()}</motion.div>}
            {layoutMode === 'compact' && <motion.div key="compact" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>{renderCompact()}</motion.div>}
          </AnimatePresence>
        </div>

      </main>
    </div>
    </>
  )
}
