// Tipos para las entidades del backend

export interface User {
  id: number;
  firebase_uid: string;
  name: string;
  email: string;
  created_at: string;
}

export interface RoomMember {
  id: number;
  name: string;
  email: string;
  joined_at: string;
}

export interface Room {
  id: number;
  name: string;
  invite_code: string;
  invite_link: string;
  created_by: number;
  created_at: string;
  coins: number;
  member_count?: number;
  members?: RoomMember[];
}

export interface Task {
  id: number;
  room_id: number;
  title: string;
  description: string | null;
  status: 'TODO' | 'DONE';
  assigned_to: number | null;
  assigned_to_name: string | null;
  created_by: number;
  created_by_name: string | null;
  completed_by: number | null;
  completed_by_name: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: number;
  room_id: number;
  name: string;
  created_by: number;
  created_by_name: string | null;
  created_at: string;
  completed_today?: boolean;
  streak?: number;
}

export interface ActivityLog {
  id: number;
  room_id: number;
  actor_id: number;
  actor_name: string;
  action_type: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// DTOs para crear/actualizar
export interface CreateRoomDto {
  name: string;
}

export interface JoinRoomDto {
  invite_code: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  assigned_to?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  assigned_to?: number;
}

export interface UpdateTaskStatusDto {
  status: 'TODO' | 'DONE';
}

export interface CreateHabitDto {
  name: string;
}

export type ChatReactionKey = 'love' | 'clap' | 'fire' | 'encourage';

export type ChatReactions = Record<ChatReactionKey, number>;

export type ChatReactionUsers = Partial<Record<ChatReactionKey, number[]>>;

export interface ChatMessage {
  id: number;
  memberId: number | null;
  memberName: string;
  text: string;
  createdAt: string;
  reactions: ChatReactions;
  reaction_user_ids?: ChatReactionUsers;
}

export type RoomChatEvent =
  | {
      type: 'CHAT_MESSAGE_CREATED';
      payload: { message: ChatMessage };
    }
  | {
      type: 'CHAT_MESSAGE_REACTION';
      payload: {
        messageId: number;
        reactionKey: ChatReactionKey;
        count: number;
        reactorUserIds?: number[];
      };
    };
