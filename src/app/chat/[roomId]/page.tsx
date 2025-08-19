"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";

// UI components
import { Header } from "@/components/header";
import { MessageList } from "@/components/message-list";
import { Composer } from "@/components/composer";
import { ConnectionPill } from "@/components/connection-pill";
import { ScrollToBottomButton } from "@/components/scroll-to-buttom-button";
import { RoomSwitcher } from "@/components/room-switcher";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

// Types
import type { Message, ConnectionStatus } from "@/lib/types";

// Utils
import { generateRoomName } from "@/lib/room-utils";

// Components
import { RoomRenameDialog } from "@/components/room-rename-dialog";

// Firebase
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

/* ---------------- Helpers ---------------- */

function getOrCreateHandle(): string {
  if (typeof window === "undefined") return "anon";
  const KEY = "rait-handle";
  const existing = localStorage.getItem(KEY);
  if (existing) return existing;
  const handle = `anon-${Math.random().toString(36).slice(2, 5)}`;
  localStorage.setItem(KEY, handle);
  return handle;
}

/* ---------------- Page ---------------- */

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = (params?.roomId as string) ?? "";

  const [userHandle, setUserHandle] = useState<string>("anon");
  const [uid, setUid] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomName, setRoomName] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("online");
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showRoomSwitcher, setShowRoomSwitcher] = useState(false);

  // Set handle on client side only to avoid hydration mismatch
  useEffect(() => {
    setUserHandle(getOrCreateHandle());
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  /* ----- Auth (anonymous) ----- */
  useEffect(() => {
    // Ensure we're signed in anonymously
    if (!auth.currentUser) {
      signInAnonymously(auth).catch((e) => {
        console.error("Anon sign-in failed:", e);
      });
    }
    const off = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid ?? "");
    });
    return () => off();
  }, []);

  /* ----- Online / Offline pill ----- */
  useEffect(() => {
    const goOnline = () => setConnectionStatus("online");
    const goOffline = () => setConnectionStatus("offline");
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    // initial state
    setConnectionStatus(navigator.onLine ? "online" : "offline");
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  /* ----- Subscribe to messages for the room ----- */
  useEffect(() => {
    if (!roomId) return;

    // Ensure room doc exists + touch last activity (non-blocking)
    setDoc(
      doc(db, "rooms", roomId),
      { name: generateRoomName(roomId), lastMessageAt: serverTimestamp() },
      { merge: true }
    ).catch(() => {});

    // Fetch room name
    const roomDoc = doc(db, "rooms", roomId);
    const roomUnsubscribe = onSnapshot(roomDoc, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const name = data?.name || roomId;
        setRoomName(name);
      } else {
        setRoomName(roomId);
      }
    }, (error) => {
      console.error("Error fetching room:", error);
      setRoomName(roomId);
    });

    const msgsRef = collection(db, "rooms", roomId, "messages");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    const off = onSnapshot(
      q,
      (snap) => {
        const next: Message[] = snap.docs.map((d) => {
          const data = d.data() as {
            text: string;
            authorHandle: string;
            uid: string;
            createdAt: unknown;
          };
          const ts = data.createdAt as Timestamp | undefined;
          return {
            id: d.id,
            roomId,
            text: data.text ?? "",
            handle: (data.authorHandle as string) ?? "anon",
            createdAt: ts?.toDate?.()?.toISOString?.() ?? "",
            isMine: data.authorHandle === userHandle || data.uid === uid,
          };
        });
        setMessages(next);
        setIsLoading(false);
        // auto-scroll on initial load
        queueMicrotask(() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }));
      },
      (err) => {
        console.error("onSnapshot error:", err);
        setIsLoading(false);
      }
    );

    return () => {
      off();
      roomUnsubscribe();
    };
  }, [roomId, uid, userHandle]);

  /* ----- Scroll handlers ----- */
  const handleScroll = useCallback(() => {
    const el = messageListRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!nearBottom);
  }, []);

  useEffect(() => {
    if (!showScrollButton) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showScrollButton]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  /* ----- Send message -> Firestore ----- */
  const handleSendMessage = async (text: string) => {
    const clean = text.trim();
    if (!clean || !roomId || !uid) return;

    try {
      // Optional: transient "reconnecting" state if offline
      if (!navigator.onLine) setConnectionStatus("offline");

      await addDoc(collection(db, "rooms", roomId, "messages"), {
        text: clean,
        uid,
        authorHandle: userHandle,
        type: "user",
        createdAt: serverTimestamp(),
      });

      // Touch room's last activity
      await updateDoc(doc(db, "rooms", roomId), {
        lastMessageAt: serverTimestamp(),
      });

      // scroll after send
      queueMicrotask(scrollToBottom);
    } catch (e) {
      console.error("send failed:", e);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      {/* Header */}
      <Header roomId={roomId} userHandle={userHandle} roomName={roomName} />

      {/* Room Controls */}
      <div className="border-b bg-muted/30 px-3 py-2 sm:px-4 shrink-0">
        <div className="container max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRoomSwitcher(true)}
              className="h-8 sm:h-9"
            >
              <Menu className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Switch Room</span>
            </Button>
            <RoomRenameDialog 
              room={{ id: roomId, title: roomName }} 
              onRoomUpdated={() => {
                // Room name will be updated automatically via the onSnapshot listener
              }}
            />
          </div>
          <ConnectionPill status={connectionStatus} />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div className="container max-w-screen-xl mx-auto h-full px-3 sm:px-4 lg:px-6">
          <div className="max-w-4xl mx-auto h-full">
            <MessageList
              ref={messageListRef}
              messages={messages}
              isLoading={isLoading}
              onScroll={handleScroll}
              userHandle={userHandle}
            />
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && <ScrollToBottomButton onClick={scrollToBottom} />}

      {/* Composer */}
      <div className="border-t bg-background shrink-0">
        <div className="container max-w-screen-xl mx-auto px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <Composer
              onSendMessage={handleSendMessage}
              disabled={connectionStatus === "offline" || !uid}
            />
          </div>
        </div>
      </div>

      {/* Room Switcher Modal */}
      <RoomSwitcher
        open={showRoomSwitcher}
        onOpenChange={setShowRoomSwitcher}
        currentRoomId={roomId}
      />
    </div>
  );
}

