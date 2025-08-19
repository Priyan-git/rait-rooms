interface HandleBadgeProps {
    handle: string
  }
  
  export function HandleBadge({ handle }: HandleBadgeProps) {
    return (
      <div className="inline-flex items-center rounded-full bg-indigo-50 dark:bg-indigo-100/10 px-2.5 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
        {handle}
      </div>
    )
  }
  