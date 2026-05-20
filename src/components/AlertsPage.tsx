import * as React from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
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

const SwipeableAlertCard = ({ alert, onMarkRead, onRemove, index }: any) => {
  const x = useMotionValue(0);
  const dragTriggerThreshold = 100;

  // Track swipe completion to trigger immediate out-of-screen transition before state update
  const [swipedDir, setSwipedDir] = React.useState<'left' | 'right' | null>(null);

  const handleDragEnd = (_event: any, info: any) => {
    if (info.offset.x < -dragTriggerThreshold) {
      setSwipedDir('left');
      setTimeout(() => {
        onMarkRead(alert.id);
      }, 200);
    } else if (info.offset.x > dragTriggerThreshold) {
      setSwipedDir('right');
      setTimeout(() => {
        onRemove(alert.id);
      }, 200);
    }
  };

  // Determine dynamic background highlights
  const bgOpacityLeft = useTransform(x, [0, 80], [0, 1]);
  const bgOpacityRight = useTransform(x, [-80, 0], [1, 0]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28, delay: index * 0.05 }}
      className="relative overflow-visible w-full mb-4 shrink-0"
    >
      {/* Swipe Background Reveal Elements (Underlay) */}
      <div className="absolute inset-0 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-zinc-950 flex justify-between items-center pointer-events-none z-0 border border-zinc-900">
        {/* Left background: Swipe Right (Remove / Dismiss) */}
        <motion.div 
          style={{ opacity: bgOpacityLeft }}
          className="absolute inset-0 bg-gradient-to-r from-rose-950 via-rose-900/40 to-transparent flex items-center justify-start pl-8 gap-2 text-rose-450 font-mono text-[9px] uppercase tracking-widest font-black"
        >
          <Alert className="h-5 w-5 text-rose-500 animate-pulse" />
          <span>Dismiss</span>
        </motion.div>

        {/* Right background: Swipe Left (Mark as Read) */}
        <motion.div 
          style={{ opacity: bgOpacityRight }}
          className="absolute inset-0 bg-gradient-to-l from-indigo-950 via-indigo-900/40 to-transparent flex items-center justify-end pr-8 gap-2 text-indigo-400 font-mono text-[9px] uppercase tracking-widest font-black"
        >
          <span>Mark Read</span>
          <Check className="h-5 w-5 text-indigo-500" />
        </motion.div>
      </div>

      {/* The actual draggable card */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.6, right: 0.6 }}
        style={{ x }}
        onDragEnd={handleDragEnd}
        animate={swipedDir === 'left' ? { x: -600, opacity: 0 } : swipedDir === 'right' ? { x: 600, opacity: 0 } : { x: 0, opacity: 1 }}
        transition={swipedDir ? { duration: 0.22, ease: 'easeOut' } : { type: 'spring', stiffness: 350, damping: 28 }}
        className={cn(
          "p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border transition-all flex items-center gap-4 md:gap-8 group relative z-10 select-none touch-pan-y bg-card cursor-grab active:cursor-grabbing",
          alert.active ? "border-indigo-600/20 shadow-xl shadow-indigo-600/5" : "bg-card/45 border-border/80 opacity-65"
        )}
      >
        <div className={cn(
          "h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 border",
          alert.type === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
          alert.type === 'SYSTEM' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500' : 
                                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
        )}>
          {alert.type === 'CRITICAL' ? <Alert className="h-5 w-5 md:h-6 md:w-6" /> : <Settings className="h-5 w-5 md:h-6 md:w-6" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] opacity-40">{alert.type} • {alert.time}</span>
            {alert.active && <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />}
          </div>
          <p className="text-sm md:text-lg font-bold text-foreground leading-snug group-hover:text-indigo-400 transition-colors break-words">{alert.message}</p>
        </div>

        {/* Check Button (Desktop only click trigger) */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={(e) => { e.stopPropagation(); onMarkRead(alert.id); }}
          className="rounded-full hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex shrink-0"
        >
          <Check className="h-5 w-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default function AlertsPage() {
  const [alerts, setAlerts] = React.useState([
    { id: 1, type: 'CRITICAL', message: 'Low water supply in Sector Delta. Immediate deployment required.', time: '2m ago', active: true },
    { id: 2, type: 'SYSTEM', message: 'Neural link calibration complete. Accuracy at 98.4%.', time: '15m ago', active: false },
    { id: 3, type: 'MISSION', message: 'New mission: Emergency Relief Hub setup in Alpha Sector.', time: '1h ago', active: true },
    { id: 4, type: 'SECURITY', message: 'New security protocol A-42 implemented for data encryption.', time: '3h ago', active: false },
  ]);

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, active: false })).filter(a => false)); // Acknowledge all clears the monitor
  };

  const handleMarkRead = (id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, active: false } : a).filter(a => a.id !== id));
  };

  const handleRemove = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 font-body transition-all bg-background">
      <div className="max-w-4xl mx-auto py-6 md:py-10 space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                <Bell className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">System Monitoring active</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">Alert <span className="text-muted-foreground/20">Protocol</span></h1>
          </div>
          {alerts.length > 0 && (
            <Button 
              onClick={markAllRead}
              variant="outline" 
              className="rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-secondary h-12 px-8 w-full sm:w-auto"
            >
              Acknowledge All
            </Button>
          )}
        </div>

        <div className="space-y-4 overflow-x-hidden p-1">
          <AnimatePresence>
            {alerts.map((alert, i) => (
              <SwipeableAlertCard 
                key={alert.id}
                alert={alert}
                onMarkRead={handleMarkRead}
                onRemove={handleRemove}
                index={i}
              />
            ))}
          </AnimatePresence>
          {alerts.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-card/20 border border-border/40 rounded-[2.5rem]"
            >
              <Check className="h-10 w-10 mx-auto text-emerald-500 mb-3" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                All monitoring systems clear • No active alerts
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
