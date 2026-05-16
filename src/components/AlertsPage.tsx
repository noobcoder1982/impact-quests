import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Notification01Icon as Bell, 
  AlertCircleIcon as Alert, 
  CheckmarkCircle01Icon as Check,
  FlashIcon as Zap,
  Settings01Icon as Settings,
  Clock01Icon as Clock
} from "hugeicons-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

export default function AlertsPage() {
  const [alerts, setAlerts] = React.useState([
    { id: 1, type: 'CRITICAL', message: 'Low water supply in Sector Delta. Immediate deployment required.', time: '2m ago', active: true },
    { id: 2, type: 'SYSTEM', message: 'Neural link calibration complete. Accuracy at 98.4%.', time: '15m ago', active: false },
    { id: 3, type: 'MISSION', message: 'New mission: Emergency Relief Hub setup in Alpha Sector.', time: '1h ago', active: true },
    { id: 4, type: 'SECURITY', message: 'New security protocol A-42 implemented for data encryption.', time: '3h ago', active: false },
  ]);

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, active: false })));
  };

  return (
    <div className="flex-1 overflow-y-auto p-10 font-body transition-all bg-background">
      <div className="max-w-4xl mx-auto py-10 space-y-12">
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Bell className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">System Monitoring active</span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter leading-none">Alert <span className="text-muted-foreground/20">Protocol</span></h1>
          </div>
          <Button 
            onClick={markAllRead}
            variant="outline" 
            className="rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary h-12 px-8"
          >
            Acknowledge All
          </Button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {alerts.map((alert, i) => (
              <motion.div 
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "p-8 rounded-[2.5rem] border transition-all flex items-center gap-8 group",
                  alert.active ? "bg-card border-indigo-600/20 shadow-xl shadow-indigo-600/5" : "bg-card/40 border-border opacity-60"
                )}
              >
                <div className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 border",
                  alert.type === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                  alert.type === 'SYSTEM' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                )}>
                  {alert.type === 'CRITICAL' ? <Alert className="h-6 w-6" /> : <Settings className="h-6 w-6" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{alert.type} • {alert.time}</span>
                    {alert.active && <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />}
                  </div>
                  <p className="text-lg font-bold text-foreground leading-snug group-hover:text-indigo-600 transition-colors">{alert.message}</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                  <Check className="h-5 w-5" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
