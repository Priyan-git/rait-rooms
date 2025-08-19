// Room naming utilities

/**
 * Generate a readable room name from a room ID
 */
export function generateRoomName(roomId: string): string {
  // If it's already a readable name, return as is
  if (isReadableName(roomId)) {
    return roomId;
  }

  // Convert random IDs to readable names
  const words = [
    "Study", "Chat", "Talk", "Group", "Room", "Space", "Hub", "Zone",
    "Cafe", "Lounge", "Club", "Circle", "Forum", "Square", "Plaza",
    "Garden", "Park", "Beach", "Mountain", "Forest", "River", "Lake",
    "Ocean", "Sky", "Star", "Moon", "Sun", "Cloud", "Rain", "Snow",
    "Spring", "Summer", "Autumn", "Winter", "Morning", "Evening", "Night",
    "Coffee", "Tea", "Pizza", "Burger", "Sushi", "Taco", "Pasta", "Salad",
    "Music", "Movie", "Game", "Book", "Art", "Photo", "Video", "Code",
    "Math", "Science", "History", "English", "Physics", "Chemistry", "Biology",
    "Computer", "Phone", "Laptop", "Tablet", "Watch", "Camera", "Speaker",
    "Friend", "Family", "Team", "Class", "School", "College", "University",
    "Work", "Office", "Home", "Kitchen", "Bedroom", "Living", "Dining"
  ];

  // Use the first few characters of the room ID to generate a consistent name
  const hash = simpleHash(roomId);
  const word1 = words[hash % words.length];
  const word2 = words[(hash * 2) % words.length];
  
  return `${word1} ${word2}`;
}

/**
 * Check if a string is already a readable room name
 */
function isReadableName(name: string): boolean {
  // Check if it contains spaces (likely a readable name)
  if (name.includes(' ')) return true;
  
  // Check if it's all lowercase with hyphens (like "study-group")
  if (/^[a-z-]+$/.test(name)) return true;
  
  // Check if it's a common room name
  const commonNames = [
    'general', 'random', 'study', 'tech', 'music', 'gaming', 'sports',
    'movies', 'books', 'food', 'travel', 'fitness', 'art', 'science'
  ];
  
  return commonNames.includes(name.toLowerCase());
}

/**
 * Simple hash function for consistent name generation
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Format room ID for display (shortened if too long)
 */
export function formatRoomId(roomId: string, maxLength: number = 12): string {
  if (roomId.length <= maxLength) return roomId;
  return roomId.substring(0, maxLength) + '...';
}

/**
 * Get display name for a room (name if available, otherwise formatted ID)
 */
export function getRoomDisplayName(room: { id: string; title?: string }): string {
  if (room.title && room.title.trim()) {
    return room.title;
  }
  return generateRoomName(room.id);
}
