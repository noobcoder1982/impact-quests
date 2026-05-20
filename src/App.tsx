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

  return (
    <>
      {/* ── Falling dropdown panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="nav-dropdown"
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="md:hidden fixed top-0 inset-x-0 z-[55] bg-background border-b-4 border-foreground flex flex-col max-h-[82vh] overflow-y-auto"
            style={{ boxShadow: '0px 8px 0px hsl(var(--p))' }}
          >
            {/* Grid Overlay background */}
            <div 
              className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(120, 120, 120, 0.4) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(120, 120, 120, 0.4) 1px, transparent 1px)
                `,
                backgroundSize: '2rem 2rem',
              }}
            />

            {/* Header / Title bar with safe top-padding for mobile statusbars */}
            <div className="flex items-center justify-between px-6 pt-10 pb-4 border-b-2 border-foreground bg-secondary/20 relative z-10">
              <p className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-foreground">[ SYSTEM_CORE: NAVIGATE ]</p>
              <button
                onClick={() => setOpen(false)}
                className="px-2.5 py-1 bg-zinc-950 text-white font-mono text-[9px] border-2 border-foreground uppercase hover:bg-rose-500 transition-colors cursor-pointer"
              >
                CLOSE
              </button>
            </div>

            {/* Core 4 — Beautiful 2x2 grid array separated by thick outlines */}
            <div className="grid grid-cols-2 gap-0 border-b-2 border-foreground divide-y-2 divide-x-2 divide-foreground bg-background relative z-10">
              {coreLinks.map((link, i) => {
                const isActive = location.pathname === link.path;
                return (
                  <motion.button
                    key={link.path}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 350, damping: 25 }}
                    onClick={() => handleNav(link.path)}
                    className={cn(
                      "flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer transition-colors relative hover:bg-secondary/30",
                      isActive ? "bg-[hsl(var(--p))] text-white" : "bg-card text-foreground"
                    )}
                  >
                    {/* Active corner tag */}
                    {isActive && (
                      <span className="absolute top-2 right-2 font-mono text-[6px] uppercase tracking-widest border border-white/40 px-1 py-0.2 bg-white/10 text-white">
                        ACTIVE
                      </span>
                    )}
                    <div className={cn(
                      "h-10 w-10 border-2 border-foreground flex items-center justify-center mb-2.5 transition-transform",
                      isActive ? "bg-white text-[hsl(var(--p))]" : "bg-secondary text-foreground"
                    )}>
                      <link.icon size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-wider font-sans leading-none">{link.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Secondary — 2-col compact grid separated by standard neo outlines */}
            <div className="grid grid-cols-2 gap-0 divide-y divide-x divide-foreground bg-background border-b border-foreground relative z-10">
              {secondaryLinks.map((link, i) => {
                const isActive = location.pathname === link.path;
                return (
                  <motion.button
                    key={link.path}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.03, type: 'spring', stiffness: 350, damping: 25 }}
                    onClick={() => handleNav(link.path)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/30",
                      isActive 
                        ? "bg-[hsl(var(--p))]/10 text-[hsl(var(--p))]" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "h-6 w-6 border border-foreground flex items-center justify-center shrink-0",
                      isActive ? "bg-[hsl(var(--p))]/20 text-[hsl(var(--p))]" : "bg-secondary text-muted-foreground"
                    )}>
                      <link.icon size={12} />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider leading-none flex-1 truncate">{link.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Logout Row */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 350, damping: 25 }}
              className="p-4 bg-secondary/15 relative z-10"
            >
              <button
                onClick={() => { setOpen(false); onLogout(); }}
                className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white border-2 border-foreground font-mono text-xs font-black uppercase tracking-widest transition-all shadow-[4px_4px_0px_#000] active:scale-95 active:shadow-none"
              >
                Sign Out / End Protocol
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop tap-to-close with glassmorphism blur */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="nav-backdrop"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="md:hidden fixed inset-0 z-[54] bg-background/50 backdrop-blur-md"
          />
        )}
      </AnimatePresence>

      {/* ── Floating pill ── */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30, delay: 0.1 }}
        className="md:hidden fixed bottom-6 inset-x-0 z-[60] flex justify-center pointer-events-none"
      >
        <div className="flex items-center bg-foreground rounded-full px-2 py-2 gap-1 shadow-[0_8px_32px_rgba(0,0,0,0.25)] pointer-events-auto">
          {coreLinks.map((link, i) => {
            const isActive = !open && location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => open && setOpen(false)}
                className={cn(
                  "relative flex items-center justify-center rounded-full transition-all duration-200",
                  isActive
                    ? "bg-background text-foreground w-12 h-12"
                    : "text-background/50 w-11 h-11 hover:text-background"
                )}
              >
                <link.icon size={isActive ? 20 : 18} />
                {isActive && (
                  <motion.div
                    layoutId="pill-active"
                    className="absolute inset-0 rounded-full bg-background"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
              </Link>
            );
          })}

          {/* Separator */}
          <div className="w-px h-5 bg-background/20 mx-1" />

          {/* Menu toggle */}
          <motion.button
            onClick={() => setOpen(v => !v)}
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="flex items-center justify-center w-11 h-11 rounded-full text-background/60 hover:text-background transition-colors"
          >
            <Menu size={18} />
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}

function InfiniteWheel({ navItems, location, onSelect }: { navItems: any[], location: any, onSelect: () => void }) {
  const y = useMotionValue(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const velocityRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  
  const itemHeight = 110; 
  const totalItemsHeight = navItems.length * itemHeight;

  // Wrap y infinitely
  React.useEffect(() => {
    return y.onChange((latest) => {
      if (latest > 0) y.set(latest - totalItemsHeight);
      else if (latest < -totalItemsHeight) y.set(latest + totalItemsHeight);
    });
  }, [totalItemsHeight, y]);

  // Inertia loop — runs while there is velocity
  const startInertia = React.useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const loop = () => {
      velocityRef.current *= 0.88; // friction — lower = stops faster
      if (Math.abs(velocityRef.current) < 0.1) {
        velocityRef.current = 0;
        return;
      }
      y.set(y.get() + velocityRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [y]);

  // Wheel → add to velocity, let inertia carry it
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      velocityRef.current -= e.deltaY * 0.18;
      startInertia();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startInertia]);

  const displayItems = [...navItems, ...navItems, ...navItems];

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden">
      <motion.div
        drag="y"
        dragConstraints={{ top: -Infinity, bottom: Infinity }}
        dragElastic={0}
        dragMomentum={false}
        style={{ y }}
        onDrag={(_, info) => {
          velocityRef.current = info.delta.y * 2;
        }}
        onDragEnd={() => startInertia()}
        className="flex flex-col items-stretch w-full cursor-grab active:cursor-grabbing select-none"
      >
        {displayItems.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={`${item.name}-${i}`}
              style={{ height: itemHeight }}
              className="flex flex-col justify-center border-b border-white/10 mx-8"
            >
              <Link
                to={item.path}
                onClick={onSelect}
                className={cn(
                  "flex items-center justify-between text-5xl md:text-8xl font-black tracking-tighter uppercase transition-all duration-500 py-4 group/item",
                  isActive ? "text-orange-500" : "text-white/10 hover:[text-shadow:0_0_1px_white] hover:text-transparent hover:[-webkit-text-stroke:1.5px_white]"
                )}
              >
                <span className="transition-transform duration-500 will-change-transform group-hover/item:translate-x-8">{item.name}</span>
                {isActive && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <ArrowRight size={32} strokeWidth={2} className="text-orange-500" />
                  </motion.div>
                )}
              </Link>
            </motion.div>
          );
        })}
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
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col overflow-hidden text-white pt-20"
          >
            {/* Infinite Wheel List with List Item UI */}
            <div className="flex-1 relative overflow-hidden flex flex-col justify-start mt-4">
               {/* Edge Masks */}
               <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-zinc-950 to-transparent z-20 pointer-events-none" />
               <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-zinc-950 to-transparent z-20 pointer-events-none" />

               <div className="h-full">
                  <InfiniteWheel navItems={navItems} location={location} onSelect={() => setIsMobileMenuOpen(false)} />
               </div>
            </div>

            {/* Menu Footer Redesign - Image Inspired */}
            <div className="mt-auto relative z-10 border-t border-white/10">
               {/* Info Strip */}
               <div className="px-8 py-4 flex items-center justify-between text-white/20 text-[9px] font-black uppercase tracking-[0.4em] border-b border-white/5">
                  <span>2026</span>
                  <div className="flex gap-6">
                     <span className="cursor-pointer hover:text-white transition-colors">Privacy</span>
                     <span className="cursor-pointer hover:text-white transition-colors">Terms</span>
                  </div>
               </div>

               {/* Auth Bar */}
               <div className="border-t border-white/10 grid grid-cols-2 h-20 bg-zinc-950">
                  <Link 
                     to="/signin" 
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="flex items-center justify-center border-r border-white/10 text-xl font-medium tracking-tighter uppercase hover:bg-white/5 transition-colors"
                  >
                     Log In
                  </Link>
                  <Link 
                     to="/signin" 
                     onClick={() => setIsMobileMenuOpen(false)}
                     className="flex items-center justify-center text-xl font-medium tracking-tighter uppercase hover:bg-white/5 transition-colors"
                  >
                     Sign Up
                  </Link>
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
