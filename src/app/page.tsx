"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Header component
import { Header } from "@/components/header";

// shadcn/ui bits from your v0 scaffold
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { MessageCircle, Users, ArrowRight } from "lucide-react";
import { FEATURED_ROOMS } from "@/lib/mock-data"; // fallback rooms
import { useRooms } from "@/hooks/use-rooms";
import { initializeRooms } from "@/lib/init-rooms";
import { getRoomDisplayName } from "@/lib/room-utils";
import { RoomRenameDialog } from "@/components/room-rename-dialog";
import type { Room } from "@/lib/types";

/* --------- keep handle consistent with room page --------- */
function getOrCreateHandle(): string {
  if (typeof window === "undefined") return "anon";
  const KEY = "rait-handle";
  const existing = localStorage.getItem(KEY);
  if (existing) return existing;
  const handle = `anon-${Math.random().toString(36).slice(2, 5)}`;
  localStorage.setItem(KEY, handle);
  return handle;
}

export default function LobbyPage() {
  const router = useRouter();
  const [userHandle, setUserHandle] = useState("anon");
  const [roomId, setRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { rooms, loading: roomsLoading } = useRooms();

  // Set handle on client side only to avoid hydration mismatch
  useEffect(() => {
    setUserHandle(getOrCreateHandle());
  }, []);

  // Initialize default rooms if none exist
  useEffect(() => {
    if (rooms.length === 0 && !roomsLoading) {
      initializeRooms();
    }
  }, [rooms.length, roomsLoading]);

  // Use real rooms if available, otherwise fallback to mock data
  const displayRooms = rooms.length > 0 ? rooms : FEATURED_ROOMS;

  const handleJoinRoom = async (targetRoomId: string) => {
    const rid = targetRoomId.trim();
    if (!rid) return;
    setIsJoining(true);
    // (optional) tiny UX delay
    await new Promise((r) => setTimeout(r, 300));
    // 👇 route to your existing chat route
    router.push(`/chat/${rid}`);
  };

  const handleSubmitRoomId = (e: React.FormEvent) => {
    e.preventDefault();
    void handleJoinRoom(roomId);
  };

  const formatLastActive = (lastMessageAt?: string) => {
    if (!lastMessageAt) return "No recent activity";
    const date = new Date(lastMessageAt);
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* 👇 pass a dummy roomId for header layout */}
      <Header roomId="lobby" userHandle={userHandle} />

      <main className="container max-w-screen-xl mx-auto px-3 py-6 sm:px-4 sm:py-8 lg:px-6 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              Welcome to RAIT Rooms
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
              Join anonymous conversations with your college community
            </p>
          </div>

          {/* Featured Rooms */}
          <section className="mb-8 sm:mb-10 lg:mb-14">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-5 lg:mb-7 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary" />
              Featured Rooms
            </h2>
            <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {roomsLoading && rooms.length === 0 ? (
                // Show loading skeleton
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                                displayRooms.map((room: Room) => (
                  <Card
                    key={room.id}
                    className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98] bg-card/80 backdrop-blur-sm border-2"
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm sm:text-base lg:text-lg font-semibold truncate pr-2">
                          {getRoomDisplayName(room)}
                        </CardTitle>
                        <div className="flex items-center gap-1">
                          <RoomRenameDialog room={room} />
                          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Users className="h-3 w-3 shrink-0 text-primary" />
                        <span className="text-xs sm:text-sm">{formatLastActive(room.lastMessageAt)}</span>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* Join Room by ID */}
          <section className="mb-8 sm:mb-10 lg:mb-14">
            <div className="text-center mb-5 sm:mb-7">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 flex items-center justify-center gap-2">
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary" />
                Join or Create Room
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Enter a room ID to join an existing room or create a new one
              </p>
            </div>

            <Card className="max-w-2xl mx-auto border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 transition-all duration-300 bg-card/60 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="pt-6 pb-6 sm:pt-8 sm:pb-8">
                <form onSubmit={handleSubmitRoomId} className="space-y-5">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Enter room ID (e.g., study-session-2025)"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="h-12 text-base border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-background/80"
                        disabled={isJoining}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={!roomId.trim() || isJoining}
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground h-12 px-8 font-semibold text-base sm:min-w-[140px] transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-primary/25"
                    >
                      {isJoining ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Joining...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Join
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </div>

                  <div className="bg-gradient-to-r from-muted/60 to-muted/40 rounded-lg p-4 border border-border/50">
                    <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      If the room doesn&apos;t exist, it will be created automatically
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </section>

          {/* Quick Stats */}
          <section className="mb-8 sm:mb-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <div className="text-center p-4 sm:p-5 rounded-xl bg-gradient-to-br from-card to-muted/30 border border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1">24/7</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Always Active</div>
              </div>
              <div className="text-center p-4 sm:p-5 rounded-xl bg-gradient-to-br from-card to-muted/30 border border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1">100%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Anonymous</div>
              </div>
              <div className="text-center p-4 sm:p-5 rounded-xl bg-gradient-to-br from-card to-muted/30 border border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1">Real-time</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Messaging</div>
              </div>
              <div className="text-center p-4 sm:p-5 rounded-xl bg-gradient-to-br from-card to-muted/30 border border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1">Safe</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Environment</div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-gradient-to-r from-card/80 to-muted/20 backdrop-blur-sm mt-auto">
        <div className="container max-w-screen-xl mx-auto px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                © 2025 RAIT Rooms. Built for college communities.
              </div>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                <Button variant="ghost" size="sm" className="text-xs h-8 px-3">
                  Terms of Service
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-8 px-3">
                  Privacy Policy
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-8 px-3">
                  Community Guidelines
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
