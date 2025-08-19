"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

interface ComposerProps {
  onSendMessage: (text: string) => Promise<void>
  disabled?: boolean
}

export function Composer({ onSendMessage, disabled = false }: ComposerProps) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = async () => {
    const trimmedMessage = message.trim()
    if (!trimmedMessage || isSending || disabled) return

    setIsSending(true)
    setMessage("")

    try {
      await onSendMessage(trimmedMessage)
    } finally {
      setIsSending(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = message.trim().length > 0 && !isSending && !disabled

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <Textarea
          ref={textareaRef}
          placeholder={disabled ? "Disconnected..." : "Type a message... (Enter to send, Shift+Enter for new line)"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          className="min-h-[44px] max-h-32 resize-none"
          rows={1}
        />
      </div>
      <Button
        onClick={handleSend}
        disabled={!canSend}
        size="sm"
        className="h-11 px-3 bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        <Send className="h-4 w-4" />
        <span className="sr-only">Send message</span>
      </Button>
    </div>
  )
}
