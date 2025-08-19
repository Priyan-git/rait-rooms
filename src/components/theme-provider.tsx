"use client"

import * as React from "react"

type Theme = "dark" | "light" | "system"

interface ThemeProviderContext {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = React.createContext<ThemeProviderContext | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  enableSystem?: boolean
}

export function ThemeProvider({ 
  children, 
  defaultTheme = "system",
  enableSystem = true
}: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false)
  const [theme, setTheme] = React.useState<Theme>(defaultTheme)

  React.useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("theme") as Theme
    if (stored) {
      setTheme(stored)
    }
  }, [defaultTheme])

  React.useEffect(() => {
    if (!mounted) return
    
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    localStorage.setItem("theme", theme)
  }, [theme, enableSystem, mounted])

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return <ThemeProviderContext.Provider value={{ theme, setTheme }}>{children}</ThemeProviderContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
