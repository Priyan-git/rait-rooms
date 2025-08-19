import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const defaultRooms = [
  { id: "general", name: "General Chat" },
  { id: "study-group", name: "Study Group" },
  { id: "tech-talk", name: "Tech Talk" },
  { id: "random", name: "Random" },
  { id: "music", name: "Music Room" },
  { id: "gaming", name: "Gaming Zone" },
  { id: "movies", name: "Movie Club" },
  { id: "books", name: "Book Club" },
];

export async function initializeRooms() {
  try {
    for (const room of defaultRooms) {
      await setDoc(
        doc(db, "rooms", room.id),
        {
          name: room.name,
          createdAt: serverTimestamp(),
          lastMessageAt: serverTimestamp(),
          isLocked: false,
        },
        { merge: true }
      );
    }
    console.log("Rooms initialized successfully!");
  } catch (error) {
    console.error("Error initializing rooms:", error);
  }
}
