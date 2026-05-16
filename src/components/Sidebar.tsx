import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  DashboardCircleIcon,
  ShoppingBasket01Icon,
  Comment01Icon,
  TimeScheduleIcon,
  FavouriteIcon,
  Award01Icon,
  FlashIcon,
  UserGroupIcon,
  Briefcase01Icon,
  TaskEdit01Icon,
  Notification01Icon,
  Settings01Icon,
  Logout01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  AiChat01Icon as Bot,
  CpuIcon as Cpu,
  PackageIcon as Package,
  Location01Icon as MapPin,
  UserIcon
} from "hugeicons-react"
import { Battery } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { useTheme } from "../contexts/ThemeContext"
import { cn } from "@/lib/utils"

export default function Sidebar({ onLogout }: { onLogout?: () => void }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [collapsedGroups, setCollapsedGroups] = React.useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('sidebar-collapsed-groups');
    return saved ? JSON.parse(saved) : {};
  });

  const { themeVariant } = useTheme();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isNgo = user?.role === 'ngo';

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => {
      const next = { ...prev, [label]: !prev[label] };
      localStorage.setItem('sidebar-collapsed-groups', JSON.stringify(next));
      return next;
    });
  };

  const [marketBadge, setMarketBadge] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    import('../lib/api').then(({ apiRequest }) => {
      apiRequest('/tasks', { method: 'GET' })
        .then(res => {
          if (res.success && res.data && res.data.length > 0) {
            setMarketBadge(res.data.length.toString());
          } else {
            setMarketBadge(undefined);
          }
        })
        .catch(() => setMarketBadge(undefined));
    });
  }, []);

   const isVolunteer = user?.role === 'volunteer';
   const isCustomer = user?.role === 'customer';

   const navGroups = [
    {
      label: "Core Operations",
      items: [
        { icon: DashboardCircleIcon, label: "Dashboard", path: "/dashboard", show: !isCustomer },
        { icon: Cpu, label: "Mission Lab", path: "/mission-lab", aiBadge: true, show: isNgo },
        { icon: Bot, label: "AI Console", path: "/ai-console", aiBadge: true, show: true },
        { icon: MapPin, label: "Strategic Map", path: "/map", show: !isCustomer },
        { icon: ShoppingBasket01Icon, label: "Marketplace", path: "/marketplace", badge: marketBadge, show: !isCustomer },
        { icon: Package, label: "Inventory", path: "/inventory", show: true },
        { icon: Comment01Icon, label: "Messages", path: "/chat", show: !isCustomer },
      ].filter(item => item.show)
    },
    {
      label: "Personnel",
      items: [
        { icon: TaskEdit01Icon, label: "My Assignments", path: "/assignments", show: isVolunteer },
        { icon: Battery, label: "Energy", path: "/energy", show: isVolunteer },
        { icon: FlashIcon, label: "Impact Score", path: "/impact-score", show: isVolunteer },
      ].filter(item => item.show)
    }
  ].filter(group => group.items.length > 0);

  return (
    <>
      {/* Desktop Sidebar - existing code stays */}
      <motion.aside
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={{ type: "spring", stiffness: 350, damping: 35 }}
        className="hidden md:flex border-r border-border bg-card flex-col h-screen sticky top-0 z-50 transition-colors duration-300 font-body relative shadow-none min-w-[80px]"
      >
      {/* Floating Collapse Toggle Button */}
      <button 
        onClick={() => {
          setIsCollapsed(!isCollapsed);
        }}
        className="absolute -right-4 top-[88px] h-8 w-8 bg-indigo-600 border border-indigo-500 rounded-full flex items-center justify-center z-[100] shadow-xl shadow-indigo-600/30 hover:scale-110 active:scale-95 transition-all text-white hover:bg-indigo-500"
      >
        {isCollapsed ? <ArrowRight01Icon className="h-4 w-4" /> : <ArrowLeft01Icon className="h-4 w-4" />}
      </button>

      {/* Top Section: Profile Protocol */}
      <div className="p-5 border-b border-border shrink-0">
        <Link 
          to="/profile"
          className="flex items-center gap-3 p-3 rounded-[2rem] hover:bg-secondary/50 transition-all group overflow-hidden border border-transparent hover:border-border/60"
        >
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
             <img 
               src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}&backgroundColor=f8faff`} 
               alt="AV" 
               className="w-full h-full object-cover" 
             />
          </div>
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 min-w-0"
            >
              <p className="text-[11px] font-black tracking-tight text-foreground truncate uppercase">{user?.name || 'User'}</p>
              <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest truncate">{user?.role || 'VOLUNTEER'}</p>
            </motion.div>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-8 scrollbar-hide">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-3">
             <div 
              onClick={() => toggleGroup(group.label)}
              className="flex items-center justify-between px-4 cursor-pointer group"
             >
                {!isCollapsed && <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 hover:text-indigo-600 transition-colors">{group.label}</span>}
                {!isCollapsed && (
                  <motion.div
                    animate={{ rotate: collapsedGroups[group.label] ? -90 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <ArrowDown01Icon className="h-2.5 w-2.5 text-muted-foreground/30 group-hover:text-indigo-600" />
                  </motion.div>
                )}
             </div>

             <AnimatePresence initial={false}>
                {!collapsedGroups[group.label] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-1"
                  >
                    {group.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "group relative flex items-center gap-4 p-3 rounded-[1.25rem] transition-all duration-300 border border-transparent",
                          location.pathname === item.path 
                            ? "bg-indigo-600/10 text-indigo-600 border-indigo-600/20 shadow-sm" 
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground hover:border-border/60"
                        )}
                      >
                         <div className={cn(
                           "h-6 w-6 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                           location.pathname === item.path ? "text-indigo-600" : "text-muted-foreground/60 group-hover:text-indigo-600"
                         )}>
                           <item.icon size={20} strokeWidth={2} />
                         </div>
                         {!isCollapsed && (
                           <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center justify-between flex-1 overflow-hidden"
                           >
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-black uppercase tracking-widest truncate">{item.label}</span>
                                {item.aiBadge && (
                                  <span className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[8px] tracking-widest font-black uppercase">
                                    AI
                                  </span>
                                )}
                              </div>
                              {item.badge && (
                                <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                   {item.badge}
                                </span>
                              )}
                           </motion.div>
                         )}
                         {location.pathname === item.path && (
                            <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-full" />
                         )}
                      </Link>
                    ))}
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border shrink-0 space-y-2">
        <Link 
          to="/settings"
          className={cn(
             "group relative flex items-center gap-4 p-3 rounded-[1.25rem] transition-all duration-300 border border-transparent",
             location.pathname === '/settings' 
               ? "bg-indigo-600/10 text-indigo-600 border-indigo-600/20 shadow-sm" 
               : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground hover:border-border/60"
          )}
        >
           <div className={cn(
             "h-6 w-6 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
             location.pathname === '/settings' ? "text-indigo-600" : "text-muted-foreground/60 group-hover:text-indigo-600"
           )}>
             <Settings01Icon size={20} />
           </div>
           {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest truncate">Settings</span>}
        </Link>
        <button 
          onClick={() => {
            if (onLogout) onLogout();
          }}
          className="w-full flex items-center gap-4 p-3 rounded-2xl bg-secondary/50 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-all group border border-transparent hover:border-rose-500/20"
        >
          <div className="h-6 w-6 flex items-center justify-center shrink-0">
            <Logout01Icon size={20} />
          </div>
          {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em] truncate">Logout</span>}
        </button>
      </div>
    </motion.aside>
   </>
  )
}
