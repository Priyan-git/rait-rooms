// src/lib/types.ts

// Use type-only import so this file stays tree-shakeable
import type { Timestamp } from "firebase/firestore";

/* =========================
 * Firestore (backend) shapes
 * ========================= */

// Rooms you store in Firestore
export type FirestoreRoom = {
  // doc id = roomId
  name?: string;                // readable name (you set name: roomId)
  createdBy?: string;           // uid of creator
  createdAt?: Timestamp;        // serverTimestamp()
  isLocked?: boolean;           // (you set false)
  lastMessageAt?: Timestamp;    // serverTimestamp()
};

// Messages you store in Firestore
export type FirestoreMessage = {
  text: string;
  uid?: string;                 // sender uid (anon auth)
  authorHandle?: string;        // e.g., "anon-7f3"
  type?: "user" | "bot" | "system";
  createdAt?: Timestamp;        // serverTimestamp()
  roomId?: string;              // (optional in doc; you add in code sometimes)
};

/* =========================
 * UI (frontend) view models
 * ========================= */

// Minimal room shape used by the UI (string dates)
export type Room = {
  id: string;                   // roomId (doc id)
  title?: string;               // mapped from FirestoreRoom.name
  lastMessageAt?: string;       // ISO string mapped from Timestamp
};

// Message shape used by the UI components (v0 expects this)
export type Message = {
  id: string;                   // message doc id
  roomId: string;
  text: string;
  handle: string;               // mapped from FirestoreMessage.authorHandle
  createdAt: string;            // ISO string ("" while pending)
  isMine?: boolean;             // derived in UI (handle/uid match)
};

export type ConnectionStatus = "online" | "reconnecting" | "offline";
