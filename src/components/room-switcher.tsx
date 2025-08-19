"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Search, MessageCircle, Users, ArrowRight } from "lucide-react"
import { FEATURED_ROOMS } from "@/lib/mock-data"
import type { Room } from "@/lib/types"

interface RoomSwitcherProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRoomId: string
}

export function RoomSwitcher({ open, onOpenChange, currentRoomId }: RoomSwitcherProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  const filteredRooms = FEATURED_ROOMS.filter(
    (room) =>
      room.id !== currentRoomId &&
      (room.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.id.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleJoinRoom = async (roomId: string) => {
    setIsJoining(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    router.push(`/rooms/${roomId}`)
    onOpenChange(false)
    setIsJoining(false)
  }

  const formatLastActive = (lastMessageAt?: string) => {
    if (!lastMessageAt) return "No recent activity"

    const date = new Date(lastMessageAt)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-indigo-600" />
            Switch Room
          </SheetTitle>
          <SheetDescription>Choose a different room to join the conversation</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Current Room */}
          <div className="rounded-lg border-2 border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Current Room</p>
                <p className="text-indigo-600 dark:text-indigo-400 font-semibold">{currentRoomId}</p>
              </div>
              <Badge
                variant="secondary"
                className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
              >
                Active
              </Badge>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Room List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredRooms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No rooms found</p>
              </div>
            ) : (
              filteredRooms.map((room: Room) => (
                <button
                  key={room.id}
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={isJoining}
                  className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{room.title || room.id}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatLastActive(room.lastMessageAt)}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/")}>
              Back to Lobby
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

