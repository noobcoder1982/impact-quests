import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar01Icon as Calendar, Search01Icon as Search, Settings01Icon as Settings, Add01Icon as Plus, More02Icon as MoreVertical, Time01Icon as Clock, Comment01Icon as MessageSquare, FlashIcon as Zap, CpuIcon as Cpu, DocumentCodeIcon as FileText, UserGroupIcon as Users, ArrowRight01Icon as ChevronRight, ArrowLeft01Icon as ChevronLeft, Tick01Icon as Check, Share01Icon as Share, Target01Icon as Target, FilterIcon as Filter, LayoutGridIcon as Grid, CircleIcon as List, Layout02Icon as Columns, TextAlignLeftIcon as AlignLeft, Calendar01Icon as CalendarCheck, PackageIcon as Package, Delete02Icon as Trash, Download02Icon as Download, Menu01Icon as Menu, Clock01Icon as History, Notification01Icon as Bell, Location01Icon as MapPin } from 'hugeicons-react'
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { apiRequest } from "../lib/api"
import { useTheme } from "../contexts/ThemeContext"
import TacticalIntelligence from "./TacticalIntelligence"

type ViewType = 'Calendar' | 'Table' | 'Kanban' | 'Timeline' | 'Agenda';

export default function PlannerPage() {
  const { themeVariant } = useTheme();
  const [tasks, setTasks] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [selectedView, setSelectedView] = React.useState<ViewType>('Calendar')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = React.useState(false)
  const [selectedTask, setSelectedTask] = React.useState<any>(null)

  // Fetch tasks
  const fetchTasks = React.useCallback(async () => {
    try {
      const res = await apiRequest('/tasks')
      if (res.success) setTasks(res.data)
    } catch (err) {
      console.error("Failed to fetch tasks", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // --- CALENDAR LOGIC ---
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const totalDays = daysInMonth(month, year);
  const firstDay = firstDayOfMonth(month, year);
  const prevMonthTotal = daysInMonth(month - 1, year);

  const gridDays = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    gridDays.push({ day: prevMonthTotal - i, current: false, date: new Date(year, month - 1, prevMonthTotal - i) });
  }
  for (let i = 1; i <= totalDays; i++) {
    gridDays.push({ day: i, current: true, date: new Date(year, month, i) });
  }
  const remaining = 42 - gridDays.length;
  for (let i = 1; i <= remaining; i++) {
    gridDays.push({ day: i, current: false, date: new Date(year, month + 1, i) });
  }

  // --- FILTERING ---
  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // --- RENDER HELPERS ---
  const PriorityBadge = ({ priority }: { priority: string }) => {
    const colors: any = {
      Low: 'bg-emerald-500/10 text-emerald-500',
      Medium: 'bg-blue-500/10 text-blue-500',
      High: 'bg-orange-500/10 text-orange-500',
      Critical: 'bg-rose-500/10 text-rose-500'
    }
    return <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest", colors[priority] || 'bg-secondary text-muted-foreground')}>{priority}</span>
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const colors: any = {
      'Open': 'bg-slate-500/10 text-slate-500',
      'In Progress': 'bg-indigo-500/10 text-indigo-500',
      'On Hold': 'bg-amber-500/10 text-amber-500',
      'Completed': 'bg-emerald-500/10 text-emerald-500',
      'Overdue': 'bg-rose-500/10 text-rose-500',
      'Blocked': 'bg-rose-900/10 text-rose-900',
      'Cancelled': 'bg-slate-900/10 text-slate-900'
    }
    return <span className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest", colors[status] || 'bg-secondary text-muted-foreground')}>{status}</span>
  }

  // --- VIEWS ---
  
  const CalendarView = () => (
    <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="grid grid-cols-7 border-b border-border bg-secondary/20">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 border-r border-border last:border-0">{day}</div>
          ))}
       </div>
       <div className="grid grid-cols-7 grid-rows-6 min-h-[700px]">
          {gridDays.map((item, idx) => {
            const dayTasks = filteredTasks.filter(t => new Date(t.date).toDateString() === item.date.toDateString());
            return (
              <div 
                key={idx} 
                className={cn(
                  "p-4 border-r border-b border-border transition-colors group/day flex flex-col gap-2 overflow-y-auto last:border-r-0 h-full",
                  !item.current ? "bg-secondary/5 opacity-40" : "bg-transparent",
                  idx >= 35 ? "border-b-0" : ""
                )}
              >
                 <div className="flex justify-between items-center mb-1">
                    <span className={cn(
                      "text-[11px] font-black tracking-tight",
                      item.date.toDateString() === new Date().toDateString() ? "h-6 w-6 rounded-lg bg-emerald-500 text-slate-900 flex items-center justify-center" : "text-muted-foreground/60"
                    )}>
                      {item.day}
                    </span>
                    {item.current && <Plus className="h-3 w-3 opacity-0 group-hover/day:opacity-20 cursor-pointer hover:text-emerald-500 hover:opacity-100 transition-all" onClick={() => { setCurrentDate(item.date); setIsNewTaskModalOpen(true); }} />}
                 </div>
                 <div className="space-y-2">
                    {dayTasks.map((task: any) => (
                      <div 
                        key={task._id}
                        onClick={() => setSelectedTask(task)}
                        className="p-2 rounded-xl bg-background border border-border/60 shadow-sm space-y-1 cursor-pointer hover:border-emerald-500/50 hover:shadow-md transition-all group/task"
                      >
                         <div className="flex items-center gap-2">
                            <div className={cn("h-1.5 w-1.5 rounded-full shadow-sm", task.priority === 'Critical' ? 'bg-rose-500' : 'bg-emerald-500')} />
                            <h4 className="text-[9px] font-black tracking-tight truncate uppercase leading-none">{task.title}</h4>
                         </div>
                         <div className="flex items-center justify-between">
                            <PriorityBadge priority={task.priority} />
                            <div className="h-4 w-4 rounded-full border border-border/60 flex items-center justify-center">
                               <div className={cn("h-2 w-2 rounded-full", task.status === 'Completed' ? "bg-emerald-500" : "border border-border")} />
                            </div>
                         </div>
                      </div>
                    ))}
                    {dayTasks.length > 3 && <p className="text-[8px] font-black text-muted-foreground/40 text-center uppercase tracking-widest">+ {dayTasks.length - 3} more</p>}
                 </div>
              </div>
            )
          })}
       </div>
    </div>
  )

  const TableView = () => (
    <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
       <table className="w-full text-left border-collapse">
          <thead className="bg-secondary/20 border-b border-border">
             <tr>
                {['Mission Name', 'Owner', 'Due Date', 'Priority', 'Status', 'Category', 'Team'].map(h => (
                  <th key={h} className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 border-r border-border last:border-0">{h}</th>
                ))}
             </tr>
          </thead>
          <tbody>
             {filteredTasks.length > 0 ? filteredTasks.map(task => (
               <tr key={task._id} onClick={() => setSelectedTask(task)} className="border-b border-border last:border-0 hover:bg-secondary/10 transition-colors cursor-pointer group">
                  <td className="p-6">
                     <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                           <Target className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-tight">{task.title}</span>
                     </div>
                  </td>
                  <td className="p-6">
                     <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-secondary border border-border flex items-center justify-center text-[8px] font-black uppercase">JB</div>
                        <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Josh B.</span>
                     </div>
                  </td>
                  <td className="p-6 text-[10px] font-black opacity-60 uppercase tracking-widest">{new Date(task.date).toLocaleDateString()}</td>
                  <td className="p-6"><PriorityBadge priority={task.priority} /></td>
                  <td className="p-6"><StatusBadge status={task.status} /></td>
                  <td className="p-6">
                     <span className="px-2 py-1 rounded-lg bg-secondary/50 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{task.category}</span>
                  </td>
                  <td className="p-6 text-[10px] font-black opacity-60 uppercase tracking-widest">{task.assignedTeam || 'Alpha-1'}</td>
               </tr>
             )) : (
               <tr><td colSpan={7} className="p-20 text-center opacity-20 italic font-black uppercase tracking-widest">No Missions Detected</td></tr>
             )}
          </tbody>
       </table>
    </div>
  )

  const KanbanView = () => {
    const statuses = ['To Do', 'In Progress', 'Waiting', 'Completed', 'Blocked'];
    return (
      <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide animate-in fade-in slide-in-from-bottom-4 duration-500">
         {statuses.map(status => (
           <div key={status} className="flex-shrink-0 w-[350px] space-y-6">
              <div className="flex items-center justify-between px-4">
                 <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">{status}</h3>
                    <span className="text-[10px] font-black text-muted-foreground/30">{filteredTasks.filter(t => t.status === status).length}</span>
                 </div>
                 <Plus className="h-4 w-4 opacity-20 hover:opacity-100 cursor-pointer transition-all" />
              </div>
              <div className="space-y-4 min-h-[500px] p-2 rounded-[2rem] bg-secondary/10 border border-dashed border-border/60">
                 {filteredTasks.filter(t => t.status === status).map(task => (
                   <motion.div 
                     layoutId={task._id}
                     key={task._id} 
                     onClick={() => setSelectedTask(task)}
                     className="p-6 rounded-3xl bg-card border border-border/60 shadow-xl shadow-black/5 hover:border-emerald-500/40 hover:-translate-y-1 transition-all cursor-pointer group"
                   >
                      <div className="space-y-4">
                         <div className="flex justify-between items-start">
                            <span className="px-2 py-1 rounded-lg bg-secondary/50 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{task.category}</span>
                            <PriorityBadge priority={task.priority} />
                         </div>
                         <h4 className="text-sm font-black tracking-tight leading-snug group-hover:text-emerald-500 transition-colors uppercase">{task.title}</h4>
                         <div className="flex items-center justify-between pt-2 border-t border-border/60 mt-4">
                            <div className="flex items-center gap-2 opacity-60">
                               <Clock className="h-3 w-3" />
                               <span className="text-[9px] font-black uppercase tracking-widest">{new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="h-6 w-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[8px] font-black">JB</div>
                         </div>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </div>
         ))}
      </div>
    )
  }

  const TimelineView = () => (
    <div className="bg-card border border-border rounded-[2rem] p-12 overflow-hidden shadow-2xl flex flex-col items-center justify-center min-h-[500px] text-center space-y-6 opacity-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <History className="h-12 w-12 text-emerald-500" />
       <div className="space-y-2">
          <h3 className="text-xl font-black uppercase tracking-tighter">Timeline Analysis Protocol</h3>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Visualization system currently under calibration</p>
       </div>
    </div>
  )

  const AgendaView = () => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
       {['Today', 'Upcoming', 'Completed'].map(group => {
         const groupTasks = group === 'Today' 
          ? filteredTasks.filter(t => new Date(t.date).toDateString() === new Date().toDateString())
          : group === 'Completed'
          ? filteredTasks.filter(t => t.status === 'Completed')
          : filteredTasks.filter(t => new Date(t.date) > new Date() && t.status !== 'Completed');

         return (
           <div key={group} className="space-y-6">
              <div className="flex items-center gap-4">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">{group}</h3>
                 <div className="h-px flex-1 bg-border/40" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {groupTasks.map(task => (
                   <div key={task._id} onClick={() => setSelectedTask(task)} className="p-8 rounded-[2.5rem] bg-card border border-border hover:border-emerald-500/40 transition-all cursor-pointer group">
                      <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <StatusBadge status={task.status} />
                            <PriorityBadge priority={task.priority} />
                         </div>
                         <h4 className="text-xl font-black tracking-tighter group-hover:text-emerald-500 transition-colors uppercase">{task.title}</h4>
                         <p className="text-xs font-medium text-muted-foreground/60 line-clamp-2">{task.description}</p>
                         <div className="flex items-center gap-6 pt-4 border-t border-border">
                            <div className="flex items-center gap-2">
                               <Calendar className="h-3 w-3 opacity-40" />
                               <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{new Date(task.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <Clock className="h-3 w-3 opacity-40" />
                               <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{task.startTime}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
                 {groupTasks.length === 0 && <p className="text-[10px] font-black uppercase tracking-widest opacity-10 py-10 text-center col-span-full">No active entries</p>}
              </div>
           </div>
         )
       })}
    </div>
  )

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-32 text-center space-y-10 animate-in fade-in zoom-in duration-700">
       <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full animate-pulse" />
          <Target className="h-32 w-32 text-emerald-500 relative z-10" />
       </div>
       <div className="max-w-md space-y-4 relative z-10">
          <h2 className="text-5xl font-black tracking-tighter">Start Organizing Impact</h2>
          <p className="text-base font-medium text-muted-foreground/60 leading-relaxed">Plan volunteer drives, assign tasks, track missions, and coordinate your team effortlessly with the high-end tactical coordination system.</p>
       </div>
       <div className="flex flex-wrap justify-center gap-4 relative z-10">
          <Button onClick={() => setIsNewTaskModalOpen(true)} className="h-16 px-10 rounded-3xl bg-emerald-500 text-slate-900 text-xs font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
             Create First Mission
          </Button>
          <Button variant="outline" className="h-16 px-10 rounded-3xl border-border bg-card/50 text-xs font-black uppercase tracking-widest hover:bg-secondary/50 transition-all">
             Import CSV
          </Button>
          <Button variant="outline" className="h-16 px-10 rounded-3xl border-border bg-card/50 text-xs font-black uppercase tracking-widest hover:bg-secondary/50 transition-all">
             Use NGO Template
          </Button>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl pt-20 border-t border-border/40 mt-20">
          {[
            { icon: Users, title: "Team Missions", desc: "Coordinate multiple teams across different sectors." },
            { icon: MapPin, title: "Location Sync", desc: "Track missions based on geographic emergency zones." },
            { icon: Zap, title: "Impact Scoring", desc: "Auto-calculate mission success and volunteer impact." }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] bg-secondary/10 border border-border/60 space-y-4 text-left group hover:bg-secondary/20 transition-all">
               <feature.icon className="h-8 w-8 text-emerald-500 group-hover:scale-110 transition-transform" />
               <h4 className="text-sm font-black uppercase tracking-widest">{feature.title}</h4>
               <p className="text-[11px] font-medium text-muted-foreground/60">{feature.desc}</p>
            </div>
          ))}
       </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground font-body p-4 md:p-10 space-y-10 overflow-x-hidden selection:bg-emerald-500/10">
      
      {/* --- TOP HEADER PROTOCOL --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="flex items-center gap-3">
             <CalendarCheck className="h-8 w-8 text-emerald-500" />
             <h1 className="text-4xl font-black tracking-tighter">Mission Board</h1>
          </div>
          <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-2 ml-1">Professional Logistics & Resource Allocation</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-96 group">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-emerald-500 transition-colors" />
             <input 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               placeholder="Search missions, volunteers, teams..."
               className="w-full h-16 bg-secondary/30 border border-border rounded-[2rem] pl-14 pr-8 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
             />
             <div className="absolute right-6 top-1/2 -translate-y-1/2 px-2 py-1 bg-secondary/50 border border-border rounded text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest pointer-events-none">⌘ F</div>
          </div>
          <div className="flex gap-2">
             <Button variant="ghost" size="icon" className="h-16 w-16 rounded-[2rem] bg-secondary/30 border border-border relative">
                <Bell className="h-6 w-6 opacity-40" />
                <div className="absolute top-5 right-5 h-2 w-2 bg-rose-500 rounded-full border-2 border-background" />
             </Button>
             <Button onClick={() => setIsNewTaskModalOpen(true)} className="h-16 px-10 rounded-[2rem] bg-emerald-500 text-slate-900 hover:bg-white transition-all text-xs font-black uppercase tracking-[0.2em] gap-4 shadow-2xl shadow-emerald-500/20 group">
                <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform" /> New Mission
             </Button>
          </div>
        </div>
      </header>

      {/* --- CONTROL TOOLBAR PROTOCOL --- */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-8 bg-card/95 border border-border/60 p-6 rounded-[3rem] sticky top-4 z-40 shadow-xl shadow-black/5">
         <div className="flex bg-secondary/50 p-1.5 rounded-[1.5rem] border border-border/60 w-full xl:w-auto overflow-x-auto scrollbar-hide">
            {(['Table', 'Kanban', 'Calendar', 'Timeline', 'Agenda'] as ViewType[]).map(view => (
              <button 
                key={view}
                onClick={() => setSelectedView(view)}
                className={cn(
                  "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  selectedView === view ? "bg-background text-foreground shadow-xl shadow-black/10 scale-105" : "text-muted-foreground/60 hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {view}
              </button>
            ))}
         </div>

         <div className="flex flex-wrap items-center justify-center gap-4 w-full xl:w-auto">
            <div className="flex items-center gap-4 bg-secondary/40 px-6 py-3 rounded-2xl border border-border/60">
               <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} className="h-8 w-8 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"><ChevronLeft className="h-5 w-5" /></Button>
               <div className="text-center min-w-[140px] space-y-0.5">
                  <p className="text-xs font-black uppercase tracking-[0.2em]">{monthNames[month]}</p>
                  <p className="text-[10px] font-bold text-muted-foreground/40">{year}</p>
               </div>
               <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} className="h-8 w-8 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"><ChevronRight className="h-5 w-5" /></Button>
            </div>
            
            <div className="flex gap-3">
               <Button variant="outline" className="h-12 px-6 rounded-2xl border-border bg-transparent text-[10px] font-black uppercase tracking-[0.2em] gap-3 hover:border-emerald-500/50 transition-all">
                  <Filter className="h-4 w-4" /> Filter
               </Button>
               <Button variant="outline" className="h-12 px-6 rounded-2xl border-border bg-transparent text-[10px] font-black uppercase tracking-[0.2em] gap-3 hover:border-emerald-500/50 transition-all">
                  <Download className="h-4 w-4" /> Export
               </Button>
            </div>
         </div>
      </div>

      {/* --- DYNAMIC VIEWPORT --- */}
      <div className="min-h-[600px] pb-20">
         {loading ? (
           <div className="flex flex-col items-center justify-center h-[500px] space-y-6 opacity-20">
              <Cpu className="h-16 w-16 animate-spin [animation-duration:3000ms]" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Intelligence...</p>
           </div>
         ) : tasks.length === 0 && searchQuery === '' ? (
           <EmptyState />
         ) : (
           <div className="animate-in fade-in duration-700">
             {selectedView === 'Calendar' && <CalendarView />}
             {selectedView === 'Table' && <TableView />}
             {selectedView === 'Kanban' && <KanbanView />}
             {selectedView === 'Timeline' && <TimelineView />}
             {selectedView === 'Agenda' && <AgendaView />}
           </div>
         )}
      </div>

      {/* --- MODALS & OVERLAYS --- */}
      <AnimatePresence>
         {isNewTaskModalOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsNewTaskModalOpen(false)}
                className="absolute inset-0 bg-background/90 pointer-events-auto"
              />
              <motion.div 
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.9 }}
                className="w-full max-w-4xl bg-card border border-border rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col pointer-events-auto h-[90vh]"
              >
                 <div className="p-10 border-b border-border flex justify-between items-center bg-secondary/10">
                    <div className="flex items-center gap-4">
                       <div className="h-12 w-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-900">
                          <Target className="h-6 w-6" />
                       </div>
                       <div>
                          <h2 className="text-3xl font-black tracking-tighter">Tactical Deployment</h2>
                          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40 mt-1">Operational Protocol Alpha-9</p>
                       </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsNewTaskModalOpen(false)} className="rounded-full hover:bg-secondary h-12 w-12">
                       <Plus className="h-8 w-8 rotate-45" />
                    </Button>
                 </div>
                 
                 <form className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide" id="mission-form" onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget as HTMLFormElement);
                    const taskData = {
                      title: formData.get('title'),
                      description: formData.get('description'),
                      category: formData.get('category'),
                      priority: formData.get('priority'),
                      date: formData.get('date'),
                      startTime: formData.get('startTime'),
                      endTime: formData.get('endTime'),
                      location: formData.get('location'),
                      status: 'To Do'
                    };
                    try {
                      const res = await apiRequest('/tasks', { method: 'POST', body: taskData });
                      if (res.success) {
                        setIsNewTaskModalOpen(false);
                        fetchTasks(); // Neural Sync
                      }
                    } catch (err) {
                      console.error("Deployment failed", err);
                    }
                 }}>
                    <div className="grid grid-cols-2 gap-10">
                       <div className="col-span-2 space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Mission Title</label>
                          <input name="title" required placeholder="Enter mission objective..." className="w-full h-16 bg-secondary/30 border border-border rounded-2xl px-6 text-sm font-black uppercase tracking-widest focus:ring-2 focus:ring-emerald-500/10 focus:outline-none transition-all" />
                       </div>
                       
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Category</label>
                          <select name="category" className="w-full h-16 bg-secondary/30 border border-border rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest focus:outline-none">
                             {['Food Drive', 'Rescue Mission', 'Medical Camp', 'Donation Pickup', 'Volunteer Training', 'Emergency Response', 'General'].map(c => (
                               <option key={c} value={c}>{c}</option>
                             ))}
                          </select>
                       </div>

                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Priority</label>
                          <select name="priority" className="w-full h-16 bg-secondary/30 border border-border rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest focus:outline-none">
                             {['Low', 'Medium', 'High', 'Critical'].map(p => (
                               <option key={p} value={p}>{p}</option>
                             ))}
                          </select>
                       </div>

                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Date</label>
                          <input name="date" type="date" required className="w-full h-16 bg-secondary/30 border border-border rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest focus:outline-none" />
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Start</label>
                             <input name="startTime" type="time" required className="w-full h-16 bg-secondary/30 border border-border rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest focus:outline-none" />
                          </div>
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">End</label>
                             <input name="endTime" type="time" required className="w-full h-16 bg-secondary/30 border border-border rounded-2xl px-4 text-[10px] font-black uppercase tracking-widest focus:outline-none" />
                          </div>
                       </div>

                       <div className="col-span-2 space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Mission Location</label>
                          <div className="relative">
                             <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30" />
                             <input name="location" placeholder="Specify address or coordinates..." className="w-full h-16 bg-secondary/30 border border-border rounded-2xl pl-16 pr-6 text-sm font-bold uppercase tracking-widest focus:outline-none" />
                          </div>
                       </div>

                       <div className="col-span-2 space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Mission Briefing</label>
                          <textarea name="description" rows={4} placeholder="Provide details on the mission..." className="w-full bg-secondary/30 border border-border rounded-3xl p-8 text-sm font-medium focus:outline-none min-h-[150px] scrollbar-hide"></textarea>
                       </div>
                    </div>
                 </form>

                 <div className="p-10 border-t border-border bg-secondary/10 flex justify-end gap-4">
                    <Button type="button" onClick={() => setIsNewTaskModalOpen(false)} variant="ghost" className="h-16 px-10 rounded-3xl text-[10px] font-black uppercase tracking-widest">Abort</Button>
                    <Button type="submit" form="mission-form" className="h-16 px-12 rounded-3xl bg-emerald-500 text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/20 hover:scale-105 transition-all">Confirm Deployment</Button>
                 </div>
              </motion.div>
           </div>
         )}

         {selectedTask && (
           <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-0 md:p-10 pointer-events-none">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTask(null)} className="absolute inset-0 bg-background/90 pointer-events-auto" />
              <motion.div 
                initial={{ y: "100%", opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                exit={{ y: "100%", opacity: 0 }}
                className="w-full max-w-2xl bg-card border-t md:border border-border rounded-t-[3rem] md:rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col pointer-events-auto h-[80vh] md:h-auto max-h-[90vh]"
              >
                 <div className="p-10 space-y-8">
                    <div className="flex justify-between items-start">
                       <StatusBadge status={selectedTask.status} />
                       <Button variant="ghost" size="icon" onClick={() => setSelectedTask(null)} className="rounded-full h-10 w-10">
                          <Plus className="h-6 w-6 rotate-45" />
                       </Button>
                    </div>
                    <div className="space-y-4">
                       <h2 className="text-4xl font-black tracking-tighter uppercase">{selectedTask.title}</h2>
                       <p className="text-base font-medium text-muted-foreground/60 leading-relaxed">{selectedTask.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-8 border-t border-border">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Category</p>
                          <p className="text-xs font-black uppercase tracking-widest">{selectedTask.category}</p>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Priority</p>
                          <PriorityBadge priority={selectedTask.priority} />
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Time Slot</p>
                          <div className="flex items-center gap-2">
                             <Clock className="h-4 w-4 opacity-40" />
                             <p className="text-xs font-bold">{selectedTask.startTime} - {selectedTask.endTime}</p>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Location</p>
                          <div className="flex items-center gap-2">
                             <MapPin className="h-4 w-4 opacity-40" />
                             <p className="text-xs font-bold">{selectedTask.location || 'Global Operations Center'}</p>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="p-10 bg-secondary/20 flex gap-4">
                    <Button 
                      onClick={async () => {
                        if (!selectedTask?._id) return;
                        try {
                          const res = await apiRequest(`/tasks/${selectedTask._id}`, {
                            method: 'PATCH',
                            body: { status: 'Completed' }
                          });
                          if (res.success) {
                            setSelectedTask(null);
                            fetchTasks();
                          }
                        } catch (err) {
                          console.error("Failed to complete task", err);
                        }
                      }}
                      className="flex-1 h-14 rounded-2xl bg-emerald-500 text-slate-900 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                       Mark Completed
                    </Button>
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl border-border text-[10px] font-black uppercase tracking-widest">Edit Entry</Button>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

    </div>
  )
}
