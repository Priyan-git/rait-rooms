"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"

interface ScrollToBottomButtonProps {
  onClick: () => void
}

export function ScrollToBottomButton({ onClick }: ScrollToBottomButtonProps) {
  return (
    <div className="fixed bottom-20 right-4 z-10">
      <Button
        onClick={onClick}
        size="sm"
        className="h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
      >
        <ArrowDown className="h-4 w-4" />
        <span className="sr-only">Scroll to bottom</span>
      </Button>
    </div>
  )
}
