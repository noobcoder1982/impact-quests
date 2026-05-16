import * as React from "react"
import { motion } from "framer-motion"
import { 
  Shield01Icon as Shield, 
  FlashIcon as Zap, 
  Target01Icon as Target, 
  Notification01Icon as Bell, 
  DocumentCodeIcon as FileText, 
  Alert01Icon as AlertTriangle 
} from "hugeicons-react"

export default function GenericMissionPage({ title, icon: Icon }: { title: string, icon: any }) {
  return (
    <div className="flex-1 overflow-y-auto p-10 font-body transition-all">
      <div className="max-w-6xl mx-auto py-20">
        <div className="flex flex-col items-center text-center">
           <div className="h-24 w-24 rounded-[2rem] bg-accent/10 flex items-center justify-center mb-8 border border-accent/20 animate-pulse">
              <Icon className="h-10 w-10 text-accent" />
           </div>
           <h1 className="text-6xl font-display leading-none tracking-tight mb-6">{title}</h1>
           <p className="text-muted-foreground text-xl max-w-xl font-medium leading-relaxed italic mb-12">
             "Strategic synchronization of sector resources. The interface for this module is undergoing AI-optimization."
           </p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
              <div className="p-8 rounded-[3rem] border border-border bg-background shadow-sm hover:border-accent/40 transition-colors">
                 <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</div>
                 <div className="text-2xl font-semibold">Decrypting...</div>
              </div>
              <div className="p-8 rounded-[3rem] border border-border bg-background shadow-sm hover:border-accent/40 transition-colors">
                 <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Queue</div>
                 <div className="text-2xl font-semibold">Priority 1</div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
