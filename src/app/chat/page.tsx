"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

// Inline anon handle helper (can move to src/lib/device.ts later)
function getHandle(): string {
  if (typeof window === "undefined") return "anon";
  const KEY = "rait-handle";
  const existing = localStorage.getItem(KEY);
  if (existing) return existing;
  const handle = `anon-${Math.random().toString(36).slice(2, 5)}`;
  localStorage.setItem(KEY, handle);
  return handle;
}

type Msg = {
  id: string;
  text: string;
  uid?: string;
  authorHandle?: string;
  type?: "user" | "bot" | "system";
  createdAt?: unknown;
};

export default function ChatPage() {
  const ROOM_ID = "general";
  const [authed, setAuthed] = useState(false);
  const [uid, setUid] = useState<string>("");
  const [handle, setHandle] = useState("anon");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);

  const listRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Measure footer and apply bottom padding to message list so the composer never overlaps
  const applyBottomPadding = useCallback(() => {
    const list = listRef.current;
    const footer = footerRef.current;
    if (!list || !footer) return;
    const footerH = footer.offsetHeight || 64;
    // Add small extra gap + safe-area inset
    list.style.paddingBottom = `calc(${footerH + 12}px + env(safe-area-inset-bottom, 0px))`;
  }, []);

  const scrollToBottom = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, []);

  // Sign in and subscribe
  useEffect(() => {
    setHandle(getHandle());

    if (!auth.currentUser) {
      signInAnonymously(auth).catch((e) => console.error("Anon sign-in failed:", e));
    }

    const offAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setAuthed(false);
        setUid("");
        return;
      }
      setAuthed(true);
      setUid(u.uid);

      // Ensure room exists
      const roomRef = doc(db, "rooms", ROOM_ID);
      const snap = await getDoc(roomRef);
      if (!snap.exists()) {
        await setDoc(roomRef, {
          name: "General",
          createdBy: u.uid,
          createdAt: serverTimestamp(),
          isLocked: false,
          lastMessageAt: serverTimestamp(),
        });
      }

      // Subscribe to messages
      const msgsRef = collection(db, "rooms", ROOM_ID, "messages");
      const q = query(msgsRef, orderBy("createdAt", "asc"));
      const offMsgs = onSnapshot(
        q,
        (snapshot) => {
          setMsgs(snapshot.docs.map((d) => ({ ...(d.data() as Msg), id: d.id })));
          setLoading(false);
          queueMicrotask(() => {
            applyBottomPadding();
            scrollToBottom();
          });
        },
        (err) => {
          console.error("onSnapshot error:", err);
          setLoading(false);
        }
      );

      return () => offMsgs();
    });

    // Re-apply padding on resize/rotation and when virtual keyboard changes viewport
    const ro = new ResizeObserver(() => applyBottomPadding());
    if (footerRef.current) ro.observe(footerRef.current);
    if (listRef.current) ro.observe(listRef.current);

    const onResize = () => applyBottomPadding();
    window.addEventListener("resize", onResize);

    return () => {
      offAuth();
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [applyBottomPadding, scrollToBottom]);

  // Scroll when focusing the input (mobile keyboard)
  const onFocusInput = () => {
    // give the browser a tick to lift the keyboard, then scroll
    setTimeout(() => {
      applyBottomPadding();
      scrollToBottom();
    }, 50);
  };

  const send = useCallback(async () => {
    const value = text.trim();
    if (!authed || !value || sending || !ROOM_ID) return;
    setSending(true);
    try {
      await addDoc(collection(db, "rooms", ROOM_ID, "messages"), {
        text: value,
        uid,
        authorHandle: handle,
        type: "user",
        createdAt: serverTimestamp(),
      });
      setText("");
      queueMicrotask(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
        inputRef.current?.focus();
      });
    } finally {
      setSending(false);
    }
  }, [authed, text, sending, uid, handle]);
  

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const title = useMemo(() => "RAIT Rooms", []);
  const subtitle = useMemo(() => "#general", []);

  return (
    <div className="flex flex-col h-dvh bg-gray-50 overscroll-contain">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Room: <span className="font-mono">{subtitle}</span>
            </p>
          </div>
          <div className="ml-4 shrink-0 text-xs sm:text-sm text-gray-500">
            {authed ? `Signed in as ${handle}` : "Connecting…"}
          </div>
        </div>
      </header>

      {/* Messages */}
      <main
        ref={listRef}
        className="flex-1 overflow-y-auto"
        style={{
          // Give a tiny base padding-bottom; precise padding is applied dynamically
          paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
          scrollPaddingBottom: "120px",
        }}
      >
        <div className="mx-auto w-full max-w-3xl px-3 sm:px-4 py-4 flex flex-col gap-2">
          {loading && (
            <div className="py-10 text-center text-sm text-gray-500">
              Loading messages…
            </div>
          )}

          {!loading && msgs.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500">
              No messages yet. Say hi 👋 or ask <span className="font-semibold">@bot</span> anything.
            </div>
          )}

          {msgs.map((m) => {
            const mine = m.uid === uid;
            const isBot = m.type === "bot";
            return (
              <div
                key={m.id}
                className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
              >
                <span
                  className={`mb-1 text-[11px] ${
                    isBot ? "text-emerald-600" : mine ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {m.authorHandle || (m.uid ? String(m.uid).slice(0, 6) : "anon")}
                </span>
                <div
                  className={[
                    "max-w-[85%] px-3 py-2 rounded-2xl shadow-sm border",
                    isBot
                      ? "bg-emerald-50 text-emerald-900 border-emerald-100"
                      : mine
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-900 border-gray-200",
                  ].join(" ")}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
          {/* Spacer—extra safety for mobile keyboards */}
          <div className="h-2" />
        </div>
      </main>

      {/* Composer (sticky, respects safe area) */}
      <footer
        ref={footerRef}
        className="sticky bottom-0 z-20 border-t bg-white"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto w-full max-w-3xl px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 bg-white/90 rounded-full border border-gray-300 p-1 shadow-sm">
            <input
              ref={inputRef}
              className="flex-1 bg-transparent rounded-full px-4 py-2
                         focus:outline-none focus:ring-0"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={onFocusInput}
              onKeyDown={onKeyDown}
              placeholder="Type a message… (Enter to send)"
              maxLength={800}
              disabled={!authed || sending}
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              onClick={send}
              disabled={!authed || sending || text.trim() === ""}
              className="inline-flex items-center justify-center rounded-full px-5 py-2
                         bg-blue-600 text-white hover:bg-blue-700
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
              title="Send"
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-[11px] text-gray-400 text-center sm:text-left">
            Messages may auto-delete after 7 days.
          </p>
        </div>
      </footer>
    </div>
  );
}
