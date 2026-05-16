import * as React from "react"

export type TerminationPhase = 'idle' | 'hold' | 'destabilize' | 'breakdown' | 'collapse' | 'exit'

interface TerminationContextType {
  phase: TerminationPhase
  holdProgress: number // 0 to 100
  startTermination: () => void
  cancelTermination: () => void
  onExitComplete: () => void
}

const TerminationContext = React.createContext<TerminationContextType | undefined>(undefined)

export function TerminationProvider({ children, onLogout }: { children: React.ReactNode, onLogout: () => void }) {
  const [phase, setPhase] = React.useState<TerminationPhase>('idle')
  const [holdProgress, setHoldProgress] = React.useState(0)
  const timerRef = React.useRef<any>(null)
  const startTimeRef = React.useRef<number>(0)

  const startTermination = () => {
    setPhase('hold')
    startTimeRef.current = Date.now()
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const progress = Math.min((elapsed / 3000) * 100, 100)
      setHoldProgress(progress)

      if (elapsed >= 500 && elapsed < 1500) setPhase('destabilize')
      if (elapsed >= 1500 && elapsed < 2500) setPhase('breakdown')
      if (elapsed >= 2500 && elapsed < 3000) setPhase('collapse')
      
      if (elapsed >= 3000) {
        clearInterval(timerRef.current)
        setPhase('exit')
        setTimeout(() => {
          onLogout()
          setPhase('idle')
          setHoldProgress(0)
        }, 600)
      }
    }, 20)
  }

  const cancelTermination = () => {
    clearInterval(timerRef.current)
    setPhase('idle')
    setHoldProgress(0)
  }

  return (
    <TerminationContext.Provider value={{ 
      phase, 
      holdProgress, 
      startTermination, 
      cancelTermination,
      onExitComplete: onLogout 
    }}>
      {children}
    </TerminationContext.Provider>
  )
}

export function useTermination() {
  const context = React.useContext(TerminationContext)
  if (!context) throw new Error("useTermination must be used within TerminationProvider")
  return context
}
