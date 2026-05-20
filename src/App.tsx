import * as React from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Routes, Route, Link, useLocation, useNavigate, Navigate, Outlet } from "react-router-dom"
import { Button } from "./components/ui/button"
import Home from "./components/Home"
import Marketplace from "./components/Marketplace"
import DashboardPage from './components/DashboardPage';
import PlannerPage from './components/PlannerPage';
import GroupsPage from "./components/GroupsPage"
import ChatPage from "./components/ChatPage"
import ProfilePage from "./components/ProfilePage"
import SignInPage from "./components/SignInPage"
import AboutPage from "./components/AboutPage"
import ContactPage from "./components/ContactPage"
import Sidebar from "./components/Sidebar"
import SettingsPage from "./components/SettingsPage"
import AlertsPage from "./components/AlertsPage"
import MapIntelligencePage from "./components/MapIntelligencePage"
import MissionLab from "./components/MissionLab"
import InventoryCenter from "./components/InventoryCenter"
import InventoryPage from "./components/InventoryPage"
import ResourcesPage from "./components/ResourcesPage"
import ContributionsPage from "./components/ContributionsPage"
import AchievementsPage from "./components/AchievementsPage"
import ImpactScorePage from "./components/ImpactScorePage"
import TeamMissionsPage from "./components/TeamMissionsPage"
import AssignmentsPage from "./components/AssignmentsPage"
import AIChatPage from "./components/AIChatPage"
import GenericMissionPage from "./components/GenericMissionPage"
import ActivityLogPage from "./components/ActivityLogPage"
import FeaturesPage from "./components/FeaturesPage"
import LoadingScreen from "./components/LoadingScreen"
import PricingPage from "./components/PricingPage"
import ChangelogPage from "./components/ChangelogPage"
import EnergyDashboardPage from "./components/EnergyDashboardPage"
import AdminPanel from "./components/AdminPanel"
import NgoVerificationPage from "./components/NgoVerificationPage"
import NotFoundPage from "./components/NotFoundPage"
import { AnimatedThemeToggler } from "./components/ui/animated-theme-toggler"
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext"
import { ThemeProvider, useTheme } from "./contexts/ThemeContext"
import { TerminationProvider, useTermination } from "./contexts/TerminationContext"
import { 
  FlashIcon as Zap, 
  Shield01Icon as Shield, 
  Target01Icon as Target, 
  Notification01Icon as Bell, 
  DocumentCodeIcon as FileText, 
  FavouriteIcon as Heart, 
  Logout01Icon as LogOut,
  DashboardCircleIcon,
  ShoppingBasket01Icon,
  UserIcon,
  Settings01Icon,
  Menu01Icon as Menu,
  Cancel01Icon as Close,
  Search01Icon as Search,
  ArrowRight01Icon as ArrowRight,
  AiChat01Icon as BotIcon,
  Location01Icon as MapPinIcon,
  PackageIcon as PackageIcon,
  Comment01Icon as ChatIcon,
  TaskEdit01Icon as TaskIcon,
  CpuIcon as CpuIconNav,
} from "hugeicons-react"
// aliases for MobileNav readability
const LogoutIconNav = LogOut;
const MarketIcon = ShoppingBasket01Icon;
const FlashIconNav = Zap;
import { cn } from "@/lib/utils"

function AppLayout({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
      <MobileNav onLogout={onLogout} />
    </div>
  );
}

