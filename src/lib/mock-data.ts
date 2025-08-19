import type { Room, Message } from "./types"

// Get current time for recent activity
const now = new Date()
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000)

export const FEATURED_ROOMS: Room[] = [
  { id: "general", title: "General Chat", lastMessageAt: oneHourAgo.toISOString() },
  { id: "study-group", title: "Study Group", lastMessageAt: twoHoursAgo.toISOString() },
  { id: "tech-talk", title: "Tech Talk", lastMessageAt: threeHoursAgo.toISOString() },
  { id: "random", title: "Random", lastMessageAt: now.toISOString() },
  { id: "music", title: "Music Room", lastMessageAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString() },
  { id: "gaming", title: "Gaming Zone", lastMessageAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString() },
  { id: "movies", title: "Movie Club", lastMessageAt: new Date(now.getTime() - 90 * 60 * 1000).toISOString() },
  { id: "books", title: "Book Club", lastMessageAt: new Date(now.getTime() - 120 * 60 * 1000).toISOString() },
]

export const SAMPLE_MESSAGES: Message[] = [
  {
    id: "1",
    roomId: "general",
    text: "Hey everyone! How's everyone doing today?",
    handle: "anon-7f3",
    createdAt: "2024-01-15T10:25:00Z",
    isMine: false,
  },
  {
    id: "2",
    roomId: "general",
    text: "Pretty good! Just finished my morning classes.",
    handle: "anon-9k2",
    createdAt: "2024-01-15T10:26:00Z",
    isMine: false,
  },
  {
    id: "3",
    roomId: "general",
    text: "Same here! Anyone up for lunch later?",
    handle: "anon-4x8",
    createdAt: "2024-01-15T10:27:00Z",
    isMine: true,
  },
]

export const generateHandle = (): string => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  const suffix = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `anon-${suffix}`
}
