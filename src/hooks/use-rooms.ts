import { useState, useEffect } from "react"
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Room } from "@/lib/types"

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const roomsRef = collection(db, "rooms")
    const q = query(roomsRef, orderBy("lastMessageAt", "desc"), limit(10))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const roomsData: Room[] = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            title: data.name || doc.id,
            lastMessageAt: data.lastMessageAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          }
        })
        setRooms(roomsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching rooms:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { rooms, loading }
}
