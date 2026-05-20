import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup, type MapRef } from "./ui/map"
import "maplibre-gl/dist/maplibre-gl.css"
import { 
  Location01Icon as MapPin, 
  Search01Icon as Search, 
  FilterIcon as Filter, 
  ZapIcon as Zap, 
  CpuIcon as Cpu, 
  UserGroupIcon as Users, 
  AlertCircleIcon as Alert,
  ArrowRight01Icon as ChevronRight,
  Target01Icon as Target,
  CompassIcon as Compass
} from 'hugeicons-react'
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { apiRequest } from "../lib/api"
import { useTheme } from "../contexts/ThemeContext"

export default function MapIntelligencePage() {
  const { theme } = useTheme()
  const [tasks, setTasks] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [selectedZone, setSelectedZone] = React.useState<string | null>(null)
  const [userLocation, setUserLocation] = React.useState<[number, number] | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isSheetExpanded, setIsSheetExpanded] = React.useState(false)
  const mapRef = React.useRef<MapRef>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        if (mapRef.current) {
          mapRef.current.flyTo({ center: [parseFloat(lon), parseFloat(lat)], zoom: 13, essential: true });
        }
      }
    } catch (err) {
      console.error("Geocoding failed", err);
    }
  };

  React.useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error("Error getting location", error);
          setUserLocation([-122.4194, 37.7749]); // SF Fallback
        }
      );
    } else {
      setUserLocation([-122.4194, 37.7749]); // SF Fallback
    }
  }, []);

  React.useEffect(() => {
    const fetchTasks = async () => {
      try {
        // If we have user location, fetch nearby tasks
        if (userLocation) {
          const [lng, lat] = userLocation;
          const res = await apiRequest(`/tasks/nearby?lat=${lat}&lng=${lng}&radius=100&limit=50`)
          if (res.success) {
            setTasks(res.data.tasks || [])
          }
        } else {
          // Fallback to all tasks if no location
          const res = await apiRequest('/tasks')
          if (res.success) setTasks(res.data)
        }
      } catch (err) {
        console.error("Map data sync failed", err)
      } finally {
        setLoading(false)
      }
    }
    
    if (userLocation) {
      fetchTasks()
    }
  }, [userLocation])

  return (
    <div className="flex-1 h-screen flex flex-col bg-background overflow-hidden relative font-body selection:bg-indigo-500/10">
      
      {/* --- TOP TACTICAL OVERLAY --- */}
      <header className="absolute top-4 md:top-8 left-4 md:left-8 right-4 md:right-8 z-30 flex flex-col md:flex-row justify-between items-start md:items-start gap-4 pointer-events-none">
        <div className="space-y-2 pointer-events-auto">
          <div className="flex items-center gap-4 p-2 pl-3 pr-6 bg-background/80 backdrop-blur-2xl border border-border/50 rounded-[2rem] shadow-2xl">
             <div className="h-12 w-12 rounded-[1.25rem] bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Compass className="h-6 w-6" />
             </div>
             <div>
               <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">Command Map</h1>
               <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Strategic Hub</p>
             </div>
          </div>
        </div>

        <div className="flex gap-2 md:gap-3 pointer-events-auto w-full md:w-auto">
           <div className="h-14 md:h-16 bg-background/80 backdrop-blur-2xl border border-border/50 rounded-[2rem] px-5 flex items-center gap-3 shadow-2xl overflow-hidden flex-1 md:w-[320px] transition-all focus-within:ring-2 focus-within:ring-primary/50">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input 
                 type="text" 
                 placeholder="Search sector or coordinates..."
                 className="bg-transparent border-none outline-none text-sm w-full h-full text-foreground placeholder:text-muted-foreground/60 font-medium"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
           </div>
           <Button onClick={handleSearch} className="h-14 md:h-16 w-14 md:w-16 rounded-[2rem] bg-foreground text-background shadow-2xl hover:scale-105 transition-all touch-target border border-border/10">
              <Compass className="h-6 w-6" />
           </Button>
        </div>
      </header>


      {/* --- INTERACTIVE TACTICAL MAP CANVAS --- */}
      <div className="flex-1 relative bg-background overflow-hidden group/map">
         {userLocation && (
           <Map
             ref={mapRef}
             center={userLocation}
             zoom={11}
             className="w-full h-full"
             theme={theme === 'dark' ? 'dark' : 'light'}
           >
             <MapControls 
                position={window.innerWidth < 768 ? "bottom-right" : "bottom-left"} 
                showCompass 
                showZoom 
                showLocate 
              />
             
             {/* --- MISSION PINS (LIVE DATA) --- */}
             {!loading && tasks.slice(0, 50).map((task, i) => {
               // Use real coordinates from task location
               const lng = task.location?.coordinates?.[0] || userLocation[0];
               const lat = task.location?.coordinates?.[1] || userLocation[1];
               
               // Skip tasks with invalid coordinates (0, 0)
               if (lng === 0 && lat === 0) return null;
             
              return (
               <MapMarker key={task._id} longitude={lng} latitude={lat}>
                 <MarkerContent>
                   <div className="relative cursor-pointer hover:scale-125 transition-transform group/pin">
                      <MapPin className={cn(
                        "h-8 w-8 drop-shadow-xl",
                        task.priority === 'Critical' ? 'text-rose-500' : 
                        task.priority === 'High' ? 'text-orange-500' : 'text-emerald-500'
                      )} />
                      <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-indigo-600 border-2 border-slate-900 flex items-center justify-center shadow-lg">
                         <Zap className="h-2 w-2 text-white" />
                      </div>
                   </div>
                 </MarkerContent>
                 
                 <MarkerPopup closeButton offset={25} className="w-72 p-0 overflow-hidden bg-card border-border rounded-2xl shadow-2xl">
                    <div className={cn(
                      "relative h-24 overflow-hidden",
                      task.priority === 'Critical' ? 'bg-gradient-to-br from-rose-500/20 via-rose-500/5 to-transparent' : 
                      task.priority === 'High' ? 'bg-gradient-to-br from-orange-500/20 via-orange-500/5 to-transparent' : 
                      'bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent'
                    )}>
                       <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)] dark:[mask-image:linear-gradient(0deg,transparent,white)]" />
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
                          <Target className="h-20 w-20 text-foreground" />
                       </div>
                       <div className="absolute bottom-3 left-4">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm border flex items-center gap-1.5",
                            task.priority === 'Critical' ? 'bg-rose-500 text-white border-rose-400' : 
                            task.priority === 'High' ? 'bg-orange-500 text-white border-orange-400' : 
                            'bg-emerald-500 text-white border-emerald-400'
                          )}>
                            <Alert className="h-3 w-3" /> {task.priority} Priority
                          </span>
                       </div>
                    </div>
                    <div className="p-5 space-y-4">
                       <div>
                          <p className="text-base font-black leading-tight text-foreground">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5 font-medium">
                            <Compass className="h-3.5 w-3.5 opacity-70" /> {task.location || 'Coordinates Encrypted'}
                          </p>
                       </div>
                       
                       <div className="flex justify-between items-center pt-4 border-t border-border">
                          <div className="flex items-center gap-3">
                             <div className="flex -space-x-2">
                                {[...Array(3)].map((_, idx) => (
                                  <div key={idx} className="h-7 w-7 rounded-full border-2 border-card bg-secondary overflow-hidden shadow-sm">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task._id}-${idx}`} alt="avatar" />
                                  </div>
                                ))}
                             </div>
                             <span className="text-xs font-bold text-muted-foreground">+4</span>
                          </div>
                          <Button size="sm" className="h-8 px-5 text-[10px] uppercase font-black tracking-widest rounded-lg bg-foreground text-background shadow-md hover:scale-105 transition-all">
                             Deploy
                          </Button>
                       </div>
                    </div>
                 </MarkerPopup>
               </MapMarker>
             );
           })}
         </Map>
         )}
      </div>

      {/* --- RIGHT INFO PANEL: ACTIVE OPERATIONS --- */}
      <aside className="hidden md:block absolute top-36 right-8 w-80 z-30 space-y-4 pointer-events-none">
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-background/80 backdrop-blur-2xl border border-border/50 rounded-[2rem] p-6 shadow-2xl space-y-5 pointer-events-auto"
        >
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
             <div>
               <h3 className="text-lg font-black tracking-tight text-foreground">Active Ops</h3>
               <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Live Sync</p>
             </div>
             <div className="h-10 w-10 rounded-[1rem] bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Target className="h-5 w-5" />
             </div>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
             {loading ? (
               <div className="animate-pulse space-y-3">
                 {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-2xl" />)}
               </div>
             ) : tasks.slice(0, 4).map((task) => (
               <div key={task._id} className="group cursor-pointer bg-card/50 hover:bg-card/80 border border-border/50 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-center mb-2">
                     <span className={cn(
                       "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                       task.priority === 'Critical' ? 'bg-rose-500/10 text-rose-500' : 
                       task.priority === 'High' ? 'bg-orange-500/10 text-orange-500' : 
                       'bg-emerald-500/10 text-emerald-500'
                     )}>
                       {task.priority}
                     </span>
                     <span className="text-[10px] text-muted-foreground font-bold">{task.category}</span>
                  </div>
                  <p className="text-sm font-bold leading-tight text-foreground line-clamp-1">{task.title}</p>
               </div>
             ))}
          </div>

          <Button className="w-full h-12 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-black uppercase tracking-widest transition-all mt-2 shadow-sm border border-border/50">
             View All
          </Button>
        </motion.div>
        
        {/* Mini Legend */}
        <div className="bg-background/80 backdrop-blur-2xl border border-border/50 rounded-2xl p-4 flex justify-between pointer-events-auto shadow-xl">
           {[
             { label: 'Crit', color: 'bg-rose-500' },
             { label: 'High', color: 'bg-orange-500' },
             { label: 'Stable', color: 'bg-emerald-500' },
             { label: 'Pins', icon: MapPin }
           ].map((l, i) => (
             <div key={i} className="flex items-center gap-2">
                {l.color ? <div className={cn("h-2 w-2 rounded-full shadow-sm", l.color)} /> : <l.icon className="h-3.5 w-3.5 text-muted-foreground" />}
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{l.label}</span>
             </div>
           ))}
        </div>
      </aside>

      {/* Bottom Floating Stats - Hidden on mobile to avoid overlap with nav */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-30 gap-4 pointer-events-none">
         {[
           { label: 'Active Missions', val: tasks.length },
           { label: 'Resource Density', val: 'High' },
           { label: 'Response Velocity', val: '8.4m' }
         ].map((s, i) => (
           <div key={i} className="bg-background/80 backdrop-blur-2xl border border-border/50 px-6 py-3.5 rounded-2xl shadow-xl flex flex-col items-center min-w-[140px] pointer-events-auto transition-transform hover:-translate-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">{s.label}</span>
              <span className="text-base font-black text-foreground">{s.val}</span>
           </div>
         ))}
      </div>

      {/* Mobile Collapsible Bottom Sheet for Task List */}
      <div className="md:hidden absolute bottom-[76px] left-4 right-4 z-40 pointer-events-none">
        <motion.div 
          animate={{ height: isSheetExpanded ? 'auto' : '54px' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full bg-zinc-950/90 backdrop-blur-3xl border border-zinc-900 rounded-[1.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto flex flex-col"
        >
          {/* Toggle Header */}
          <div 
            onClick={() => setIsSheetExpanded(v => !v)}
            className="h-[54px] flex items-center justify-between px-5 cursor-pointer select-none border-b border-zinc-900/60"
          >
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-300 font-bold">
                [ TACTICAL OPERATIONS LEDGER ]
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[8px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                {tasks.length} ACTIVE
              </span>
              <motion.div animate={{ rotate: isSheetExpanded ? 90 : 0 }}>
                <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
              </motion.div>
            </div>
          </div>

          {/* Expanded Content */}
          <AnimatePresence>
            {isSheetExpanded && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 max-h-[35vh] overflow-y-auto space-y-3"
              >
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-zinc-900 rounded-xl" />)}
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                    No active operations detected in this sector
                  </div>
                ) : (
                  tasks.slice(0, 8).map((task) => (
                    <motion.div 
                      key={task._id} 
                      whileTap={{ scale: 0.98 }}
                      className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-3.5 active:bg-zinc-900/80 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={cn(
                          "text-[8px] font-mono uppercase tracking-widest px-2 py-0.5 rounded",
                          task.priority === 'Critical' ? 'bg-rose-950/20 border border-rose-900/30 text-rose-400' :
                          task.priority === 'High' ? 'bg-orange-950/20 border border-orange-900/30 text-orange-400' :
                          'bg-emerald-950/20 border border-emerald-900/30 text-emerald-400'
                        )}>
                          {task.priority || 'STABLE'}
                        </span>
                        <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">{task.category}</span>
                      </div>
                      <p className="text-xs font-mono text-zinc-200 font-bold line-clamp-1">{task.title.toUpperCase()}</p>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

    </div>
  )
}
