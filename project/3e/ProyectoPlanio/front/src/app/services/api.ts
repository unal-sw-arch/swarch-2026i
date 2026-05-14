// Servicio de API centralizado para comunicación con el backend
// Utiliza authFetch para incluir automáticamente el token de Firebase
import type { StreakData, LeaderboardData } from '../types';
import { authFetch } from '../auth/authFetch';
import { firebaseAuth } from '../auth/firebase';
import type {
  Room,
  Task,
  Habit,
  ActivityLog,
  CreateRoomDto,
  JoinRoomDto,
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskStatusDto,
  CreateHabitDto,
} from '../types';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper para manejar respuestas
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error ${response.status}`);
  }
  return response.json();
}

// ============================================================================
// ROOMS API
// ============================================================================

export const roomsApi = {
  // Obtener todas las salas del usuario autenticado
  async getAll(): Promise<Room[]> {
    const response = await authFetch(`${API_URL}/activity/rooms`);
    return handleResponse<Room[]>(response);
  },

  // Obtener detalle de una sala con sus miembros
  async getById(roomId: number): Promise<Room> {
    const response = await authFetch(`${API_URL}/activity/rooms/${roomId}`);
    return handleResponse<Room>(response);
  },

  // Crear una nueva sala
  async create(data: CreateRoomDto): Promise<Room> {
    const response = await authFetch(`${API_URL}/activity/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Room>(response);
  },

  // Unirse a una sala con código de invitación
  async join(data: JoinRoomDto): Promise<Room> {
    const response = await authFetch(`${API_URL}/activity/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Room>(response);
  },
};

// ============================================================================
// TASKS API
// ============================================================================

export const tasksApi = {
  // Obtener todas las tareas de una sala
  async getByRoom(roomId: number): Promise<Task[]> {
    const response = await authFetch(`${API_URL}/activity/rooms/${roomId}/tasks`);
    return handleResponse<Task[]>(response);
  },

  // Crear una nueva tarea
  async create(roomId: number, data: CreateTaskDto): Promise<Task> {
    const response = await authFetch(`${API_URL}/activity/rooms/${roomId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(response);
  },

  // Actualizar una tarea (título, descripción, asignado)
  async update(roomId: number, taskId: number, data: UpdateTaskDto): Promise<Task> {
    const response = await authFetch(`${API_URL}/activity/rooms/${roomId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(response);
  },

  // Cambiar estado de una tarea (TODO/DONE)
  async updateStatus(roomId: number, taskId: number, data: UpdateTaskStatusDto): Promise<Task> {
    const response = await authFetch(
      `${API_URL}/activity/rooms/${roomId}/tasks/${taskId}/status`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    return handleResponse<Task>(response);
  },

  // Eliminar una tarea
  async delete(roomId: number, taskId: number): Promise<void> {
    const response = await authFetch(`${API_URL}/activity/rooms/${roomId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error ${response.status}`);
    }
  },
};

// ============================================================================
// HABITS API
// ============================================================================

export const habitsApi = {
  // Obtener todos los hábitos de una sala
  async getByRoom(roomId: number): Promise<Habit[]> {
    const response = await authFetch(`${API_URL}/activity/rooms/${roomId}/habits`);
    return handleResponse<Habit[]>(response);
  },

  // Crear un nuevo hábito
  async create(roomId: number, data: CreateHabitDto): Promise<Habit> {
    const response = await authFetch(`${API_URL}/activity/rooms/${roomId}/habits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Habit>(response);
  },

  // Marcar hábito como completado hoy
  async complete(roomId: number, habitId: number): Promise<Habit> {
    const response = await authFetch(
      `${API_URL}/activity/rooms/${roomId}/habits/${habitId}/complete`,
      {
        method: 'POST',
      }
    );
    return handleResponse<Habit>(response);
  },

  // Eliminar un hábito
  async delete(roomId: number, habitId: number): Promise<void> {
    const response = await authFetch(`${API_URL}/activity/rooms/${roomId}/habits/${habitId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error ${response.status}`);
    }
  },
};

// ============================================================================
// ACTIVITY LOGS API
// ============================================================================

export interface LogsResponse {
  logs: ActivityLog[];
  total: number;
  limit: number;
  offset: number;
}

export const logsApi = {
  // Obtener logs de actividad de una sala
  async getByRoom(roomId: number, limit = 20, offset = 0): Promise<LogsResponse> {
    const response = await authFetch(
      `${API_URL}/activity/rooms/${roomId}/logs?limit=${limit}&offset=${offset}`
    );
    return handleResponse<LogsResponse>(response);
  },
};

// ============================================================================
// COINS API
// ============================================================================

export const coinsApi = {
  // Obtener balance de coins de la sala
  async getRoomBalance(roomId: number): Promise<{ balance: number }> {
    const response = await authFetch(`${API_URL}/activity/coins/rooms/${roomId}`);
    return handleResponse<{ balance: number }>(response);
  },

  // Obtener balance personal del usuario
  async getUserBalance(): Promise<{ balance: number }> {
    const response = await authFetch(`${API_URL}/activity/coins/me`);
    return handleResponse<{ balance: number }>(response);
  },

  // Gastar coins personales (para compras en tienda de personalización)
  async spendUserCoins(amount: number, reason: string): Promise<{ balance: number }> {
    const response = await authFetch(`${API_URL}/activity/coins/spend/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, reason }),
    });
    return handleResponse<{ balance: number }>(response);
  },

  // Gastar coins de sala (para compras grupales)
  async spendRoomCoins(
    roomId: number,
    amount: number,
    reason: string
  ): Promise<{ balance: number }> {
    const response = await authFetch(`${API_URL}/activity/coins/spend/room`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, amount, reason }),
    });
    return handleResponse<{ balance: number }>(response);
  },
};

// ============================================================================
// USERS API
// ============================================================================

export const usersApi = {
  // Login o registro con Firebase (sincroniza con el backend)
  async login(): Promise<{ id: number; firebase_uid: string; name: string; email: string }> {
    const user = firebaseAuth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    const response = await authFetch(`${API_URL}/activity/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || 'User',
        google_id: user.uid,
      }),
    });
    return handleResponse(response);
  },

  // Obtener usuario por ID
  async getById(userId: number): Promise<{ id: number; name: string; email: string }> {
    const response = await authFetch(`${API_URL}/activity/users/${userId}`);
    return handleResponse(response);
  },
};

