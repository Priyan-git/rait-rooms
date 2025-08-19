import { Skeleton } from "@/components/ui/skeleton"

export function MessageSkeleton() {
  return (
    <div className="space-y-4">
      {/* Other user's message */}
      <div className="flex justify-start">
        <div className="max-w-[75%] space-y-2">
          <Skeleton className="h-3 w-16" />
          <div className="bg-muted rounded-2xl rounded-bl-md p-4 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>

      {/* My message */}
      <div className="flex justify-end">
        <div className="max-w-[75%] space-y-2">
          <div className="bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl rounded-br-md p-4 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  )
}