function MobileNav({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isVolunteer = user?.role === 'volunteer';
  const isNgo = user?.role === 'ngo';
  const isCustomer = user?.role === 'customer';

  // The 4 core pill buttons (always visible)
  const coreLinks = [
    { icon: DashboardCircleIcon, path: "/dashboard", label: "Hub" },
    { icon: BotIcon,             path: "/ai-console", label: "AI" },
    { icon: UserIcon,            path: "/profile",    label: "Profile" },
    { icon: Settings01Icon,      path: "/settings",   label: "Settings" },
  ];

  // Secondary links shown in the expanded overlay
  const secondaryLinks = [
    { icon: MarketIcon,   path: "/marketplace",  label: "Marketplace",    show: !isCustomer },
    { icon: MapPinIcon,   path: "/map",           label: "Strategic Map",  show: !isCustomer },
    { icon: PackageIcon,  path: "/inventory",     label: "Inventory",      show: true },
    { icon: ChatIcon,     path: "/chat",          label: "Messages",       show: !isCustomer },
    { icon: TaskIcon,     path: "/assignments",   label: "Assignments",    show: isVolunteer },
    { icon: FlashIconNav, path: "/impact-score",  label: "Impact Score",   show: isVolunteer },
    { icon: CpuIconNav,   path: "/mission-lab",   label: "Mission Lab",    show: isNgo },
  ].filter(l => l.show);

  const handleNav = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  // Which core link is active
  const activeCoreIndex = coreLinks.findIndex(l => location.pathname === l.path);

  // Merge all links into a single, beautifully structured array for the Swiss Bento Grid
  const allLinks = [
    { 
      icon: DashboardCircleIcon, 
      path: "/dashboard", 
      label: "Hub", 
      span: "col-span-2", 
      height: "h-[120px]", 
      desc: "Global coordination & operational centre", 
      show: true,
      customBg: "bg-zinc-900/40 border-zinc-900 hover:border-zinc-800/80 hover:bg-zinc-900/60",
      accent: "text-orange-500",
      telemetry: (
        <div className="flex flex-col gap-1.5 w-full mt-2 select-none">
          <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
            <span>Global Sync</span>
            <span className="text-orange-500 font-bold">98.4%</span>
          </div>
          <div className="w-full bg-zinc-950/60 rounded-full h-1 overflow-hidden border border-zinc-900/40 relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "98.4%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-orange-500 h-full rounded-full"
            />
          </div>
        </div>
      )
    },
    { 
      icon: BotIcon, 
      path: "/ai-console", 
      label: "AI Console", 
      span: "col-span-1", 
      height: "h-[128px]", 
      show: true,
      customBg: "gemini-gradient-bg gemini-gradient-border border-transparent bg-zinc-950/20 hover:bg-zinc-900/10",
      accent: "text-purple-450",
      telemetry: (
        <div className="flex flex-col gap-1 w-full mt-1.5 select-none font-sans">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-slow-pulse" />
            <span className="font-mono text-[8px] text-purple-400/80 uppercase tracking-wider font-semibold">COGNITION</span>
          </div>
          <span className="text-[8px] font-mono text-zinc-650 uppercase tracking-wide leading-tight mt-0.5">
            NLP Core Ready
          </span>
        </div>
      )
    },
    { 
      icon: MarketIcon, 
      path: "/marketplace",  
      label: "Market",    
      span: "col-span-1",    
      height: "h-[128px]",
      show: !isCustomer,
      customBg: "bg-zinc-950 border-zinc-900/80 hover:border-zinc-800/80 hover:bg-zinc-900/20",
      accent: "text-emerald-400",
      telemetry: (
        <div className="flex flex-col gap-1 w-full mt-1.5 select-none">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[8px] text-zinc-600 uppercase tracking-wider">MARKET STATE</span>
            <span className="font-mono text-[8px] text-emerald-400 font-bold bg-emerald-950/40 px-1 py-0.5 rounded border border-emerald-900/30">OPEN</span>
          </div>
          <span className="text-[8px] font-mono text-zinc-650 uppercase tracking-wide leading-tight">
            14 items online
          </span>
        </div>
      )
    },
    { 
      icon: MapPinIcon, 
      path: "/map",           
      label: "Strategic Map",  
      span: "col-span-1",  
      height: "h-[112px]",
      show: !isCustomer,
      customBg: "bg-zinc-950 border-zinc-900/80 hover:border-zinc-800/80 hover:bg-zinc-900/20",
      accent: "text-sky-400",
      telemetry: (
        <div className="flex flex-col gap-0.5 w-full mt-2 font-mono text-[7.5px] text-zinc-550 leading-none select-none">
          <span>LAT 40.7128° N</span>
          <span>LON 74.0060° W</span>
        </div>
      )
    },
    { 
      icon: PackageIcon, 
      path: "/inventory",     
      label: "Inventory",      
      span: "col-span-1",      
      height: "h-[112px]",
      show: true,
      customBg: "bg-zinc-950 border-zinc-900/80 hover:border-zinc-800/80 hover:bg-zinc-900/20",
      accent: "text-amber-400",
      telemetry: (
        <div className="flex flex-col gap-0.5 w-full mt-2 select-none">
          <div className="flex items-center justify-between text-[8px] font-mono text-zinc-650 uppercase">
            <span>Secure Vault</span>
            <span className="text-amber-500 font-semibold">3 Units</span>
          </div>
        </div>
      )
    },
    { 
      icon: ChatIcon,     
      path: "/chat",          
      label: "Messages",       
      span: "col-span-1",       
      height: "h-[112px]",
      show: !isCustomer,
      customBg: "bg-zinc-950 border-zinc-900/80 hover:border-zinc-800/80 hover:bg-zinc-900/20",
      accent: "text-rose-400",
      telemetry: (
        <div className="flex items-center gap-1.5 mt-2 select-none">
          <span className="h-1 w-1 rounded-full bg-rose-500 animate-slow-pulse" />
          <span className="font-mono text-[8px] text-rose-400 uppercase tracking-wider font-semibold">SECURE NODE</span>
        </div>
      )
    },
    { 
      icon: TaskIcon,     
      path: "/assignments",   
      label: "Assignments",    
      span: "col-span-1",    
      height: "h-[112px]",
      show: isVolunteer,
      customBg: "bg-zinc-950 border-zinc-900/80 hover:border-zinc-800/80 hover:bg-zinc-900/20",
      accent: "text-yellow-500",
      telemetry: (
        <div className="flex items-center justify-between w-full mt-2 select-none">
          <span className="font-mono text-[8px] text-zinc-600 uppercase tracking-wider">ACTIVE PLAN</span>
          <span className="font-mono text-[8px] text-yellow-500 font-bold bg-yellow-950/40 px-1 py-0.5 rounded border border-yellow-900/30">2</span>
        </div>
      )
    },
    { 
      icon: FlashIconNav, 
      path: "/impact-score",  
      label: "Impact Score",   
      span: "col-span-1",   
      height: "h-[128px]",
      show: isVolunteer,
      customBg: "bg-gradient-to-tr from-amber-950/10 via-zinc-950 to-zinc-950 border-amber-950/20 hover:border-amber-900/30",
      accent: "text-amber-500",
      telemetry: (
        <div className="flex flex-col gap-1.5 w-full mt-2 select-none">
          <div className="flex items-center justify-between text-[7.5px] font-mono text-zinc-550 uppercase tracking-wider">
            <span>Level 4</span>
            <span>90% XP</span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
            <div className="bg-amber-500 h-full w-[90%]" />
          </div>
        </div>
      )
    },
    { 
      icon: CpuIconNav,   
      path: "/mission-lab",   
      label: "Mission Lab",    
      span: "col-span-1",    
      height: "h-[112px]",
      show: isNgo,
      customBg: "bg-zinc-950 border-zinc-900/80 hover:border-zinc-800/80 hover:bg-zinc-900/20",
      accent: "text-cyan-400",
      telemetry: (
        <div className="flex items-center justify-between w-full mt-2 select-none">
          <span className="font-mono text-[8px] text-zinc-600 uppercase tracking-wider">CREATOR NODE</span>
        </div>
      )
    },
    { 
      icon: UserIcon,    
      path: "/profile",    
      label: "Profile",    
      span: "col-span-1",    
      height: "h-[112px]",
      show: true,
      customBg: "bg-zinc-950 border-zinc-900/80 hover:border-zinc-800/80 hover:bg-zinc-900/20",
      accent: "text-indigo-400",
      telemetry: (
        <div className="flex items-center justify-between w-full mt-2 select-none">
          <span className="font-mono text-[8px] text-zinc-600 uppercase tracking-wider">OPERATIVE</span>
        </div>
      )
    },
    { 
      icon: Settings01Icon, 
      path: "/settings",   
      label: "Settings",   
      span: "col-span-1",   
      height: "h-[112px]",
      show: true,
      customBg: "bg-zinc-950 border-zinc-900/80 hover:border-zinc-800/80 hover:bg-zinc-900/20",
      accent: "text-zinc-400",
      telemetry: (
        <div className="flex items-center justify-between w-full mt-2 select-none">
          <span className="font-mono text-[8px] text-zinc-650 uppercase tracking-wider">SYSTEM CONFIG</span>
        </div>
      )
    },
  ].filter(l => l.show);
  // Animation variants for the high-end Swiss curtain reveal
  const dropdownVariants = {
    hidden: {
      clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
      y: -10,
      opacity: 0.95
    },
    show: {
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.035,
        delayChildren: 0.05
      }
    },
    exit: {
      clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
      y: -15,
      opacity: 0.9,
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.015,
        staggerDirection: -1
      }
    }
  };

  const linkVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.45, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    },
    exit: { 
      y: 10, 
      opacity: 0, 
      transition: { 
        duration: 0.25, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    }
  };

  return (
    <>      {/* ── Falling dropdown panel ── */}
    <AnimatePresence>
      {open && (
        <motion.div
          key="nav-dropdown"
          variants={dropdownVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="md:hidden fixed top-0 inset-x-0 z-[55] bg-zinc-950 text-white flex flex-col max-h-[85vh] border-b border-zinc-900 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-b-[2rem] pt-6"
        >
          {/* Grid background for subtle blueprint aesthetic */}
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

          {/* Premium Swiss Header Slot */}
          <div className="flex items-center justify-between px-6 pt-6 pb-3 border-b border-zinc-900/60 relative z-10 select-none">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-white">Navigation</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                  {user?.name ? `${user.name.split(" ")[0]} // ${user.role || 'Guest'}` : 'Guest Session'}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="font-mono text-[9px] tracking-wider uppercase text-zinc-550 hover:text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          {/* Core & Secondary Unified Bento Grid */}
          <div className="flex-1 overflow-y-auto px-6 py-5 z-10 relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`
              .flex-1::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="grid grid-cols-2 gap-2.5">
              {allLinks.map((link, idx) => {
                const isActive = location.pathname === link.path;
                const numStr = String(idx + 1).padStart(2, '0');
                const isWide = link.span === "col-span-2";

                return (
                  <motion.button
                    key={link.path}
                    variants={linkVariants}
                    onClick={() => handleNav(link.path)}
                    className={cn(
                      "group relative flex flex-col justify-between p-4 border rounded-2xl transition-all duration-300 text-left cursor-pointer overflow-hidden",
                      link.span,
                      link.height,
                      isActive
                        ? "bg-zinc-900 border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.06)]"
                        : link.customBg || "bg-zinc-950 border-zinc-900/80 hover:border-zinc-800/80 hover:bg-zinc-900/20"
                    )}
                  >
                    {/* Blueprint dot matrix in wide items */}
                    {isWide && (
                      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                           style={{
                             backgroundImage: `radial-gradient(currentColor 1.5px, transparent 1.5px)`,
                             backgroundSize: '10px 10px'
                           }}
                      />
                    )}

                    {/* Top bar inside the Bento Cell */}
                    <div className="w-full flex items-center justify-between relative z-10">
                      <span className="font-mono text-[9px] text-zinc-650 tracking-wider font-light">
                        {numStr}
                      </span>
                      <link.icon 
                        size={15} 
                        className={cn(
                          "transition-colors duration-300",
                          isActive ? "text-orange-500" : (link.accent || "text-zinc-500 group-hover:text-zinc-350")
                        )} 
                      />
                    </div>

                    {/* Bottom / Text content inside the Bento Cell */}
                    <div className="w-full flex flex-col mt-auto relative z-10">
                      <div className="w-full flex items-baseline justify-between">
                        <span className={cn(
                          "text-xs font-semibold tracking-tight transition-colors duration-300",
                          isActive ? "text-white" : "text-zinc-450 group-hover:text-white"
                        )}>
                          {link.label}
                        </span>

                        {isActive && (
                          <motion.span 
                            layoutId="mobile-swiss-active-dot"
                            className="h-1.5 w-1.5 rounded-full bg-orange-500" 
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          />
                        )}
                      </div>

                      {/* Custom telemetry or description inside the Bento Cell */}
                      {link.telemetry ? (
                        link.telemetry
                      ) : (
                        isWide && link.desc && (
                          <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-wider mt-1 block truncate">
                            {link.desc}
                          </span>
                        )
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

            {/* Footer details & Sign out */}
            <div className="mt-auto px-6 pt-4 pb-6 border-t border-zinc-900/80 bg-zinc-950 relative z-10 flex flex-col gap-4 text-white">
              <div className="flex items-center justify-between text-zinc-550 text-[9px] font-mono tracking-wider uppercase">
                <span>2026 impactquest</span>
                <span>system v2.0.4</span>
              </div>

              <button
                onClick={() => { setOpen(false); onLogout(); }}
                className="w-full py-2.5 bg-zinc-900 hover:bg-rose-950/20 hover:text-rose-450 border border-zinc-800 hover:border-rose-900/40 rounded-xl text-zinc-400 hover:text-white font-mono text-[10px] font-bold uppercase tracking-widest transition-all duration-300 active:scale-[0.98]"
              >
                Sign Out / Terminate Node
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop tap-to-close with glassmorphism blur */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="nav-backdrop"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }} 
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            onClick={() => setOpen(false)}
            className="md:hidden fixed inset-0 z-[54] bg-black/60"
          />
        )}
      </AnimatePresence>

      {/* ── Docked Bottom Swiss Nav Console ── */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.05 }}
        className="md:hidden fixed bottom-0 inset-x-0 z-[60] bg-zinc-950/95 backdrop-blur-2xl border-t border-zinc-900 flex flex-col justify-end shadow-[0_-8px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="h-[68px] flex items-center justify-between w-full max-w-md mx-auto relative px-3">
          {coreLinks.map((link, i) => {
            const isActive = !open && location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => open && setOpen(false)}
                className="relative flex flex-col items-center justify-center flex-1 h-full py-1 text-center group transition-colors duration-200"
              >
                {/* Precision Active Top Bar Accent */}
                {isActive && (
                  <motion.div
                    layoutId="swiss-nav-top-line"
                    className="absolute top-0 inset-x-3.5 h-[2.5px] bg-orange-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                <div className="flex flex-col items-center gap-1 mt-1">
                  <link.icon 
                    size={17} 
                    className={cn(
                      "transition-all duration-200",
                      isActive 
                        ? "text-orange-500 scale-[1.05]" 
                        : "text-zinc-550 group-hover:text-zinc-300"
                    )} 
                  />
                  <span 
                    className={cn(
                      "font-sans text-[8.5px] font-bold uppercase tracking-wider transition-colors duration-200",
                      isActive 
                        ? "text-white" 
                        : "text-zinc-550 group-hover:text-zinc-400"
                    )}
                  >
                    {link.label}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Blueprint Vertical Separator */}
          <div className="w-px h-6 bg-zinc-900 mx-1 shrink-0 self-center" />

          {/* Menu Toggle */}
          <button
            onClick={() => setOpen(v => !v)}
            className={cn(
              "relative flex flex-col items-center justify-center w-14 h-full py-1 group transition-colors duration-200 shrink-0"
            )}
          >
            {/* Precision Active Top Bar Accent for Menu Open State */}
            {open && (
              <motion.div
                layoutId="swiss-nav-top-line"
                className="absolute top-0 inset-x-3.5 h-[2.5px] bg-orange-500 rounded-full"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            
            <div className="flex flex-col items-center gap-1 mt-1">
              <motion.div
                animate={{ rotate: open ? 45 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                className={cn(
                  "transition-colors duration-200",
                  open ? "text-orange-500" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              >
                <Menu size={17} />
              </motion.div>
              <span 
                className={cn(
                  "font-sans text-[8.5px] font-bold uppercase tracking-wider transition-colors duration-200",
                  open ? "text-white" : "text-zinc-550 group-hover:text-zinc-400"
                )}
              >
                {open ? "Close" : "Menu"}
              </span>
            </div>
          </button>
        </div>
        
        {/* Device Safe Area padding at bottom */}
        <div className="h-[env(safe-area-inset-bottom)] bg-zinc-950" />
      </motion.div>
    </>
  );
}

function SwissDesignNav({ 
  navItems, 
  location, 
  onSelect,
  isAuthenticated 
}: { 
  navItems: any[], 
  location: any, 
  onSelect: () => void,
  isAuthenticated: boolean
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1] 
      } 
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto pb-8 select-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style>{`
        .w-full::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Navigation Items List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col w-full px-6 md:px-12 pt-4 space-y-4"
      >
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          const numStr = String(idx + 1).padStart(2, '0');
          return (
            <motion.div
              key={`${item.name}-${idx}`}
              variants={itemVariants}
              className="border-b border-zinc-900/40 last:border-b-0 pb-1"
            >
              <Link
                to={item.path}
                onClick={onSelect}
                className="flex items-baseline justify-between py-2 group/item w-full relative overflow-hidden"
              >
                <div className="flex items-baseline gap-6">
                  {/* Fine Swiss-style Mono Index */}
                  <span className="font-mono text-xs text-zinc-500 font-light select-none w-6">
                    {numStr}
                  </span>
                  
                  {/* Clean Grotesque Heading */}
                  <span className={cn(
                    "text-3xl sm:text-4xl font-semibold tracking-tight transition-all duration-500 ease-out",
                    isActive 
                      ? "text-white translate-x-2" 
                      : "text-zinc-500 group-hover/item:text-white group-hover/item:translate-x-2"
                  )}>
                    {item.name}
                  </span>
                </div>

                {/* Subtitle / Active indicator */}
                <div className="flex items-center gap-3">
                  {isActive ? (
                    <motion.div 
                      layoutId="swiss-active-dot"
                      className="h-1.5 w-1.5 rounded-full bg-orange-500" 
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  ) : (
                    <ArrowRight 
                      size={14} 
                      className="text-zinc-700 opacity-0 group-hover/item:opacity-100 group-hover/item:text-zinc-400 transition-all duration-300 transform translate-x-[-4px] group-hover/item:translate-x-0" 
                    />
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Swiss Minimalist Status Area */}
      <motion.div 
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="px-6 md:px-12 mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {/* Left Column: Fine-printed Metadata */}
        <div className="flex flex-col gap-1.5 text-left border-t border-zinc-900/50 pt-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] tracking-wider text-zinc-450 uppercase font-medium">Node protocol active</span>
          </div>
          <p className="font-sans text-xs text-zinc-500 leading-relaxed max-w-xs">
            Global routing engine is fully operational. Open quests are synced to active coordination channels.
          </p>
        </div>

        {/* Right Column: Swiss minimalist CTA */}
        <div className="flex flex-col justify-end items-start sm:items-end border-t border-zinc-900/50 sm:border-t pt-4">
          <Link
            to={isAuthenticated ? "/dashboard" : "/signin"}
            onClick={onSelect}
            className="group/cta flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:text-orange-500 transition-colors duration-300"
          >
            <span>{isAuthenticated ? 'Launch dashboard' : 'Begin enrollment'}</span>
            <div className="h-7 w-7 rounded-full bg-zinc-900 group-hover/cta:bg-orange-500/10 flex items-center justify-center transition-all duration-300">
              <ArrowRight size={12} className="text-zinc-400 group-hover/cta:text-orange-500 transition-all duration-300 transform group-hover/cta:translate-x-0.5" />
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function Navbar({ isAuthenticated, onLogout }: { isAuthenticated: boolean, onLogout: () => void }) {
  const location = useLocation();
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isAppPage = location.pathname !== "/" && location.pathname !== "/about" && location.pathname !== "/contact" && location.pathname !== "/signin" && location.pathname !== "/features" && location.pathname !== "/resources" && location.pathname !== "/pricing";

  if (isAppPage) return null;

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
    { name: "Resources", path: "/resources" },
    { name: "About Us", path: "/about" },
    { name: "Pricing", path: "/pricing" },
    { name: "Changelog", path: "/changelog" },
    { name: "Contact", path: "/contact" }
  ];

  return (
    <>

      {/* Header Bar — all screen sizes */}
      <div className={cn(
        "fixed top-0 left-0 w-full z-[120] h-20 flex items-center justify-between px-6 md:px-10 transition-all duration-500",
        isMobileMenuOpen ? "bg-zinc-950" : "bg-background/80 backdrop-blur-2xl border-b border-border/10"
      )}>
        <Link to="/" className="flex items-center gap-2.5 z-[130]" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="h-8 w-8">
            <img src={isMobileMenuOpen || theme === 'dark' ? "/logo-white.png" : "/logo-black.png"} alt="ImpactQuest" className="h-full w-full object-contain" />
          </div>
          <span className={cn(
            "font-black text-xl tracking-tighter",
            isMobileMenuOpen ? "text-white" : "text-foreground"
          )}>ImpactQ</span>
        </Link>

        <div className="flex items-center gap-3 z-[130]">
          {!isMobileMenuOpen && (
            <>
              <AnimatedThemeToggler />
              {isAuthenticated && (
                <Link to="/dashboard" className="hidden sm:flex text-[11px] font-bold uppercase tracking-widest bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-all">
                  Dashboard
                </Link>
              )}
            </>
          )}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "h-11 w-11 flex items-center justify-center rounded-full transition-all duration-300",
              isMobileMenuOpen ? "text-white" : "text-foreground hover:bg-secondary"
            )}
          >
            {isMobileMenuOpen ? <Close size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Full-Screen Menu — all screen sizes */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col overflow-hidden text-white pt-20"
          >
            {/* 1. Structural Blueprint Grid Background */}
            <div 
              className="absolute inset-0 opacity-[0.02] pointer-events-none z-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255, 255, 255, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '3.5rem 3.5rem',
              }}
            />

            {/* Navigation List Container */}
            <div className="flex-1 relative z-10 overflow-hidden flex flex-col justify-start mt-4">
              <SwissDesignNav 
                navItems={navItems} 
                location={location} 
                onSelect={() => setIsMobileMenuOpen(false)} 
                isAuthenticated={isAuthenticated} 
              />
            </div>

            {/* Menu Footer Redesign - Image Inspired */}
            <div className="mt-auto relative z-10 border-t border-zinc-900">
               {/* Info Strip */}
               <div className="px-8 py-4 flex items-center justify-between text-zinc-500 text-[10px] font-medium tracking-[0.2em] uppercase border-b border-zinc-900/50">
                  <span>2026</span>
                  <div className="flex gap-6">
                     <span className="cursor-pointer hover:text-white transition-colors">Privacy</span>
                     <span className="cursor-pointer hover:text-white transition-colors">Terms</span>
                  </div>
               </div>

               {/* Auth Bar */}
               <div className="border-t border-zinc-900 grid grid-cols-2 h-20 bg-zinc-950">
                  {isAuthenticated ? (
                    <>
                      <Link 
                         to="/dashboard" 
                         onClick={() => setIsMobileMenuOpen(false)}
                         className="flex items-center justify-center border-r border-zinc-900 text-xs font-semibold uppercase tracking-wider hover:bg-zinc-900/20 text-zinc-300 hover:text-white transition-colors"
                      >
                         Dashboard
                      </Link>
                      <button 
                         onClick={() => {
                           setIsMobileMenuOpen(false);
                           onLogout();
                         }}
                         className="flex items-center justify-center text-xs font-semibold uppercase tracking-wider hover:bg-zinc-900/20 text-zinc-500 hover:text-rose-500 transition-colors"
                      >
                         Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                         to="/signin" 
                         onClick={() => setIsMobileMenuOpen(false)}
                         className="flex items-center justify-center border-r border-zinc-900 text-xs font-semibold uppercase tracking-wider hover:bg-zinc-900/20 text-zinc-300 hover:text-white transition-colors"
                      >
                         Log In
                      </Link>
                      <Link 
                         to="/signin" 
                         onClick={() => setIsMobileMenuOpen(false)}
                         className="flex items-center justify-center text-xs font-semibold uppercase tracking-wider hover:bg-zinc-900/20 text-zinc-300 hover:text-white transition-colors"
                      >
                         Sign Up
                      </Link>
                    </>
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

import OnboardingPage from "./components/OnboardingPage"

function App({ isAuthenticated, handleLogin, handleLogout }: { isAuthenticated: boolean, handleLogin: (user?: any) => void, handleLogout: () => void }) {
  const [user, setUser] = React.useState<any>(() => JSON.parse(localStorage.getItem('user') || '{}'));
  
  const isOnboardingRequired = React.useMemo(() => {
    if (!isAuthenticated || !user || Object.keys(user).length === 0) return false;
    
    // Admins always skip onboarding
    if (user.isAdmin || user.email === 'abhijeetpanda21@gmail.com') return false;

    const userRole = (user.role || '').toLowerCase();
    if (userRole !== 'volunteer') return false;

    // Force onboarding if bypassed, legacy, missing nickname, or selectedSkills are empty
    return (
      user.isOnboarded === false ||
      user.isOnboarded === undefined ||
      !user.nickname ||
      !user.selectedSkills ||
      user.selectedSkills.length === 0
    );
  }, [user, isAuthenticated]);

  React.useEffect(() => {
    const handleStorage = () => {
      setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    };
    window.addEventListener('storage', handleStorage);
    
    // Sync immediately when authentication state changes
    handleStorage();

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-white">
      <ScrollToTop />
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      
      <main>
        <Routes>
          <Route path="/" element={isAuthenticated ? (isOnboardingRequired ? <Navigate to="/onboarding" replace /> : <Navigate to="/dashboard" />) : <Home />} />
          <Route path="/onboarding" element={isAuthenticated ? <OnboardingPage /> : <Navigate to="/signin" />} />
          <Route path="/about" element={isAuthenticated ? (isOnboardingRequired ? <Navigate to="/onboarding" replace /> : <Navigate to="/dashboard" />) : <AboutPage />} />
          <Route path="/contact" element={isAuthenticated ? (isOnboardingRequired ? <Navigate to="/onboarding" replace /> : <Navigate to="/dashboard" />) : <ContactPage />} />
          <Route path="/signin" element={isAuthenticated ? (isOnboardingRequired ? <Navigate to="/onboarding" replace /> : <Navigate to="/dashboard" />) : <SignInPage onLogin={handleLogin} />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          
          {/* Main App Routes under parent AppLayout */}
          <Route 
            element={
              isAuthenticated ? (
                isOnboardingRequired ? (
                  <Navigate to="/onboarding" replace />
                ) : (
                  <AppLayout onLogout={handleLogout} />
                )
              ) : (
                <Navigate to="/signin" />
              )
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/mission-lab" element={<MissionLab />} />
            <Route path="/ai-console" element={<AIChatPage />} />
            <Route path="/map" element={<MapIntelligencePage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/quests" element={<Marketplace />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chatbot" element={<ChatPage />} />
            <Route path="/activity" element={<ActivityLogPage />} />
            <Route path="/contributions" element={<ContributionsPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/impact-score" element={<ImpactScorePage />} />
            <Route path="/team-missions" element={<TeamMissionsPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/energy" element={<EnergyDashboardPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/ngo-verify" element={<NgoVerificationPage />} />
          </Route>
          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Routes>
      </main>
    </div>
  )
}

function AppWrapper({ isAuthenticated, handleLogin, handleLogout }: { isAuthenticated: boolean, handleLogin: (user?: any) => void, handleLogout: () => void }) {
  const [isLoading, setIsLoading] = React.useState(true)

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <LoadingScreen key="loader" onComplete={() => setIsLoading(false)} />
      ) : (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen"
        >
          <App isAuthenticated={isAuthenticated} handleLogin={handleLogin} handleLogout={handleLogout} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Root() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    return !!localStorage.getItem('accessToken')
  })

  const handleLogin = (user?: any) => {
    setIsAuthenticated(true);
    window.dispatchEvent(new Event('storage'));
  }

  const handleLogout = React.useCallback(() => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    // Force user state update for App component
    window.dispatchEvent(new Event('storage'));
  }, []);

  React.useEffect(() => {
    const onUnauthorized = () => {
      handleLogout();
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);

    // Differentiate dev tab from live deployment
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      document.title = "🚧 [DEV] ImpactQuest";
    }

    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppWrapper isAuthenticated={isAuthenticated} handleLogin={handleLogin} handleLogout={handleLogout} />
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default Root
