import { MessageCircle } from "lucide-react"

export function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-24 w-24 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
        <MessageCircle className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">No messages yet</h3>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto">
        Be the first to say hi! Start a conversation and get this room buzzing.
      </p>
    </div>
  )
}
