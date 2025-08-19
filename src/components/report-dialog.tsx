"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface ReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  messageId: string
  messageText: string
}

export function ReportDialog({ open, onOpenChange, messageText }: ReportDialogProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!reason.trim()) return

    setIsSubmitting(true)

    // Simulate report submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Report submitted",
      description: "Thank you for helping keep our community safe. We'll review this message.",
    })

    setReason("")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Message</DialogTitle>
          <DialogDescription>
            Help us maintain a safe and respectful community by reporting inappropriate content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground mb-1">Reported message:</p>
            <p className="text-sm font-medium">{messageText}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for reporting</Label>
            <Textarea
              id="reason"
              placeholder="Please describe why you're reporting this message..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason.trim() || isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
