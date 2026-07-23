export type UserStatus = 'online' | 'offline' | 'away';

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  photoURL: string;
  bio: string;
  pinHash: string;
  recoveryCode: string;
  status: UserStatus;
  lastSeen: string;
  typingIn?: string | null;
  createdAt: string;
  themePreference?: 'pink-blue' | 'dark' | 'light' | 'neon';
  soundEnabled?: boolean;
}

export interface ParticipantInfo {
  displayName: string;
  photoURL: string;
  username: string;
  status?: UserStatus;
}

export interface Conversation {
  id: string;
  participants: string[]; // array of userIds
  participantInfo: Record<string, ParticipantInfo>;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: string;
    type: MessageType;
    encrypted?: boolean;
  };
  updatedAt: string;
  unreadCount?: Record<string, number>;
  isEncrypted?: boolean;
}

export type MessageType = 'text' | 'image' | 'gif' | 'sticker' | 'ping' | 'file';

export interface EmojiReaction {
  userId: string;
  emoji: string;
}

export interface ReplyTo {
  id: string;
  text: string;
  senderName: string;
  type: MessageType;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  type: MessageType;
  mediaUrl?: string;
  emojiReactions?: Record<string, string>; // userId -> emoji
  replyTo?: ReplyTo;
  forwardedFrom?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'seen';
  encrypted?: boolean;
}

export interface PingNotification {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  receiverId: string;
  timestamp: string;
  read: boolean;
  sound?: string;
}

export interface Sticker {
  id: string;
  name: string;
  category: string;
  svgContent: string;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  user: Partial<UserProfile>;
  conversations: Conversation[];
  messages: Message[];
}
