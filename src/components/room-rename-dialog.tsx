"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getRoomDisplayName } from "@/lib/room-utils";

interface RoomRenameDialogProps {
  room: { id: string; title?: string };
  onRoomUpdated?: () => void;
}

export function RoomRenameDialog({ room, onRoomUpdated }: RoomRenameDialogProps) {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState(room.title || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currentDisplayName = getRoomDisplayName(room);

  const handleSave = async () => {
    if (!roomName.trim()) {
      toast({
        title: "Invalid name",
        description: "Room name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await updateDoc(doc(db, "rooms", room.id), {
        name: roomName.trim(),
      });

      toast({
        title: "Room renamed",
        description: `"${currentDisplayName}" is now "${roomName.trim()}"`,
      });

      setOpen(false);
      onRoomUpdated?.();
    } catch (error) {
      console.error("Error renaming room:", error);
      toast({
        title: "Error",
        description: "Failed to rename room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRoomName(room.title || "");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          title="Rename room"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Room</DialogTitle>
          <DialogDescription>
            Give this room a friendly name. The room ID will remain the same for sharing.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter a friendly name for this room"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              Room ID: {room.id}
            </p>
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
