import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  DocumentCodeIcon as FileText, 
  Time01Icon as Clock, 
  UserIcon as User, 
  Shield01Icon as Shield, 
  Alert01Icon as AlertTriangle, 
  CheckmarkCircle01Icon as CheckCircle2, 
  More02Icon as MoreVertical, 
  Add01Icon as Plus,
  FlashIcon as Zap
} from "hugeicons-react"
import { Button } from "./ui/button"
import { apiRequest } from "../lib/api"
import { cn } from "@/lib/utils"

export default function AssignmentsPage() {
  const [tasks, setTasks] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [filter, setFilter] = React.useState('All')

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await apiRequest('/tasks')
      if (res.success) {
        setTasks(res.data)
      }
    } catch (err) {
      console.error("Failed to fetch assignments", err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchTasks()
  }, [])

  const handleComplete = async (taskId: string) => {
    try {
      const res = await apiRequest(`/tasks/${taskId}/complete`, { method: 'PUT' })
      if (res.success) {
        alert("Mission Verified. Impact points synchronized.")
        fetchTasks()
      }
    } catch (err: any) {
      alert(err.message || "Verification failed.")
    }
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'All') return true
    if (filter === 'In Progress') return t.status === 'In Progress' || t.status === 'Open'
    if (filter === 'Verified Log') return t.status === 'Completed'
    return true
  })

  return (
    <div className="flex-1 overflow-y-auto p-10 font-body transition-all pb-40 selection:bg-indigo-500/10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-12">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
               <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-indigo-600" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Registry & Directives</span>
            </div>
            <h1 className="text-6xl font-black italic tracking-tighter leading-none">
              Mission <span className="not-italic text-indigo-600">Assignments</span>
            </h1>
          </div>
        </header>

        {/* Filter Bar */}
        <div className="flex gap-4 mb-10 overflow-x-auto whitespace-nowrap scrollbar-hide">
           {["All", "In Progress", "Verified Log"].map((f) => (
             <button 
               key={f} 
               onClick={() => setFilter(f)}
               className={cn(
                 "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                 filter === f ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20' : 'bg-card border-border hover:border-indigo-600/30'
               )}
             >
                {f}
             </button>
           ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-28 w-full bg-secondary/40 rounded-[2.5rem] animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, i) => (
                  <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-8 rounded-[2.5rem] border border-border bg-card shadow-sm hover:shadow-2xl hover:border-indigo-600/30 transition-all flex items-center group cursor-default"
                  >
                    <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center border border-border group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0 mr-8">
                       <FileText className={cn("h-6 w-6 transition-colors", task.status === 'Completed' ? 'text-emerald-500' : 'text-muted-foreground')} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500/60">{task.category}</span>
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            task.priority === 'Critical' ? 'bg-rose-500' : task.priority === 'High' ? 'bg-orange-500' : 'bg-emerald-500'
                          )} />
                       </div>
                       <h4 className="text-xl font-bold tracking-tight truncate">{task.title}</h4>
                    </div>

                    <div className="flex items-center gap-12 ml-12 shrink-0">
                       <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mb-1">Impact</span>
                          <div className="flex items-center gap-2 text-sm font-black text-indigo-600 italic">
                             <Zap className="h-3.5 w-3.5" /> +{task.pointsReward || 500}
                          </div>
                       </div>
                       
                       <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mb-1">Status</span>
                          <div className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em]",
                            task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-secondary text-muted-foreground'
                          )}>
                             {task.status}
                          </div>
                       </div>

                       {task.status !== 'Completed' && (
                         <Button 
                            onClick={() => handleComplete(task._id)}
                            className="h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-6"
                         >
                            Mark Complete
                         </Button>
                       )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-20 border border-dashed border-border/60 rounded-[3rem] text-center opacity-40">
                   <FileText className="h-12 w-12 mx-auto mb-4" />
                   <p className="text-sm font-black uppercase tracking-widest italic">No matching directives found.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
