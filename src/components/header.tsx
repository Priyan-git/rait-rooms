"use client"

import Link from "next/link"
import { Moon, Sun, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HandleBadge } from "@/components/handle-badge"
import { useTheme } from "@/components/theme-provider"

type Theme = "dark" | "light" | "system"

interface HeaderProps {
  roomId?: string
  userHandle: string
  roomName?: string
}

export function Header({ roomId, userHandle, roomName }: HeaderProps) {
     let theme: Theme = "system"
   let setTheme = (_: Theme) => {}

   try {
     const themeContext = useTheme()
     theme = themeContext?.theme || "system"
     setTheme = themeContext?.setTheme || ((_: Theme) => {})
   } catch {
     // Theme provider not available, use defaults
   }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-xl mx-auto items-center justify-between px-3 sm:px-4 lg:px-6">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">R</span>
            </div>
            <span className="font-semibold text-base sm:text-lg truncate">RAIT Rooms</span>
          </Link>
          {roomId && (
            <>
              <span className="text-muted-foreground hidden sm:inline">/</span>
              <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-none">
                {roomName || roomId}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <HandleBadge handle={userHandle} />
          {roomId && (
            <Button variant="ghost" size="sm" asChild className="h-8 w-8 sm:h-9 sm:w-9 p-0">
              <Link href="/">
                <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="sr-only">Go to lobby</span>
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-8 w-8 sm:h-9 sm:w-9 p-0"
          >
            <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-3.5 w-3.5 sm:h-4 sm:w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

  