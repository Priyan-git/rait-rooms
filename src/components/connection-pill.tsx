import { cn } from "@/lib/utils"
import type { ConnectionStatus } from "@/lib/types"

interface ConnectionPillProps {
  status: ConnectionStatus
}

export function ConnectionPill({ status }: ConnectionPillProps) {
  const statusConfig = {
    online: {
      text: "Online",
      className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      dotClassName: "bg-green-500",
    },
    reconnecting: {
      text: "Reconnecting...",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      dotClassName: "bg-yellow-500 animate-pulse",
    },
    offline: {
      text: "Offline",
      className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      dotClassName: "bg-red-500",
    },
  }

  const config = statusConfig[status]

  return (
    <div
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", config.className)}
    >
      <div className={cn("h-1.5 w-1.5 rounded-full", config.dotClassName)} />
      {config.text}
    </div>
  )
}
