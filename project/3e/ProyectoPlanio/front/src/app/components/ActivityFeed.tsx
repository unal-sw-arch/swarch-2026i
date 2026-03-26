import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  CheckSquare,
  ArrowRight,
  Check,
  Plus,
  Heart,
  Trash2,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { logsApi } from '../services/api';
import type { ActivityLog } from '../types';
import { toast } from 'sonner';
import { useRoomSocket } from '../hooks/useRoomSocket';
import { useAuth } from '../context/AuthContext';

// Colores para avatares
const memberColors = [
  'bg-purple-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-teal-500',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getMemberColor(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return memberColors[hash % memberColors.length];
}

function getActivityIcon(actionType: string) {
  switch (actionType) {
    case 'TASK_CREATED':
      return <Plus className="w-4 h-4" />;
    case 'TASK_ASSIGNED':
      return <CheckSquare className="w-4 h-4" />;
    case 'TASK_STATUS_CHANGED':
      return <ArrowRight className="w-4 h-4" />;
    case 'TASK_DELETED':
      return <Trash2 className="w-4 h-4" />;
    case 'TASK_UPDATED':
      return <CheckSquare className="w-4 h-4" />;
    case 'HABIT_CREATED':
      return <Heart className="w-4 h-4" />;
    case 'HABIT_COMPLETED':
      return <Check className="w-4 h-4" />;
    case 'HABIT_DELETED':
      return <Trash2 className="w-4 h-4" />;
    case 'MEMBER_JOINED':
      return <UserPlus className="w-4 h-4" />;
    case 'ROOM_CREATED':
      return <Plus className="w-4 h-4" />;
    default:
      return <CheckSquare className="w-4 h-4" />;
  }
}

function getActivityColor(actionType: string) {
  switch (actionType) {
    case 'TASK_CREATED':
      return 'bg-orange-100 text-orange-600';
    case 'TASK_ASSIGNED':
      return 'bg-blue-100 text-blue-600';
    case 'TASK_STATUS_CHANGED':
      return 'bg-green-100 text-green-600';
    case 'TASK_DELETED':
      return 'bg-red-100 text-red-600';
    case 'TASK_UPDATED':
      return 'bg-blue-100 text-blue-600';
    case 'HABIT_CREATED':
      return 'bg-pink-100 text-pink-600';
    case 'HABIT_COMPLETED':
      return 'bg-purple-100 text-purple-600';
    case 'HABIT_DELETED':
      return 'bg-red-100 text-red-600';
    case 'MEMBER_JOINED':
      return 'bg-teal-100 text-teal-600';
    case 'ROOM_CREATED':
      return 'bg-indigo-100 text-indigo-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

interface ActivityFeedProps {
  roomId: number;
}

export default function ActivityFeed({ roomId }: ActivityFeedProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    async function loadLogs() {
      try {
        const response = await logsApi.getByRoom(roomId, 20, 0);
        setLogs(response.logs);
        setTotal(response.total);
      } catch (error) {
        console.error('Error loading activity logs:', error);
        toast.error('Error loading activity');
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, [roomId]);

  const { dbUserId } = useAuth();

  useRoomSocket(roomId, dbUserId, (_msg) => {
    // recargar logs ante cualquier evento
    logsApi.getByRoom(roomId, 20, 0).then((data) => {
      setLogs(data.logs);
    }).catch(console.error);
  });

  const hasMore = logs.length < total;

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const response = await logsApi.getByRoom(roomId, 20, logs.length);
      setLogs((prev) => [...prev, ...response.logs]);
    } catch (error) {
      console.error('Error loading more logs:', error);
      toast.error('Error loading more activity');
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Activity Feed</h2>
        <p className="text-sm text-gray-500 mt-1">Recent group activity</p>
      </div>

      {/* No Activity Message */}
      {logs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No activity yet</p>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {logs.map((log, index) => (
          <div key={log.id} className="relative">
            {/* Timeline line */}
            {index !== logs.length - 1 && (
              <div className="absolute left-5 top-12 w-0.5 h-full bg-gray-200" />
            )}

            {/* Activity Item */}
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-10 h-10 border-2 border-white ring-2 ring-gray-100">
                  <AvatarFallback className={getMemberColor(log.actor_name) + ' text-white'}>
                    {getInitials(log.actor_name)}
                  </AvatarFallback>
                </Avatar>
                {/* Action Icon */}
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${getActivityColor(
                    log.action_type
                  )}`}
                >
                  {getActivityIcon(log.action_type)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{log.actor_name}</span>{' '}
                  <span className="text-gray-600">{log.description}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{formatTimestamp(log.created_at)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load more activity'}
          </button>
        </div>
      )}
    </div>
  );
}
