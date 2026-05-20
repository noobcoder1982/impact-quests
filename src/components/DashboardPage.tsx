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

  interface Widget {
    id: string;
    size: 'small' | 'medium_h' | 'medium_v' | 'large';
    visible: boolean;
  }

  const DEFAULT_WIDGETS: Widget[] = [
    { id: 'welcome', size: 'medium_h', visible: true },
    { id: 'tactical_intel', size: 'large', visible: true },
    { id: 'grid_viz', size: 'large', visible: true },
    { id: 'calendar', size: 'medium_v', visible: true },
    { id: 'agenda', size: 'medium_h', visible: true },
    { id: 'progression', size: 'small', visible: true },
    { id: 'recent_impact', size: 'medium_h', visible: true },
    { id: 'smart_matches', size: 'medium_h', visible: true },
    { id: 'diagnostics', size: 'small', visible: true }
  ];

  const [widgets, setWidgets] = React.useState<Widget[]>(() => {
    const cached = localStorage.getItem('dashboard_widgets_order_v2');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return DEFAULT_WIDGETS;
      }
    }
    return DEFAULT_WIDGETS;
  });

  const [isCustomizing, setIsCustomizing] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);

  const handleStartCustomizing = () => {
    setIsCustomizing(true);
  };

  const handleSaveCustomizing = () => {
    localStorage.setItem('dashboard_widgets_order_v2', JSON.stringify(widgets));
    setIsCustomizing(false);
    setHasUnsavedChanges(false);
  };

  const handleCancelCustomizing = () => {
    const cached = localStorage.getItem('dashboard_widgets_order_v2');
    if (cached) {
      try {
        setWidgets(JSON.parse(cached));
      } catch (e) {
        setWidgets(DEFAULT_WIDGETS);
      }
    } else {
      setWidgets(DEFAULT_WIDGETS);
    }
    setIsCustomizing(false);
    setHasUnsavedChanges(false);
  };

  const handleResetBento = () => {
    setWidgets(DEFAULT_WIDGETS);
    setHasUnsavedChanges(true);
  };

  const saveWidgets = (newWidgets: Widget[]) => {
    setWidgets(newWidgets);
    setHasUnsavedChanges(true);
  };

  const cycleWidgetSize = (id: string) => {
    const sizes: ('small' | 'medium_h' | 'medium_v' | 'large')[] = ['small', 'medium_h', 'medium_v', 'large'];
    const updated = widgets.map(w => {
      if (w.id === id) {
        const nextIdx = (sizes.indexOf(w.size) + 1) % sizes.length;
        return { ...w, size: sizes[nextIdx] };
      }
      return w;
    });
    saveWidgets(updated);
  };

  const toggleWidgetVisibility = (id: string) => {
    const updated = widgets.map(w => {
      if (w.id === id) {
        return { ...w, visible: !w.visible };
      }
      return w;
    });
    saveWidgets(updated);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const sourceIdx = widgets.findIndex(w => w.id === draggedId);
    const targetIdx = widgets.findIndex(w => w.id === targetId);

    if (sourceIdx !== -1 && targetIdx !== -1) {
      const updated = [...widgets];
      const [removed] = updated.splice(sourceIdx, 1);
      updated.splice(targetIdx, 0, removed);
      saveWidgets(updated);
    }
    setDraggedId(null);
    setDragOverId(null);
  };

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

  const [time, setTime] = React.useState(new Date())
  const [directive, setDirective] = React.useState<any>(null)
  const [readiness, setReadiness] = React.useState<any>({ percentage: 85, criticalTasks: 0, totalTasks: 12 })

  const fetchIntel = React.useCallback(async () => {
    try {
      const res = await apiRequest('/ai/dashboard-intelligence')
      if (res.success) {
        setDirective(res.data)
      }
    } catch (err) {
      console.error("AI directive fetch failed", err)
    }
  }, [])

  React.useEffect(() => {
    fetchIntel()
  }, [fetchIntel])

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  React.useEffect(() => {
    if (tasks.length > 0) {
      const total = tasks.length
      const ready = tasks.filter((t: any) => t.status === 'In Progress' || t.status === 'Completed').length
      const critical = tasks.filter((t: any) => t.priority === 'Critical' && t.status === 'Open').length
      setReadiness({
        percentage: total > 0 ? Math.round((ready / total) * 100) : 100,
        criticalTasks: critical,
        totalTasks: total
      })
    } else {
      setReadiness({ percentage: 100, criticalTasks: 0, totalTasks: 0 })
    }
  }, [tasks])

  // --- SECTORS STATE FOR INTERACTIVE OPERATION & DISPATCH MONITOR ---
  const [sectors, setSectors] = React.useState([
    { id: 'sec-1', name: 'Master Canteen Hub', category: 'Healthcare', volunteers: 9, coverage: 65, urgency: 'Medium', latency: '4 min' },
    { id: 'sec-2', name: 'Patia Sector', category: 'Education', volunteers: 22, coverage: 88, urgency: 'Low', latency: '12 min' },
    { id: 'sec-3', name: 'Old Town Relief', category: 'Disaster Relief', volunteers: 8, coverage: 35, urgency: 'Critical', latency: '2 min' },
    { id: 'sec-4', name: 'Salia Sahi Literacy', category: 'Education', volunteers: 38, coverage: 94, urgency: 'Optimal', latency: '18 min' },
    { id: 'sec-5', name: 'Unit-8 Camp', category: 'Healthcare', volunteers: 4, coverage: 50, urgency: 'High', latency: '5 min' },
    { id: 'sec-6', name: 'Kuakhai Rescue', category: 'Disaster Relief', volunteers: 15, coverage: 72, urgency: 'High', latency: '8 min' }
  ]);
  const [selectedSectorId, setSelectedSectorId] = React.useState('sec-3');
  const [activeToast, setActiveToast] = React.useState<{ message: string; sector: string } | null>(null);

  const handleDispatchSector = (id: string) => {
    setSectors(prev => prev.map(s => {
      if (s.id === id) {
        const newVolunteers = s.volunteers + 1;
        const newCoverage = Math.min(100, s.coverage + 6);
        let newUrgency = s.urgency;
        if (newCoverage >= 90) newUrgency = 'Optimal';
        else if (newCoverage >= 75) newUrgency = 'Low';
        else if (newCoverage >= 50) newUrgency = 'Medium';
        else if (newCoverage >= 35) newUrgency = 'High';
        else newUrgency = 'Critical';
        
        setActiveToast({
          message: `Dispatched volunteer unit! Coverage at ${newCoverage}%.`,
          sector: s.name
        });
        
        return {
          ...s,
          volunteers: newVolunteers,
          coverage: newCoverage,
          urgency: newUrgency
        };
      }
      return s;
    }));
  };

  React.useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

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
        let lat = 51.5074, lon = -0.1278; // Default: London Hub
        let city = 'London Hub';
        
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

        // 1. Fetch Location Name dynamically (Keyless & Free)
        try {
          const geoRes = await fetch(`https://api.bigdatacloud.com/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          const geoData = await geoRes.json();
          city = geoData.city || geoData.locality || geoData.principalSubdivision || 'Mission Hub';
        } catch (geoNameErr) {
          city = 'Mission Hub';
        }

        // 2. Fetch Weather from Open-Meteo (Keyless & Free)
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
        const weatherData = await weatherRes.json();

        if (weatherData && weatherData.current) {
          const temp = Math.round(weatherData.current.temperature_2m);
          const code = weatherData.current.weather_code;
          
          let status = 'Clear';
          if (code >= 1 && code <= 3) status = 'Clouds';
          else if (code >= 45 && code <= 48) status = 'Fog';
          else if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) status = 'Rain';
          else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) status = 'Snow';
          else if (code >= 95) status = 'Thunderstorm';

          const finalWeather = {
            temp,
            status,
            city,
            aqi: 75
          };
          
          setWeather(finalWeather);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: finalWeather, timestamp: Date.now() }));
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

  // --- BENTO SUB-RENDERERS ---

  const renderWelcomeContent = (size: 'small' | 'medium_h' | 'medium_v' | 'large') => {
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const dateString = time.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })
    const greeting = `Welcome back, ${user?.name || 'Volunteer'}`

    if (size === 'small') {
      return (
        <div className="h-full flex flex-col justify-between p-2">
          <div className="space-y-1.5">
            <h4 className="text-lg font-black uppercase tracking-wider text-indigo-500">Welcome</h4>
            <p className="text-xl font-black text-foreground truncate">{user?.name || 'Volunteer'}</p>
          </div>
          <div className="bg-secondary/40 border border-border/55 rounded-2xl p-4">
            <p className="text-3xl font-black tracking-tight text-foreground">{timeString.split(' ')[0]}</p>
            <p className="text-base font-extrabold text-muted-foreground uppercase mt-1">{dateString}</p>
          </div>
        </div>
      )
    }

    if (size === 'medium_h') {
      return (
        <div className="h-full flex items-center justify-between gap-4 p-2">
          <div className="space-y-4 flex-1 min-w-0">
            <h3 className="text-3xl font-black text-foreground truncate">{greeting}</h3>
            <div className="bg-secondary/40 border border-border/55 rounded-2xl p-4 inline-block">
              <p className="text-4xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400">{timeString}</p>
              <p className="text-base font-semibold text-muted-foreground mt-1">{dateString}</p>
            </div>
          </div>
          
          <div className="bg-secondary/30 border border-border/55 rounded-3xl p-5 flex flex-col justify-between h-full w-[200px] shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400 rounded-full blur-xl opacity-10 animate-pulse" />
            <div>
              <span className="text-base font-black uppercase text-muted-foreground">LOCAL WEATHER</span>
              <p className="text-3xl font-black text-foreground mt-1">{weather?.temp ?? '72'}° {weather?.status || 'Clear'}</p>
            </div>
            <p className="text-base font-extrabold text-emerald-500 uppercase tracking-wider truncate">AQI {weather?.aqi || 'Good'}</p>
          </div>
        </div>
      )
    }

    return (
      <div className="h-full flex flex-col justify-between p-2">
        <div className="space-y-3">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">{greeting}</h2>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-base font-extrabold text-emerald-500 uppercase tracking-widest">System Link Active</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="bg-secondary/40 border border-border/55 rounded-2xl p-5 flex flex-col justify-center">
            <p className="text-4xl md:text-5xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400">{timeString}</p>
            <p className="text-base font-bold text-muted-foreground mt-1">{dateString}</p>
          </div>

          <div className="bg-secondary/40 border border-border/55 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-amber-400 rounded-full blur-2xl opacity-5" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-4xl font-black text-foreground">{weather?.temp ?? '72'}°</p>
                <p className="text-base font-extrabold text-muted-foreground uppercase">{weather?.status || 'Nominal'}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-md shadow-amber-500/10" />
            </div>
            <p className="text-sm font-black uppercase text-emerald-500 tracking-wider mt-2">AQI {weather?.aqi || '75'} (HEALTHY)</p>
          </div>
        </div>

        {size === 'large' && (
          <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-3 mt-4">
            <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Next scheduled activity today at <span className="underline font-black">08:30 PM</span>
            </p>
          </div>
        )}
      </div>
    )
  }

  const renderTacticalIntelContent = (size: 'small' | 'medium_h' | 'medium_v' | 'large') => {
    const readyPercentage = readiness?.percentage ?? 85;
    const criticalTasksCount = readiness?.criticalTasks ?? 0;
    const safeFocusSector = typeof directive?.focusSector === 'string' ? directive.focusSector : 'Sector Delta';
    const safeDirectiveText = typeof directive?.directive === 'string' ? directive.directive : 'Focus deployments on Sector Delta. Medical resource utilization is peak.';

    if (size === 'small') {
      return (
        <div className="h-full flex flex-col justify-between p-2">
          <h4 className="text-lg font-black uppercase tracking-wider text-indigo-500">Mission Readiness</h4>
          <div className="flex items-center gap-4 py-2">
            <div className="h-18 w-18 rounded-full border-[5px] border-emerald-500/10 flex items-center justify-center relative shrink-0">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="44" 
                  fill="none" stroke="currentColor" strokeWidth="6"
                  className="text-emerald-500"
                  strokeDasharray={`${readyPercentage * 2.76} 276`}
                />
              </svg>
              <span className="text-xl font-black">{readyPercentage}%</span>
            </div>
            <div>
              <p className="text-lg font-black uppercase italic text-foreground">Operational</p>
              <p className="text-base font-bold text-muted-foreground mt-0.5">Nominal telemetry</p>
            </div>
          </div>
        </div>
      )
    }

    if (size === 'medium_h') {
      return (
        <div className="h-full flex items-center justify-between gap-6 p-2">
          <div className="flex items-center gap-4 flex-1">
            <div className="h-20 w-20 rounded-full border-[6px] border-emerald-500/10 flex items-center justify-center relative shrink-0">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="44" 
                  fill="none" stroke="currentColor" strokeWidth="6"
                  className="text-emerald-500"
                  strokeDasharray={`${readyPercentage * 2.76} 276`}
                />
              </svg>
              <span className="text-2xl font-black">{readyPercentage}%</span>
            </div>
            <div>
              <h4 className="text-base font-black uppercase tracking-wider text-muted-foreground">Mission Readiness</h4>
              <p className="text-2xl font-black uppercase italic mt-0.5">Operational Status</p>
            </div>
          </div>

          <div className={cn(
            "border-2 rounded-2xl p-4 flex items-center gap-3 w-[220px] shrink-0 h-full justify-center text-center",
            criticalTasksCount > 0 ? "border-rose-500/50 bg-rose-500/5 text-rose-500" : "border-border bg-emerald-500/5 text-emerald-500"
          )}>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider opacity-75">STRATEGIC RISK</h4>
              <p className="text-xl font-black uppercase italic mt-1">
                {criticalTasksCount > 0 ? `${criticalTasksCount} Critical Bottlenecks` : "No Active Threats"}
              </p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-lg font-black uppercase tracking-wider text-indigo-500">Tactical Command Intelligence</h4>
          <span className="px-3 py-1 bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm font-black uppercase tracking-widest rounded-full">AI Sync Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
          <div className="bg-secondary/30 border border-border/50 rounded-2xl p-4 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full border-[5px] border-emerald-500/10 flex items-center justify-center relative shrink-0">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="44" 
                  fill="none" stroke="currentColor" strokeWidth="6"
                  className="text-emerald-500"
                  strokeDasharray={`${readyPercentage * 2.76} 276`}
                />
              </svg>
              <span className="text-xl font-black">{readyPercentage}%</span>
            </div>
            <div>
              <h5 className="text-sm font-black uppercase tracking-wider text-muted-foreground">READINESS GAUGE</h5>
              <p className="text-xl font-black uppercase italic text-foreground">Operational</p>
            </div>
          </div>

          <div className={cn(
            "border-2 rounded-2xl p-4 flex items-center gap-4 justify-center text-center",
            criticalTasksCount > 0 ? "border-rose-500/50 bg-rose-500/5 text-rose-500" : "border-border bg-emerald-500/5 text-emerald-500"
          )}>
            <div>
              <h5 className="text-sm font-black uppercase tracking-wider opacity-75">STRATEGIC RISK ASSESSMENT</h5>
              <p className="text-lg font-black uppercase italic mt-1">
                {criticalTasksCount > 0 ? `${criticalTasksCount} CRITICAL THREATS` : "NOMINAL THREAT STATUS"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-slate-950 text-white border border-white/5 rounded-2xl p-4 flex items-start gap-3 mt-2">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20 mt-0.5">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-sm font-black uppercase tracking-wider text-indigo-400">NEURAL DIRECTIVE</h5>
            <p className="text-base font-bold leading-normal mt-1 text-slate-200">
              Focus deployments on <span className="text-indigo-400 font-extrabold">{safeFocusSector}</span>. {safeDirectiveText.replace(safeFocusSector, '').replace(/^\s*[\.\,]\s*/, '')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const renderGridVizContent = (size: 'small' | 'medium_h' | 'medium_v' | 'large') => {
    const activeSector = sectors.find(s => s.id === selectedSectorId) || sectors[0];

    const getUrgencyColor = (urgency: string) => {
      switch (urgency.toLowerCase()) {
        case 'critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
        case 'high': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
        case 'medium': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30';
        case 'low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
        default: return 'text-teal-500 bg-teal-500/10 border-teal-500/30';
      }
    };

    const getUrgencyDot = (urgency: string) => {
      switch (urgency.toLowerCase()) {
        case 'critical': return 'bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse';
        case 'high': return 'bg-amber-500';
        case 'medium': return 'bg-indigo-500';
        case 'low': return 'bg-emerald-500';
        default: return 'bg-teal-500';
      }
    };

    return (
      <div className="h-full flex flex-col justify-between p-2 select-none relative overflow-hidden">
        {/* Dynamic Inner Alert Notification inside Widget */}
        <AnimatePresence>
          {activeToast && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-indigo-950 border border-indigo-500/30 text-indigo-200 px-4 py-2 rounded-xl shadow-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap"
            >
              <Zap className="h-3.5 w-3.5 text-indigo-400 animate-bounce animate-duration-500" />
              <span>{activeToast.sector}: {activeToast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Widget Title / Header */}
        <div className="flex justify-between items-center mb-3 shrink-0">
          <div className="space-y-0.5">
            <h4 className="text-lg font-black uppercase tracking-wider text-indigo-500">Resource & Dispatch Control</h4>
            <p className="text-xs font-bold text-muted-foreground uppercase">Interactive sector logistics</p>
          </div>
          <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shrink-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            OPERATIONAL
          </span>
        </div>

        {/* Responsive Layout Content switcher */}
        {size === 'small' && (
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
            {[...sectors].sort((a, b) => a.coverage - b.coverage).slice(0, 3).map(s => (
              <div key={s.id} className="p-2 rounded-xl border border-border/40 bg-secondary/15 flex items-center justify-between gap-3 hover:border-indigo-500/30 transition-all duration-300">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", getUrgencyDot(s.urgency))} />
                    <span className="font-bold text-xs truncate text-foreground">{s.name}</span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-1 overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${s.coverage}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-black text-muted-foreground uppercase">{s.coverage}%</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDispatchSector(s.id)}
                    className="h-7 w-7 rounded-lg border border-border/50 hover:bg-indigo-500 hover:text-white transition-all"
                  >
                    <Zap className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {size === 'medium_h' && (
          <div className="flex-1 flex gap-4 overflow-hidden my-1">
            {/* List side */}
            <div className="w-1/2 flex flex-col gap-1.5 overflow-y-auto pr-1 scrollbar-thin">
              {sectors.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSectorId(s.id)}
                  className={cn(
                    "w-full text-left p-2 rounded-xl border text-xs transition-all flex items-center justify-between gap-2",
                    s.id === selectedSectorId 
                      ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.08)]" 
                      : "border-border/40 bg-secondary/10 hover:bg-secondary/20 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", getUrgencyDot(s.urgency))} />
                    <span className="font-bold truncate">{s.name}</span>
                  </div>
                  <span className="text-[10px] font-black opacity-80 shrink-0">{s.coverage}%</span>
                </button>
              ))}
            </div>

            {/* Focused Sector view */}
            <div className="w-1/2 border border-border/40 bg-secondary/15 rounded-xl p-3 flex flex-col justify-between overflow-hidden">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">{activeSector.category}</span>
                  <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0", getUrgencyColor(activeSector.urgency))}>
                    {activeSector.urgency}
                  </span>
                </div>
                <h5 className="font-black text-sm text-foreground truncate">{activeSector.name}</h5>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                    <span>Target Coverage</span>
                    <span className="text-foreground">{activeSector.coverage}%</span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${activeSector.coverage}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground pt-1">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3 text-indigo-400" /> {activeSector.volunteers} Dispatch units</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-indigo-400" /> {activeSector.latency}</span>
                </div>
              </div>

              <Button 
                onClick={() => handleDispatchSector(activeSector.id)}
                className="w-full h-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-wider text-[10px] gap-1.5 flex items-center justify-center mt-2 shadow-lg shadow-indigo-600/20"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                Dispatch Unit
              </Button>
            </div>
          </div>
        )}

        {size === 'medium_v' && (
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1 my-1">
            <div className="grid grid-cols-12 px-2 text-[10px] font-black text-muted-foreground/50 uppercase tracking-wider shrink-0">
              <span className="col-span-5">Sector</span>
              <span className="col-span-3 text-center">Coverage</span>
              <span className="col-span-2 text-center">Vols</span>
              <span className="col-span-2 text-right">Action</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {sectors.map(s => (
                <div key={s.id} className="grid grid-cols-12 items-center p-2 rounded-xl border border-border/40 bg-secondary/15 hover:border-indigo-500/20 transition-all duration-300">
                  <div className="col-span-5 flex items-center gap-1.5 min-w-0">
                    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", getUrgencyDot(s.urgency))} />
                    <div className="min-w-0">
                      <p className="font-bold text-xs truncate text-foreground leading-none">{s.name}</p>
                      <p className="text-[8px] font-black text-muted-foreground uppercase mt-0.5">{s.category}</p>
                    </div>
                  </div>
                  <div className="col-span-3 px-2">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-full bg-secondary/50 rounded-full h-1 overflow-hidden hidden sm:block">
                        <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${s.coverage}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-foreground">{s.coverage}%</span>
                    </div>
                  </div>
                  <span className="col-span-2 text-center text-xs font-bold text-muted-foreground">{s.volunteers}</span>
                  <div className="col-span-2 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDispatchSector(s.id)}
                      className="h-7 w-7 rounded-lg border border-border/50 hover:bg-indigo-500 hover:text-white transition-all inline-flex"
                    >
                      <Zap className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {size === 'large' && (
          <div className="flex-1 flex flex-col justify-between my-1 gap-3 overflow-hidden">
            {/* Core analytics bar */}
            <div className="grid grid-cols-3 gap-3 bg-secondary/20 border border-border/40 p-3 rounded-2xl text-center shrink-0">
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Global Coverage</p>
                <p className="text-xl font-black text-indigo-400 mt-0.5">
                  {Math.round(sectors.reduce((acc, s) => acc + s.coverage, 0) / sectors.length)}%
                </p>
              </div>
              <div className="border-x border-border/40">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Active Volunteers</p>
                <p className="text-xl font-black text-emerald-400 mt-0.5">
                  {sectors.reduce((acc, s) => acc + s.volunteers, 0)}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Neural Focus</p>
                <p className="text-[11px] font-black text-rose-400 mt-1 uppercase truncate px-1">
                  {sectors.find(s => s.urgency === 'Critical')?.name || 'Old Town Relief'}
                </p>
              </div>
            </div>

            {/* Grid of 6 interactive cards */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-1 scrollbar-thin">
              {sectors.map(s => {
                const isFocused = s.id === selectedSectorId;
                return (
                  <div 
                    key={s.id} 
                    onClick={() => setSelectedSectorId(s.id)}
                    className={cn(
                      "rounded-2xl border p-3.5 transition-all duration-300 flex flex-col justify-between gap-3 cursor-pointer",
                      isFocused 
                        ? "border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
                        : "border-border/40 bg-secondary/10 hover:bg-secondary/20 hover:border-border/80"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">{s.category}</span>
                        <span className={cn("text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border shrink-0", getUrgencyColor(s.urgency))}>
                          {s.urgency}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full shrink-0", getUrgencyDot(s.urgency))} />
                        <h5 className="font-black text-sm text-foreground truncate leading-tight">{s.name}</h5>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                          <span>Coverage Status</span>
                          <span className="text-foreground font-extrabold">{s.coverage}%</span>
                        </div>
                        <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${s.coverage}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-border/20">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3 text-indigo-400" /> {s.volunteers} Vols</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-indigo-400" /> {s.latency}</span>
                      </div>
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDispatchSector(s.id);
                        }}
                        className="h-7 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-wider text-[9px] gap-1 flex items-center justify-center shadow-md shadow-indigo-600/10"
                      >
                        <Zap className="h-3 w-3 fill-current" />
                        Dispatch
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCalendarContent = (size: 'small' | 'medium_h' | 'medium_v' | 'large') => {
    if (size === 'small') {
      return (
        <div className="h-full flex flex-col justify-between p-2">
          <h4 className="text-xl font-black uppercase tracking-wider text-indigo-500">Operation Date</h4>
          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 text-center my-2">
            <p className="text-base font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{monthNames[currentMonth]}</p>
            <p className="text-6xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{selectedDate}</p>
            <p className="text-sm font-bold text-muted-foreground mt-2">Calendar Active</p>
          </div>
        </div>
      )
    }

    if (size === 'medium_h') {
      return (
        <div className="h-full flex items-center justify-between gap-6 p-2">
          <div className="space-y-2 shrink-0">
            <h4 className="text-base font-black uppercase tracking-wider text-muted-foreground">OPERATIONAL TARGET</h4>
            <p className="text-4xl font-black text-foreground">{selectedDate} {monthNames[currentMonth].toUpperCase()}</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} className="h-10 w-10 rounded-lg border border-border"><ChevronLeft className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} className="h-10 w-10 rounded-lg border border-border"><ChevronRight className="h-5 w-5" /></Button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-7 gap-2 bg-secondary/20 border border-border/40 p-4 rounded-2xl text-center">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="space-y-2">
                <span className="text-sm font-black text-muted-foreground/45">{d}</span>
                <div 
                  onClick={() => {
                    const dNum = (selectedDate - 3 + i + daysInMonth) % daysInMonth || 1;
                    setSelectedDate(dNum);
                  }}
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-base font-bold mx-auto cursor-pointer transition-all",
                    "hover:bg-indigo-500/10 hover:text-indigo-500",
                    ((selectedDate - 3 + i + daysInMonth) % daysInMonth || 1) === selectedDate ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-foreground"
                  )}
                >
                  {(selectedDate - 3 + i + daysInMonth) % daysInMonth || 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-center px-1 mb-2">
          <h4 className="text-xl font-black uppercase tracking-wider text-indigo-500">Operation Calendar</h4>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} className="h-10 w-10 rounded-lg hover:bg-secondary"><ChevronLeft className="h-5 w-5" /></Button>
            <span className="text-base font-black uppercase tracking-wider px-3">{monthNames[currentMonth].substring(0,3)} {currentYear}</span>
            <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} className="h-10 w-10 rounded-lg hover:bg-secondary"><ChevronRight className="h-5 w-5" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-2 text-center font-mono my-2 text-sm flex-1 items-center">
          {['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].map((d) => (
            <div key={d} className="text-sm font-black text-muted-foreground/45 tracking-widest">{d}</div>
          ))}
          
          <div className="col-span-7 grid grid-cols-7 gap-y-2">
            {prevMonthPadding.slice(0, firstDay).map((d, i) => (
              <div key={`prev-${i}`} className="h-9 w-9 mx-auto flex items-center justify-center text-sm font-bold text-muted-foreground/10">{d}</div>
            ))}
            {currentMonthDays.map((d) => (
              <div 
                key={d} 
                onClick={() => setSelectedDate(d)}
                className={cn(
                  "h-9 w-9 mx-auto flex items-center justify-center rounded-full text-base font-extrabold transition-all relative cursor-pointer",
                  d === selectedDate 
                    ? "bg-emerald-500 text-slate-900 shadow-md shadow-emerald-500/20" 
                    : "hover:bg-emerald-500/10 text-foreground/80 hover:text-emerald-500"
                )}
              >
                {d}
                {(d === 7 || d === 31) && (
                   <div className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                )}
              </div>
            ))}
            {nextMonthPadding.slice(0, nextMonthPaddingCount).map((d, i) => (
              <div key={`next-${i}`} className="h-9 w-9 mx-auto flex items-center justify-center text-sm font-bold text-muted-foreground/10">{d}</div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderAgendaContent = (size: 'small' | 'medium_h' | 'medium_v' | 'large') => {
    const dayTasks = tasks.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getDate() === selectedDate && 
             tDate.getMonth() === currentMonth && 
             tDate.getFullYear() === currentYear;
    });

    if (size === 'small') {
      return (
        <div className="h-full flex flex-col justify-between p-2">
          <h4 className="text-xl font-black uppercase tracking-wider text-indigo-500">Missions Agenda</h4>
          <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 flex-1 flex flex-col justify-center my-2 min-h-0">
            {dayTasks.length > 0 ? (
              <div className="space-y-1.5">
                <span className="text-sm font-black text-emerald-500 uppercase tracking-wider">{dayTasks[0].category.toUpperCase()}</span>
                <p className="text-base font-extrabold truncate text-foreground">{dayTasks[0].title}</p>
                <p className="text-sm text-muted-foreground font-bold">{dayTasks[0].startTime} - {dayTasks[0].endTime}</p>
              </div>
            ) : (
              <p className="text-base text-muted-foreground font-semibold text-center italic">No operations listed</p>
            )}
          </div>
        </div>
      )
    }

    if (size === 'medium_h') {
      return (
        <div className="h-full flex items-center justify-between gap-6 p-2">
          <div className="flex-1 flex flex-col min-w-0 h-full justify-between">
            <h4 className="text-xl font-black uppercase tracking-wider text-indigo-500">SCHEDULED MISSIONS</h4>
            <div className="bg-secondary/35 border border-border/40 p-4 rounded-2xl flex-1 overflow-y-auto my-2 min-w-0">
              {dayTasks.length > 0 ? (
                <div className="space-y-4">
                  {dayTasks.slice(0, 2).map((t, idx) => (
                    <div key={idx} className="flex justify-between items-center text-base gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-extrabold truncate text-foreground">{t.title}</p>
                        <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">{t.category}</span>
                      </div>
                      <span className="text-sm text-muted-foreground shrink-0 font-bold">{t.startTime}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base text-muted-foreground italic text-center py-2">Standby for directive allocation...</p>
              )}
            </div>
          </div>

          <Button 
            onClick={() => setIsScheduling(true)}
            className="w-[140px] shrink-0 h-full bg-emerald-500 text-slate-900 border-2 border-slate-950 font-black text-sm uppercase rounded-2xl shadow-[3px_3px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_#000] hover:bg-emerald-600 transition-all flex flex-col items-center justify-center gap-2"
          >
            <Plus className="h-6 w-6" />
            <span className="font-mono text-sm tracking-widest">DEPLOY</span>
          </Button>
        </div>
      )
    }

    return (
      <div className="h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xl font-black uppercase tracking-wider text-indigo-500">Missions Agenda</h4>
          <span className="text-base font-black text-emerald-500 uppercase">{dayTasks.length} Directive(s)</span>
        </div>

        <div className="flex-1 overflow-y-auto bg-secondary/35 border border-border/40 rounded-2xl p-4 space-y-4 my-2">
          {dayTasks.length > 0 ? (
            dayTasks.map((t, idx) => (
              <div key={idx} className="bg-background/60 border border-border/40 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-emerald-500 uppercase tracking-widest">{t.category}</span>
                  <span className="text-sm text-muted-foreground font-bold">{t.startTime} - {t.endTime}</span>
                </div>
                <p className="text-lg font-extrabold text-foreground truncate">{t.title}</p>
                {t.description && <p className="text-base text-muted-foreground line-clamp-2">{t.description}</p>}
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <CalendarIcon className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-base text-muted-foreground italic leading-relaxed">No operations active for {selectedDate} {monthNames[currentMonth]}. Calibration required.</p>
            </div>
          )}
        </div>

        <Button 
          onClick={() => setIsScheduling(true)}
          className="w-full h-14 bg-emerald-500 text-slate-900 border-2 border-slate-950 font-black text-sm uppercase tracking-widest rounded-xl shadow-[3px_3px_0px_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-[0px_0px_0px_#000] hover:bg-emerald-600 transition-all gap-2"
        >
          <Plus className="h-5 w-5" /> Deploy New Mission
        </Button>
      </div>
    )
  }

  const renderProgressionContent = (size: 'small' | 'medium_h' | 'medium_v' | 'large') => {
    const points = user?.points || 0;
    const currentLvl = Math.floor(points / 1000) + 1;
    const nextTierPercentage = ((points % 1000) / 10);

    if (size === 'small') {
      return (
        <div className="h-full flex flex-col justify-between p-2">
          <h4 className="text-xl font-black uppercase tracking-wider text-indigo-500">Leaderboard Tier</h4>
          <div className="space-y-3 my-2">
            <p className="text-5xl font-black text-foreground italic">LVL {currentLvl}</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm font-bold uppercase text-muted-foreground">
                <span>PROGRESS</span>
                <span>{nextTierPercentage}%</span>
              </div>
              <div className="h-3.5 w-full bg-secondary rounded-full overflow-hidden p-0.5 border border-border/40">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${nextTierPercentage}%` }} />
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (size === 'medium_h') {
      return (
        <div className="h-full flex items-center justify-between gap-6 p-2">
          <div className="space-y-2">
            <h4 className="text-base font-black uppercase tracking-wider text-muted-foreground">VOLUNTEER LEVEL</h4>
            <p className="text-6xl font-black text-indigo-600 dark:text-indigo-400 italic">TIER {currentLvl}</p>
            <p className="text-base font-bold text-muted-foreground uppercase">{points.toLocaleString()} XP Points accumulated</p>
          </div>

          <div className="flex-1 max-w-[240px] space-y-3 bg-secondary/30 border border-border/40 p-5 rounded-2xl">
            <div className="flex justify-between text-sm font-black uppercase text-muted-foreground">
              <span>Next Level Progress</span>
              <span>{nextTierPercentage}%</span>
            </div>
            <div className="h-3.5 w-full bg-secondary rounded-full overflow-hidden p-0.5 border border-border/40">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${nextTierPercentage}%` }} />
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase">Initial rank tier assigned</p>
          </div>
        </div>
      )
    }

    return (
      <div className="h-full flex flex-col justify-between bg-indigo-600 text-white rounded-[2.2rem] border border-indigo-500 p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="space-y-3">
          <h4 className="text-base font-black uppercase tracking-widest text-indigo-200">OPERA LEVEL RANK</h4>
          <p className="text-7xl font-black italic tracking-tighter">LEVEL {currentLvl}</p>
          <p className="text-lg font-bold text-indigo-100">{points.toLocaleString()} total uplink telemetries</p>
        </div>

        <div className="space-y-4 mt-6">
          <div className="flex justify-between text-sm font-black uppercase tracking-wider text-indigo-200">
            <span>Progress to Next Tier</span>
            <span>{nextTierPercentage}%</span>
          </div>
          <div className="h-4.5 w-full bg-white/20 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${nextTierPercentage}%` }} />
          </div>
        </div>

        <p className="text-base font-semibold text-indigo-100 mt-4 leading-normal opacity-90">
          Rank initializations completed. Carry out tactical deployments to scale up rank ladders.
        </p>
      </div>
    )
  }

  const renderRecentImpactContent = (size: 'small' | 'medium_h' | 'medium_v' | 'large') => {
    const impacts = user?.recentImpact || [];

    if (size === 'small') {
      return (
        <div className="h-full flex flex-col justify-between p-2">
          <h4 className="text-xl font-black uppercase tracking-wider text-indigo-500">Recent Impact</h4>
          <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4 flex-1 flex items-center gap-3 my-2">
            {impacts.length > 0 ? (
              <>
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-lg flex items-center justify-center shrink-0">+{impacts[0].xp}</div>
                <div className="min-w-0">
                  <p className="text-base font-extrabold text-foreground truncate">{impacts[0].label}</p>
                  <p className="text-sm text-muted-foreground font-semibold">{impacts[0].time}</p>
                </div>
              </>
            ) : (
              <p className="text-base text-muted-foreground italic text-center w-full">No recent operational logs</p>
            )}
          </div>
        </div>
      )
    }

    if (size === 'medium_h') {
      return (
        <div className="h-full flex flex-col justify-between p-2">
          <h4 className="text-base font-black uppercase tracking-wider text-muted-foreground">RECENT LOGS</h4>
          <div className="grid grid-cols-2 gap-4 flex-1 my-2">
            {impacts.length > 0 ? (
              impacts.slice(0, 2).map((imp: any, i: number) => (
                <div key={i} className="bg-secondary/35 border border-border/40 p-4 rounded-2xl flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-lg flex items-center justify-center shrink-0">+{imp.xp}</div>
                  <div className="min-w-0">
                    <p className="text-base font-extrabold text-foreground truncate">{imp.label}</p>
                    <p className="text-sm text-muted-foreground font-bold">{imp.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex items-center justify-center italic text-base text-muted-foreground">No recent telemetry registered.</div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xl font-black uppercase tracking-wider text-indigo-500">Recent Impact Log</h4>
          <ActivityIcon className="h-5 w-5 text-indigo-500" />
        </div>

        <div className="flex-1 overflow-y-auto bg-secondary/35 border border-border/40 rounded-2xl p-4 space-y-4 my-2 font-body">
          {impacts.length > 0 ? (
            impacts.map((i: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-center bg-background/50 p-4 rounded-xl border border-border/30 hover:border-indigo-500/20 transition-all">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg shrink-0">+{i.xp}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-extrabold text-foreground truncate">{i.label}</p>
                  <p className="text-sm text-muted-foreground font-bold">{i.time}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-40 py-10">
              <ActivityIcon className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-black uppercase tracking-wider italic">No impact detected</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderSmartMatchesContent = (size: 'small' | 'medium_h' | 'medium_v' | 'large') => {
    if (size === 'small') {
      return (
        <div className="h-full flex flex-col justify-between p-2">
          <h4 className="text-xl font-black uppercase tracking-wider text-indigo-500">Smart Matches</h4>
          <p className="text-base font-bold text-muted-foreground leading-normal my-2">Personalized match profiles are ready for initialization.</p>
        </div>
      )
    }

    if (size === 'medium_h') {
      return (
        <div className="h-full flex items-center justify-between gap-6 p-2">
          <div className="space-y-2 flex-1 min-w-0">
            <h4 className="text-base font-black uppercase tracking-wider text-muted-foreground">RECOMMENDED ALIGNMENT</h4>
            <p className="text-base font-extrabold text-foreground leading-relaxed">Select matching core skill vectors to receive specialized task alerts.</p>
          </div>

          <Button 
            onClick={() => window.location.href='/onboarding'}
            className="w-[140px] shrink-0 h-full bg-indigo-600 hover:bg-indigo-750 text-white border border-transparent font-extrabold text-xs uppercase rounded-2xl transition-all flex flex-col items-center justify-center gap-2 shadow-md shadow-indigo-600/10 active:scale-95"
          >
            <Sparkles className="h-5 w-5 text-indigo-200 animate-pulse" />
            <span className="tracking-widest">SYNC SKILLS</span>
          </Button>
        </div>
      )
    }

    return (
      <div className="h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xl font-black uppercase tracking-wider text-indigo-500">Smart Skill Matches</h4>
          <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
        </div>

        <div className="bg-secondary/35 border border-border/40 p-5 rounded-2xl space-y-4 my-2 flex-1 flex flex-col justify-center">
          <p className="text-lg font-extrabold text-foreground leading-relaxed text-center">
            Integrate volunteer core competencies with live tactical operations. Complete alignment questionnaires.
          </p>
          <p className="text-base font-medium text-muted-foreground text-center">
            Personalized operations will be streamed directly onto this tactical feed.
          </p>
        </div>

        <Button 
          onClick={() => window.location.href='/onboarding'}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-750 text-white border border-transparent font-extrabold text-xs uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 mt-2 shadow-md shadow-indigo-600/10 active:scale-95"
        >
          <Sparkles className="h-5 w-5 text-indigo-200" /> Initialize Core Skills
        </Button>
      </div>
    )
  }

  const renderDiagnosticsContent = (size: 'small' | 'medium_h' | 'medium_v' | 'large') => {
    if (size === 'small') {
      return (
        <div className="h-full flex flex-col justify-between p-2">
          <h4 className="text-xl font-black uppercase tracking-wider text-indigo-500">AI Engine</h4>
          <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-xl p-4 my-2 text-center">
            <span className="text-sm font-black uppercase text-indigo-600 dark:text-indigo-400">GEMINI D-LINK</span>
            <p className="text-xl font-extrabold text-foreground mt-1">NOMINAL (14ms)</p>
          </div>
        </div>
      )
    }

    if (size === 'medium_h') {
      return (
        <div className="h-full flex items-center justify-between gap-6 p-2">
          <div className="space-y-2 flex-1 min-w-0">
            <h4 className="text-base font-black uppercase tracking-wider text-muted-foreground">AI SYSTEM LOG</h4>
            <p className="text-base font-extrabold text-foreground">Gemini Pro API pipeline is active. Real-time telemetry translation verified.</p>
          </div>

          <Button 
            onClick={() => window.location.href='/ai-console'}
            className="w-[140px] shrink-0 h-full bg-indigo-600 hover:bg-indigo-750 text-white border border-transparent font-extrabold text-xs uppercase rounded-2xl transition-all flex flex-col items-center justify-center gap-2 shadow-md shadow-indigo-600/10 active:scale-95"
          >
            <Cpu className="h-5 w-5 text-indigo-200" />
            <span className="tracking-widest">CONSOLE</span>
          </Button>
        </div>
      )
    }

    return (
      <div className="h-full flex flex-col justify-between p-2">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xl font-black uppercase tracking-wider text-indigo-500">AI Diagnostics Console</h4>
          <Cpu className="h-5 w-5 text-indigo-500" />
        </div>

        <div className="bg-secondary/35 border border-border/40 rounded-2xl p-5 space-y-4 my-2 flex-1 flex flex-col justify-center">
          <div className="flex justify-between text-base border-b border-dashed border-border/80 pb-3">
            <span className="text-muted-foreground font-bold">MODEL PIPELINE:</span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">GEMINI-2.5-PRO</span>
          </div>
          <div className="flex justify-between text-base border-b border-dashed border-border/80 pb-3">
            <span className="text-muted-foreground font-bold">LATENCY SPEED:</span>
            <span className="font-extrabold text-emerald-500">14MS (OPTIMAL)</span>
          </div>
          <div className="flex justify-between text-base">
            <span className="text-muted-foreground font-bold">OPERATION LOG:</span>
            <span className="font-extrabold text-foreground">STABLE PIPELINE</span>
          </div>
        </div>

        <Button 
          onClick={() => window.location.href='/ai-console'}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-750 text-white border border-transparent font-extrabold text-xs uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 mt-2 shadow-md shadow-indigo-600/10 active:scale-95"
        >
          <Cpu className="h-5 w-5 text-indigo-200" /> Launch AI Console
        </Button>
      </div>
    )
  }

  const renderWidgetContent = (id: string, size: 'small' | 'medium_h' | 'medium_v' | 'large') => {
    switch (id) {
      case 'welcome':
        return renderWelcomeContent(size);
      case 'tactical_intel':
        return renderTacticalIntelContent(size);
      case 'grid_viz':
        return renderGridVizContent(size);
      case 'calendar':
        return renderCalendarContent(size);
      case 'agenda':
        return renderAgendaContent(size);
      case 'progression':
        return renderProgressionContent(size);
      case 'recent_impact':
        return renderRecentImpactContent(size);
      case 'smart_matches':
        return renderSmartMatchesContent(size);
      case 'diagnostics':
        return renderDiagnosticsContent(size);
      default:
        return null;
    }
  }

  const sizeClasses = {
    small: "col-span-1 row-span-1 h-[220px]",
    medium_h: "col-span-2 row-span-1 h-[220px]",
    medium_v: "col-span-1 row-span-2 h-[464px]",
    large: "col-span-2 row-span-2 h-[464px]"
  };
  const renderBentoWidget = (widget: Widget) => {
    const sizeClass = sizeClasses[widget.size] || sizeClasses.small;
    
    return (
      <motion.div
        key={widget.id}
        className={cn(
          "rounded-[2.2rem] p-6 relative overflow-hidden transition-all duration-500 flex flex-col justify-between select-none",
          "bg-card/45 backdrop-blur-md border border-border/40 shadow-[0_15px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_15px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_60px_rgba(99,102,241,0.08)] hover:border-indigo-500/35 hover:-translate-y-1",
          sizeClass
        )}
      >
        <div className="w-full h-full flex flex-col justify-between transition-all">
          {renderWidgetContent(widget.id, widget.size)}
        </div>
      </motion.div>
    );
  };

  const renderOverview = () => {
    const visibleWidgets = widgets.filter(w => w.visible);

    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[220px]">
          {visibleWidgets.map((widget) => renderBentoWidget(widget))}
        </div>
      </div>
    )
  }

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
              {/* Operational Metrics Badge */}
              {layoutMode === 'overview' && (
                <div className="hidden lg:flex items-center gap-6 bg-secondary/25 border border-border/40 px-6 h-14 rounded-3xl shrink-0">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Volunteers:</span>
                    <span className="text-sm font-black text-foreground">{sectors.reduce((acc, s) => acc + s.volunteers, 0)}</span>
                  </div>
                  <div className="h-4 w-[1px] bg-border/40" />
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Avg Coverage:</span>
                    <span className="text-sm font-black text-emerald-500">
                      {Math.round(sectors.reduce((acc, s) => acc + s.coverage, 0) / sectors.length)}%
                    </span>
                  </div>
                </div>
              )}

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
