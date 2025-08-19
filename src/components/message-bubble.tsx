"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ReportDialog } from "@/components/report-dialog"
import { Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "@/lib/types"

interface MessageBubbleProps {
  message: Message
  showHandle: boolean
  userHandle: string
}

export function MessageBubble({ message, showHandle, userHandle }: MessageBubbleProps) {
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const isMine = message.handle === userHandle

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  return (
    <div
      className={cn("flex", isMine ? "justify-end" : "justify-start")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn("max-w-[75%] space-y-1", isMine ? "items-end" : "items-start")}>
        {showHandle && (
          <div className={cn("text-xs font-medium text-muted-foreground uppercase tracking-wide px-3")}>
            {message.handle}
          </div>
        )}

        <div className="relative group">
          <div
            className={cn(
              "rounded-2xl px-4 py-2 text-sm break-words whitespace-pre-wrap",
              isMine ? "bg-indigo-600 text-white rounded-br-md" : "bg-muted text-foreground rounded-bl-md",
              "shadow-sm",
            )}
          >
            {message.text}
            <div className={cn("text-xs mt-1 opacity-70", isMine ? "text-indigo-100" : "text-muted-foreground")}>
              {formatTime(message.createdAt)}
            </div>
          </div>

          {/* Hover Actions */}
          {isHovered && !isMine && (
            <div className="absolute -right-2 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 bg-background border shadow-sm"
                onClick={() => setShowReportDialog(true)}
              >
                <Flag className="h-3 w-3" />
                <span className="sr-only">Report message</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        messageId={message.id}
        messageText={message.text}
      />
    </div>
  )
}
