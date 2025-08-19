RAIT Rooms — Anonymous College Chat

Real‑time, anonymous, multi‑room chat for your college community.
Built with Next.js (App Router), TypeScript, Tailwind + shadcn/ui, and Firebase (Auth + Firestore).
Deployed on Vercel.

✨ Features

Anonymous sign‑in (signInAnonymously) with a persistent handle (anon-xyz in localStorage)

Rooms: create/join any roomId (e.g., study, fun, tech)

Messaging: real‑time onSnapshot stream, bubble UI, timestamps, auto‑scroll

Reports: write‑only reports collection (no public reads)

Security rules: public reads, authenticated writes, no edits/deletes

Responsive UI: modern, minimal; dark/light theme; “scroll to bottom” FAB; connection pill

🧱 Tech Stack

Frontend: Next.js 14 (App Router), React, TypeScript

UI: Tailwind CSS, shadcn/ui, lucide-react, next-themes

Backend: Firebase Auth (Anonymous), Cloud Firestore

Deploy: Vercel

🗂️ Project Structure
src/
  app/
    layout.tsx
    globals.css
    page.tsx                # Lobby
    chat/
      [roomId]/
        page.tsx            # Room chat page
  components/
    RoomSwitcher.tsx
    ui/
      header.tsx
      composer.tsx
      message-list.tsx
      connection-pill.tsx
      scroll-to-bottom-button.tsx
      ... (shadcn components as needed)
  lib/
    firebase.ts
    types.ts
    utils.ts

🔐 Firestore Data Model

Collections

rooms/{roomId}

name: string

createdBy?: string (uid)

createdAt: serverTimestamp()

isLocked: boolean (default false)

lastMessageAt: serverTimestamp()

messages/{msgId}

text: string

uid: string (sender)

authorHandle: string (e.g., anon-7f3)

type: "user" | "bot" | "system"

createdAt: serverTimestamp()

reports/{reportId} (write‑only)

roomId: string

msgId: string

reason: string

reportedAt: request.time (server time)

Indexes
Create a composite index for message queries if prompted by Firebase console:

rooms/{roomId}/messages ordered by createdAt

🧭 Routes

/ — Lobby (featured rooms, join/create by ID)

/chat/[roomId] — Room chat

🚀 Getting Started
1) Prerequisites

Node.js 18+

Firebase project (Project ID)

Vercel account (optional, for deploy)

2) Env Setup

Create .env.local (not committed):

NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID


Keep .env.example in the repo for reference.

3) Install & Run
pnpm i     # or npm i / yarn
pnpm dev   # or npm run dev


Open http://localhost:3000, join /chat/test and start typing.

🔧 Firebase Setup

Auth: Enable Anonymous sign‑in provider.

Firestore: Create database in production mode (or test with emulators).

Security rules (example skeleton; align with your current rules):

rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /rooms/{roomId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if false;

      match /messages/{msgId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update, delete: if false;
      }
    }
    match /reports/{reportId} {
      allow create: if request.auth != null
        && request.resource.data.roomId is string
        && request.resource.data.msgId is string
        && request.resource.data.reason is string
        && request.resource.data.reportedAt == request.time;
      allow read, update, delete: if false;
    }
  }
}


Commit your firestore.rules and firestore.indexes.json for reproducible setup.

🏗️ Development Notes

Anonymous handle is stored at localStorage["rait-handle"].

Messages use serverTimestamp(); UI tolerates createdAt being null on first paint.

Always unsubscribe Firestore listeners on unmount.

Consider pagination/virtualization for very busy rooms.

🧪 Scripts (optional)

Seed a few rooms for first‑run UX:

// scripts/seed.ts (example)
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import "dotenv/config";

const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
});
const db = getFirestore(app);

async function run() {
  const rooms = ["study", "fun", "tech", "placements"];
  await Promise.all(
    rooms.map((r) =>
      setDoc(
        doc(db, "rooms", r),
        { name: r, isLocked: false, createdAt: serverTimestamp(), lastMessageAt: serverTimestamp() },
        { merge: true }
      )
    )
  );
  console.log("Seeded:", rooms.join(", "));
}
run();


Run with ts-node or compile/run via tsx.

🛡️ Git Hygiene

Commit:

Source (src/**), rules, indexes

.env.example, README.md, firebase.json

Ignore:

node_modules/
.next/
dist/
out/
.env
.env.local
.env.*.local
.DS_Store

🗺️ Roadmap

 Infinite scroll + message pagination

 Better empty/loading states (skeletons)

 Message “report” modal + toast (wired to reports)

 Theming polish + animations (Framer Motion)

 Admin/moderation dashboard (basic)

 AI bot room (optional)

🧩 Troubleshooting

Push rejected (fetch first)
git pull origin main --rebase then git push
(or git push --force to overwrite remote if it’s empty/placeholder)

Permission errors writing messages
Ensure Anonymous Auth is enabled and rules allow create for authed users.

Missing index error
Click the Firebase console prompt to auto‑create; commit firestore.indexes.json.

Hydration warnings / localStorage
Access localStorage only in client components or inside useEffect.

📄 License

RAIT © Priyan Khandelwal
