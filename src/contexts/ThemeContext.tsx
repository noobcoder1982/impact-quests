import * as React from "react"
export type Theme = 'light' | 'dark'
export type ColorVariant = 'standard' | 'mono' | 'graphite' | 'slate' | 'onyx'

interface ThemeContextType {
  theme: Theme
  variant: ColorVariant
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  setVariant: (variant: ColorVariant) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme
      if (saved) return saved
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (storedUser.theme) return storedUser.theme

      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  const [variant, setVariant] = React.useState<ColorVariant>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-variant') as ColorVariant
      if (saved) return saved

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (storedUser.themeVariant) return storedUser.themeVariant
      
      return 'mono'
    }
    return 'mono'
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    root.setAttribute('data-variant', variant)
    
    localStorage.setItem('theme', theme)
    localStorage.setItem('theme-variant', variant)
    
    // Also try to sync with user object if it exists
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.theme !== theme || user.themeVariant !== variant) {
          user.theme = theme
          user.themeVariant = variant
          localStorage.setItem('user', JSON.stringify(user))
        }
      } catch (e) {}
    }
  }, [theme, variant])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, variant, toggleTheme, setTheme, setVariant }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
