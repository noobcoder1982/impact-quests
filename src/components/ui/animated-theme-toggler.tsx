"use client"

import { useRef, useCallback } from "react"
import { flushSync } from "react-dom"
import { MoonIcon as Moon, Sun01Icon as Sun } from "hugeicons-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
// Integrated with existing ThemeContext
import { useTheme } from "../../contexts/ThemeContext"

type AnimatedThemeTogglerProps = {
  className?: string
}

export const AnimatedThemeToggler = ({ className }: AnimatedThemeTogglerProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { theme, toggleTheme } = useTheme()
  const darkMode = theme === 'dark'

  const onToggle = useCallback(async () => {
    if (!buttonRef.current || !document.startViewTransition) {
      toggleTheme()
      return
    }

    // Get the exact center of the circular button for the origin
    const rect = buttonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const maxDistance = Math.hypot(
      Math.max(centerX, window.innerWidth - centerX),
      Math.max(centerY, window.innerHeight - centerY)
    )

    // Determine transition direction
    const isNextDark = !darkMode
    const transitionClass = isNextDark ? "to-dark-transition" : "to-light-transition"
    document.documentElement.classList.add(transitionClass)
    
    // Trigger theme swap within the View Transition
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        toggleTheme()
      })
    })

    try {
      await transition.ready
      
      const animation = document.documentElement.animate(
        {
          clipPath: isNextDark
            ? [
                `circle(${maxDistance}px at ${centerX}px ${centerY}px)`,
                `circle(0px at ${centerX}px ${centerY}px)`,
              ]
            : [
                `circle(0px at ${centerX}px ${centerY}px)`,
                `circle(${maxDistance}px at ${centerX}px ${centerY}px)`,
              ],
        },
        {
          duration: 450,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: isNextDark ? "::view-transition-old(root)" : "::view-transition-new(root)",
        }
      )

      await animation.finished
    } finally {
      document.documentElement.classList.remove(transitionClass)
    }
  }, [toggleTheme, darkMode])

  return (
    <button
      ref={buttonRef}
      onClick={onToggle}
      aria-label="Switch theme"
      className={cn(
        "flex items-center justify-center h-10 w-10 rounded-full border border-border bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 outline-none focus:ring-0",
        className
      )}
      type="button"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, scale: 0.5, rotate: theme === 'dark' ? 25 : -25 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
