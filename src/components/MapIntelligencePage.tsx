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
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/20">
                <Compass className="h-5 w-5" />
             </div>
             <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground">Strategic Map</h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 ml-1 hidden md:block">AI-Driven Geographic Deployment Hub</p>
        </div>

        <div className="flex gap-2 md:gap-4 pointer-events-auto w-full md:w-auto">
           <div className="h-12 md:h-16 bg-card border border-border rounded-[2rem] px-4 flex items-center gap-4 shadow-2xl overflow-hidden flex-1 md:w-[300px]">
              <Search className="h-5 w-5 text-muted-foreground ml-2" />
              <input 
                 type="text" 
                 placeholder="Search sector or coordinates..."
                 className="bg-transparent border-none outline-none text-sm w-full h-full text-foreground placeholder:text-muted-foreground/50 font-bold"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
           </div>
           <Button onClick={handleSearch} className="h-12 md:h-16 w-12 md:w-16 rounded-[2rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20 hover:scale-105 transition-all touch-target">
              <Compass className="h-5 md:h-6 w-5 md:w-6" />
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
             <MapControls position="bottom-left" showCompass showZoom showLocate />
             
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
                 
                 <MarkerPopup closeButton offset={25} className="w-64 p-0 overflow-hidden bg-zinc-950 border-white/10 rounded-xl shadow-2xl">
                    <div className={cn(
                      "relative h-20",
                      task.priority === 'Critical' ? 'bg-gradient-to-br from-rose-500/20 to-rose-900/40' : 
                      task.priority === 'High' ? 'bg-gradient-to-br from-orange-500/20 to-orange-900/40' : 
                      'bg-gradient-to-br from-emerald-500/20 to-emerald-900/40'
                    )}>
                       <div className="absolute inset-0 flex items-center justify-center opacity-20">
                          <Target className="h-12 w-12" />
                       </div>
                       <div className="absolute bottom-2 left-3">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border flex items-center gap-1",
                            task.priority === 'Critical' ? 'bg-rose-500 text-white border-rose-400' : 
                            task.priority === 'High' ? 'bg-orange-500 text-white border-orange-400' : 
                            'bg-emerald-500 text-white border-emerald-400'
                          )}>
                            {task.priority} Priority
                          </span>
                       </div>
                    </div>
                    <div className="p-4 space-y-4">
                       <div>
                          <p className="text-sm font-bold leading-tight">{task.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Compass className="h-3 w-3" /> {task.location || 'Coordinates Encrypted'}
                          </p>
                       </div>
                       
                       <div className="flex justify-between items-center pt-3 border-t border-border/40">
                          <div className="flex items-center gap-2">
                             <div className="flex -space-x-2">
                                {[...Array(3)].map((_, idx) => (
                                  <div key={idx} className="h-6 w-6 rounded-full border-2 border-card bg-secondary overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task._id}-${idx}`} alt="avatar" />
                                  </div>
                                ))}
                             </div>
                             <span className="text-[10px] font-bold text-muted-foreground">+4</span>
                          </div>
                          <Button size="sm" className="h-7 px-4 text-[10px] uppercase font-black tracking-widest rounded-md bg-foreground text-background hover:bg-accent hover:text-white transition-all">
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
      <aside className="hidden md:block absolute top-32 right-8 w-80 z-30 space-y-6 pointer-events-none">
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-zinc-950 border border-white/10 rounded-[2rem] p-6 shadow-2xl space-y-4 pointer-events-auto"
        >
          <div className="flex items-center justify-between pb-4 border-b border-border/40">
             <div>
               <h3 className="text-lg font-black tracking-tight">Active Operations</h3>
               <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Live Neural Sync</p>
             </div>
             <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                <Target className="h-4 w-4" />
             </div>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
             {loading ? (
               <div className="animate-pulse space-y-3">
                 {[1,2,3].map(i => <div key={i} className="h-16 bg-secondary rounded-xl" />)}
               </div>
             ) : tasks.slice(0, 4).map((task) => (
               <div key={task._id} className="group cursor-pointer bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/5 transition-all">
                  <div className="flex justify-between items-start mb-2">
                     <span className={cn(
                       "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                       task.priority === 'Critical' ? 'bg-rose-500/20 text-rose-500' : 
                       task.priority === 'High' ? 'bg-orange-500/20 text-orange-500' : 
                       'bg-emerald-500/20 text-emerald-500'
                     )}>
                       {task.priority}
                     </span>
                     <span className="text-[10px] text-muted-foreground font-medium">{task.category}</span>
                  </div>
                  <p className="text-xs font-bold leading-tight line-clamp-1">{task.title}</p>
               </div>
             ))}
          </div>

          <Button className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-accent hover:text-white text-xs font-black uppercase tracking-widest transition-all mt-2">
             View All Operations
          </Button>
        </motion.div>
        
        {/* Mini Legend */}
        <div className="bg-zinc-950 border border-white/10 rounded-2xl p-4 flex justify-between pointer-events-auto shadow-xl">
           {[
             { label: 'Crit', color: 'bg-rose-500' },
             { label: 'High', color: 'bg-orange-500' },
             { label: 'Stable', color: 'bg-emerald-500' },
             { label: 'Pins', icon: MapPin }
           ].map((l, i) => (
             <div key={i} className="flex items-center gap-1.5">
                {l.color ? <div className={cn("h-1.5 w-1.5 rounded-full shadow-sm", l.color)} /> : <l.icon className="h-3 w-3 opacity-40" />}
                <span className="text-[9px] font-black uppercase opacity-60 tracking-widest">{l.label}</span>
             </div>
           ))}
        </div>
      </aside>

      {/* Bottom Floating Stats - Hidden on mobile to avoid overlap with nav */}
      <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-30 gap-4">
         {[
           { label: 'Active Missions', val: tasks.length },
           { label: 'Resource Density', val: 'High' },
           { label: 'Response Velocity', val: '8.4m' }
         ].map((s, i) => (
           <div key={i} className="bg-zinc-950 border border-white/10 px-6 py-3 rounded-2xl shadow-2xl flex flex-col items-center min-w-[120px]">
              <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">{s.label}</span>
              <span className="text-sm font-black italic">{s.val}</span>
           </div>
         ))}
      </div>

      {/* Mobile Bottom Sheet for Task List */}
      <div className="md:hidden absolute bottom-20 left-0 right-0 z-30 pointer-events-none">
        <div className="bg-zinc-950 border-t border-white/10 rounded-t-[2rem] p-4 shadow-2xl max-h-[40vh] overflow-y-auto pointer-events-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black">Active Operations</h3>
            <span className="text-sm text-muted-foreground">{tasks.length} tasks</span>
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="animate-pulse space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-secondary rounded-xl" />)}
              </div>
            ) : tasks.slice(0, 5).map((task) => (
              <div key={task._id} className="bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/5 transition-all">
                <div className="flex justify-between items-start mb-1">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                    task.urgency === 'critical' ? 'bg-rose-500/20 text-rose-500' :
                    task.urgency === 'high' ? 'bg-orange-500/20 text-orange-500' :
                    'bg-emerald-500/20 text-emerald-500'
                  )}>
                    {task.urgency}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{task.category}</span>
                </div>
                <p className="text-xs font-bold leading-tight line-clamp-1">{task.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
