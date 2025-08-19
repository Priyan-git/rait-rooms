"use client"

import { forwardRef } from "react"
import { MessageBubble } from "@/components/message-bubble"
import { MessageSkeleton } from "@/components/message-skeleton"
import { EmptyState } from "@/components/empty-stage"
import type { Message } from "@/lib/types"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  onScroll: () => void
  userHandle: string
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, isLoading, onScroll, userHandle }, ref) => {
    if (isLoading) {
      return (
        <div className="flex-1 space-y-4 py-4">
          <MessageSkeleton />
          <MessageSkeleton />
          <MessageSkeleton />
        </div>
      )
    }

    if (messages.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center py-8">
          <EmptyState />
        </div>
      )
    }

    // Group consecutive messages by the same handle
    const groupedMessages = messages.reduce((groups: Message[][], message) => {
      const lastGroup = groups[groups.length - 1]
      if (lastGroup && lastGroup[0].handle === message.handle) {
        lastGroup.push(message)
      } else {
        groups.push([message])
      }
      return groups
    }, [])

    return (
      <div ref={ref} className="flex-1 overflow-y-auto py-4 space-y-4" onScroll={onScroll}>
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-1">
            {group.map((message, messageIndex) => (
              <MessageBubble
                key={message.id}
                message={message}
                showHandle={messageIndex === 0}
                userHandle={userHandle}
              />
            ))}
          </div>
        ))}
      </div>
    )
  },
)

MessageList.displayName = "MessageList"