// ============================================================================
// CHAT API  —
// ============================================================================

import type { ChatMessage, ChatReactionKey } from '../types';

export const chatApi = {
  async getMessages(roomId: number, limit = 50, before?: string): Promise<ChatMessage[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before !== undefined) params.set('before', before);
    const response = await authFetch(`${API_URL}/chat/rooms/${roomId}/chat?${params}`);
    const data = await handleResponse<{ messages: ChatMessage[] }>(response);
    return data.messages;
  },

  async sendMessage(roomId: number, text: string): Promise<ChatMessage> {
    const response = await authFetch(`${API_URL}/chat/rooms/${roomId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await handleResponse<{ message: ChatMessage }>(response);
    return data.message;
  },

  async toggleReaction(roomId: number, messageId: string, reactionKey: ChatReactionKey): Promise<void> {
    const response = await authFetch(`${API_URL}/chat/rooms/${roomId}/chat/${messageId}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reaction_key: reactionKey }),
    });
    await handleResponse(response);
  },
};

// ============================================================================
// ANALYTICS API
// ============================================================================

export const analyticsApi = {
  // Racha de hábitos de un usuario en una sala
  async getStreak(roomId: number, userId: number): Promise<StreakData> {
    const response = await authFetch(
      `${API_URL}/analytics/rooms/${roomId}/streak/${userId}`
    );
    return handleResponse<StreakData>(response);
  },

  // Leaderboard semanal de tareas de una sala
  async getLeaderboard(roomId: number): Promise<LeaderboardData> {
    const response = await authFetch(
      `${API_URL}/analytics/rooms/${roomId}/leaderboard`
    );
    return handleResponse<LeaderboardData>(response);
  },
};