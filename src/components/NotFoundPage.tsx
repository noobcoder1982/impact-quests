import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft01Icon as ArrowLeft, RotateRightIcon as Rotate, SparklesIcon as Sparkles, TrophyIcon as Trophy, VolumeHighIcon as SoundOn, VolumeMuteIcon as SoundOff } from "hugeicons-react"
import { Button } from "./ui/button"

export default function NotFoundPage() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isGameOver, setIsGameOver] = React.useState(false)
  const [score, setScore] = React.useState(0)
  const [highScore, setHighScore] = React.useState(() => {
    return Number(localStorage.getItem("dino_highscore") || "0")
  })
  const [muted, setMuted] = React.useState(false)
  const [hasStartedOnce, setHasStartedOnce] = React.useState(false)

  // Game state references to prevent closure lag in requestAnimationFrame
  const gameStateRef = React.useRef({
    isPlaying: false,
    score: 0,
    speed: 6,
    dinoY: 0,
    dinoVelocity: 0,
    isJumping: false,
    obstacles: [] as { x: number; width: number; height: number; type: 'barrel' | 'drone' | 'spikes'; y: number }[],
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number }[],
    nextObstacleTimer: 0,
    backgroundOffset: 0
  })

  // Play synthesized retro-futuristic sound effects
  const playSound = (type: 'jump' | 'score' | 'hit') => {
    if (muted) return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === 'jump') {
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(150, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15)
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
        osc.start()
        osc.stop(ctx.currentTime + 0.15)
      } else if (type === 'score') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08) // E5
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)
        osc.start()
        osc.stop(ctx.currentTime + 0.25)
      } else if (type === 'hit') {
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(120, ctx.currentTime)
        osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.3)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
      }
    } catch (e) {
      // Audio context block protection
    }
  }

  // Jump triggering
  const triggerJump = React.useCallback(() => {
    const s = gameStateRef.current
    if (!s.isPlaying) {
      startGame()
      return
    }
    if (!s.isJumping) {
      s.dinoVelocity = -12.5
      s.isJumping = true
      playSound('jump')
      // Create jump spark particles
      for (let i = 0; i < 8; i++) {
        s.particles.push({
          x: 60,
          y: 150 - s.dinoY,
          vx: -2 - Math.random() * 3,
          vy: Math.random() * 4 - 2,
          color: 'rgba(99, 102, 241, 0.8)', // indigo-500
          size: 2 + Math.random() * 3,
          alpha: 1
        })
      }
    }
  }, [])

  // Start / Restart Game
  const startGame = () => {
    setIsPlaying(true)
    setIsGameOver(false)
    setScore(0)
    setHasStartedOnce(true)
    
    gameStateRef.current = {
      isPlaying: true,
      score: 0,
      speed: 6,
      dinoY: 0,
      dinoVelocity: 0,
      isJumping: false,
      obstacles: [],
      particles: [],
      nextObstacleTimer: 30,
      backgroundOffset: 0
    }
  }

  // Handle keys and clicks
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault()
        triggerJump()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [triggerJump])

  // Canvas Game Loop
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    const canvasWidth = 800
    const canvasHeight = 200

    const updateAndDraw = () => {
      const s = gameStateRef.current

      // Clear canvas with deep neon backdrop
      ctx.fillStyle = "#09090b" // zinc-950
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // Draw Grid Line Patterns
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)"
      ctx.lineWidth = 1
      for (let x = 0; x < canvasWidth; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x - (s.backgroundOffset % 40), 0)
        ctx.lineTo(x - (s.backgroundOffset % 40), canvasHeight)
        ctx.stroke()
      }

      // Draw floor line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, 150)
      ctx.lineTo(canvasWidth, 150)
      ctx.stroke()

      if (s.isPlaying) {
        s.backgroundOffset += s.speed
        s.score += 0.15
        const currentRoundedScore = Math.floor(s.score)
        setScore(currentRoundedScore)

        // Speed up gradually
        if (currentRoundedScore > 0 && currentRoundedScore % 100 === 0) {
          s.speed += 0.05
          if (currentRoundedScore % 500 === 0) playSound('score')
        }

        // Apply physics to Cyber Dino
        s.dinoY += s.dinoVelocity
        s.dinoVelocity += 0.6 // Gravity
        
        if (s.dinoY >= 0) {
          s.dinoY = 0
          s.dinoVelocity = 0
          s.isJumping = false
        }

        // Handle Obstacle Generation
        s.nextObstacleTimer -= 1
        if (s.nextObstacleTimer <= 0) {
          const typeRand = Math.random()
          let obstacleType: 'barrel' | 'drone' | 'spikes' = 'barrel'
          let oHeight = 20 + Math.random() * 20
          let oWidth = 15 + Math.random() * 15
          let oY = 150

          if (typeRand > 0.7) {
            obstacleType = 'drone'
            oHeight = 15
            oWidth = 25
            oY = 70 + Math.random() * 40 // Flying drone
          } else if (typeRand > 0.45) {
            obstacleType = 'spikes'
            oHeight = 15
            oWidth = 35
          }

          s.obstacles.push({
            x: canvasWidth,
            width: oWidth,
            height: oHeight,
            type: obstacleType,
            y: oY
          })
          
          s.nextObstacleTimer = 70 + Math.random() * 80 - s.speed * 2
        }

        // Update & Draw Obstacles
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i]
          obs.x -= s.speed

          // Draw obstacle with cyber style
          if (obs.type === 'drone') {
            // Neon cyan drone
            ctx.fillStyle = "#06b6d4" // cyan-500
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height)
            ctx.fillStyle = "rgba(6, 182, 212, 0.4)"
            ctx.fillRect(obs.x - 4, obs.y + 4, obs.width + 8, obs.height - 8)
            // Drone rotors
            ctx.fillStyle = "#ffffff"
            ctx.fillRect(obs.x - 6, obs.y - 2, 8, 2)
            ctx.fillRect(obs.x + obs.width - 2, obs.y - 2, 8, 2)
          } else if (obs.type === 'spikes') {
            // Neon rose spikes
            ctx.fillStyle = "#f43f5e" // rose-500
            ctx.beginPath()
            ctx.moveTo(obs.x, 150)
            ctx.lineTo(obs.x + obs.width / 2, 150 - obs.height)
            ctx.lineTo(obs.x + obs.width, 150)
            ctx.closePath()
            ctx.fill()
            
            // Outer glow
            ctx.strokeStyle = "rgba(244, 63, 94, 0.4)"
            ctx.lineWidth = 4
            ctx.stroke()
          } else {
            // Neon orange barrel
            ctx.fillStyle = "#f97316" // orange-500
            ctx.fillRect(obs.x, 150 - obs.height, obs.width, obs.height)
            // Stripes
            ctx.fillStyle = "#000000"
            ctx.fillRect(obs.x, 150 - obs.height + 6, obs.width, 3)
            ctx.fillRect(obs.x, 150 - obs.height + 18, obs.width, 3)
          }

          // Collision check: Dino box is x: 40 to 70, y: 150 - dinoY - 35 to 150 - dinoY
          const dinoLeft = 40
          const dinoRight = 70
          const dinoTop = 150 - s.dinoY - 35
          const dinoBottom = 150 - s.dinoY

          const obsLeft = obs.x
          const obsRight = obs.x + obs.width
          const obsTop = obs.type === 'drone' ? obs.y : 150 - obs.height
          const obsBottom = obs.type === 'drone' ? obs.y + obs.height : 150

          if (dinoRight > obsLeft + 4 && dinoLeft < obsRight - 4 &&
              dinoBottom > obsTop + 4 && dinoTop < obsBottom - 4) {
            // CRASH!
            s.isPlaying = false
            setIsPlaying(false)
            setIsGameOver(true)
            playSound('hit')

            // High Score logic
            const finalScore = Math.floor(s.score)
            if (finalScore > highScore) {
              setHighScore(finalScore)
              localStorage.setItem("dino_highscore", String(finalScore))
            }

            // Explode particles
            for (let p = 0; p < 25; p++) {
              s.particles.push({
                x: 55,
                y: 150 - s.dinoY - 15,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 3,
                color: Math.random() > 0.5 ? '#6366f1' : '#f43f5e',
                size: 2 + Math.random() * 4,
                alpha: 1
              })
            }
          }

          // Remove off-screen obstacles
          if (obs.x + obs.width < 0) {
            s.obstacles.splice(i, 1)
          }
        }
      }

      // Draw Dino (Impact Bot)
      const dinoHeight = 35
      const dinoWidth = 30
      const dinoX = 40
      const dinoYPos = 150 - s.dinoY - dinoHeight

      // Cyber glowing body
      ctx.fillStyle = "#6366f1" // indigo-500 (Base)
      ctx.fillRect(dinoX, dinoYPos, dinoWidth, dinoHeight)
      
      // Face screen / visor
      ctx.fillStyle = "#22c55e" // emerald-500 (Visor screen)
      ctx.fillRect(dinoX + 18, dinoYPos + 6, 10, 8)
      
      // Cyber legs (little animation when running on ground)
      const legOffset = (Math.floor(s.backgroundOffset / 10) % 2 === 0) && !s.isJumping
      ctx.fillStyle = "#ffffff"
      if (legOffset) {
        ctx.fillRect(dinoX + 4, dinoYPos + dinoHeight, 6, 4)
        ctx.fillRect(dinoX + 18, dinoYPos + dinoHeight, 6, 4)
      } else {
        ctx.fillRect(dinoX + 8, dinoYPos + dinoHeight, 6, 4)
        ctx.fillRect(dinoX + 14, dinoYPos + dinoHeight, 6, 4)
      }

      // Cyber Jetpack flame when jumping
      if (s.isJumping) {
        ctx.fillStyle = "#f97316"
        ctx.fillRect(dinoX - 6, dinoYPos + 12, 6, 10)
        ctx.fillStyle = "#ef4444"
        ctx.fillRect(dinoX - 4, dinoYPos + 16, 4, 12)
      }

      // Update & Draw Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i]
        p.x += p.vx
        p.y += p.vy
        p.alpha -= 0.02
        if (p.alpha <= 0) {
          s.particles.splice(i, 1)
          continue
        }
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fillRect(p.x, p.y, p.size, p.size)
      }
      ctx.globalAlpha = 1.0 // reset global alpha

      animationId = requestAnimationFrame(updateAndDraw)
    }

    animationId = requestAnimationFrame(updateAndDraw)
    return () => cancelAnimationFrame(animationId)
  }, [muted, highScore])

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-white">
      {/* Background Matrix/Nebula Glow */}
      <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-rose-600/10 blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-3xl w-full z-10 space-y-8 text-center flex flex-col items-center">
        {/* Error Info */}
        <div className="space-y-3">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] inline-block"
          >
            System Status: 404
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-r from-white via-indigo-200 to-indigo-500 bg-clip-text text-transparent">
            SECTOR UNKNOWN
          </h1>
          <p className="text-sm md:text-base text-muted-foreground/60 max-w-md mx-auto">
            You've wandered into locked airspace. While we recalibrate your terminal grid, take command of our scout drone!
          </p>
        </div>

        {/* Dino Game Terminal Wrapper */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-zinc-900/60 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative"
        >
          {/* Top Panel Bar */}
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/40" />
              <div className="h-3 w-3 rounded-full bg-amber-500/40" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/40" />
            </div>

            {/* Live Scores */}
            <div className="flex items-center gap-6 font-mono text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground/40">
                <Trophy className="h-4 w-4" />
                <span>HI {highScore.toString().padStart(5, '0')}</span>
              </div>
              <div className="font-black text-indigo-400">
                SCORE {score.toString().padStart(5, '0')}
              </div>
              <button 
                onClick={() => setMuted(!muted)} 
                className="h-8 w-8 rounded-lg bg-zinc-800/80 flex items-center justify-center hover:bg-zinc-700/80 text-muted-foreground transition-all"
              >
                {muted ? <SoundOff className="h-4.5 w-4.5" /> : <SoundOn className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Interactive Game Canvas */}
          <div className="relative rounded-2xl overflow-hidden border border-white/5 bg-zinc-950/80">
            <canvas 
              ref={canvasRef} 
              width={800} 
              height={200}
              onClick={triggerJump}
              className="w-full h-auto block cursor-pointer"
            />

            {/* Action Overlays */}
            <AnimatePresence>
              {!hasStartedOnce && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={startGame}
                  className="absolute inset-0 bg-zinc-950/80 flex flex-col items-center justify-center cursor-pointer gap-2"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="h-14 w-14 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white"
                  >
                    <Rotate className="h-6 w-6" />
                  </motion.div>
                  <p className="text-xs uppercase font-black tracking-widest text-indigo-400 mt-2">Click to Deploy Scout</p>
                  <p className="text-[10px] text-muted-foreground/50">Or press SPACE to jump</p>
                </motion.div>
              )}

              {isGameOver && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={startGame}
                  className="absolute inset-0 bg-red-950/20 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer gap-3"
                >
                  <h3 className="text-2xl font-black uppercase tracking-widest text-rose-500">Drone offline</h3>
                  <div className="flex gap-2 items-center bg-zinc-900 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground/80">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <span>Final score: <b className="text-white font-black">{score}</b></span>
                  </div>
                  <Button variant="ghost" className="rounded-xl border border-white/10 bg-zinc-900 text-[10px] font-black uppercase tracking-widest gap-2 flex items-center">
                    <Rotate className="h-4 w-4" /> Recharge & Restart
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Global Redirect Options */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            onClick={() => window.location.href = "/dashboard"}
            className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-white text-white hover:text-black transition-all text-xs font-black uppercase tracking-widest gap-2"
          >
            <ArrowLeft className="h-4.5 w-4.5" /> Return to Command Hub
          </Button>
          <Button 
            onClick={() => window.location.href = "/"}
            variant="ghost"
            className="h-12 px-6 rounded-2xl border border-white/10 hover:bg-secondary text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-white"
          >
            Navigate Home
          </Button>
        </div>
      </div>
    </div>
  )
}
