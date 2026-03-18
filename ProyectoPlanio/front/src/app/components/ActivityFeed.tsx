import { Avatar, AvatarFallback } from './ui/avatar';
import { CheckSquare, ArrowRight, Check, Plus } from 'lucide-react';

interface Activity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userColor: string;
  action: string;
  target?: string;
  targetUser?: string;
  type: 'task_assigned' | 'task_moved' | 'habit_completed' | 'task_created';
  timestamp: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Laura',
    userAvatar: 'L',
    userColor: 'bg-purple-500',
    action: 'assigned',
    target: 'Wash dishes',
    targetUser: 'Juan',
    type: 'task_assigned',
    timestamp: '5 minutes ago',
  },
  {
    id: '2',
    userId: '3',
    userName: 'Jerónimo',
    userAvatar: 'JE',
    userColor: 'bg-green-500',
    action: 'moved',
    target: 'Sweep floor',
    type: 'task_moved',
    timestamp: '12 minutes ago',
  },
  {
    id: '3',
    userId: '2',
    userName: 'Juan',
    userAvatar: 'J',
    userColor: 'bg-blue-500',
    action: 'completed habit',
    target: 'Drink water',
    type: 'habit_completed',
    timestamp: '1 hour ago',
  },
  {
    id: '4',
    userId: '1',
    userName: 'Laura',
    userAvatar: 'L',
    userColor: 'bg-purple-500',
    action: 'created task',
    target: 'Buy groceries',
    type: 'task_created',
    timestamp: '2 hours ago',
  },
  {
    id: '5',
    userId: '3',
    userName: 'Jerónimo',
    userAvatar: 'JE',
    userColor: 'bg-green-500',
    action: 'completed habit',
    target: 'Morning Exercise',
    type: 'habit_completed',
    timestamp: '3 hours ago',
  },
  {
    id: '6',
    userId: '2',
    userName: 'Juan',
    userAvatar: 'J',
    userColor: 'bg-blue-500',
    action: 'moved',
    target: 'Take out trash',
    type: 'task_moved',
    timestamp: '4 hours ago',
  },
  {
    id: '7',
    userId: '1',
    userName: 'Laura',
    userAvatar: 'L',
    userColor: 'bg-purple-500',
    action: 'completed habit',
    target: 'Read for 30min',
    type: 'habit_completed',
    timestamp: 'Yesterday',
  },
  {
    id: '8',
    userId: '2',
    userName: 'Juan',
    userAvatar: 'J',
    userColor: 'bg-blue-500',
    action: 'created task',
    target: 'Clean kitchen',
    type: 'task_created',
    timestamp: 'Yesterday',
  },
];

function getActivityIcon(type: Activity['type']) {
  switch (type) {
    case 'task_assigned':
      return <CheckSquare className="w-4 h-4" />;
    case 'task_moved':
      return <ArrowRight className="w-4 h-4" />;
    case 'habit_completed':
      return <Check className="w-4 h-4" />;
    case 'task_created':
      return <Plus className="w-4 h-4" />;
  }
}

function getActivityText(activity: Activity) {
  switch (activity.type) {
    case 'task_assigned':
      return (
        <>
          assigned <strong>"{activity.target}"</strong> to {activity.targetUser}
        </>
      );
    case 'task_moved':
      return (
        <>
          moved <strong>"{activity.target}"</strong> to DONE
        </>
      );
    case 'habit_completed':
      return (
        <>
          completed habit <strong>"{activity.target}"</strong>
        </>
      );
    case 'task_created':
      return (
        <>
          created task <strong>"{activity.target}"</strong>
        </>
      );
  }
}

function getActivityColor(type: Activity['type']) {
  switch (type) {
    case 'task_assigned':
      return 'bg-blue-100 text-blue-600';
    case 'task_moved':
      return 'bg-green-100 text-green-600';
    case 'habit_completed':
      return 'bg-purple-100 text-purple-600';
    case 'task_created':
      return 'bg-orange-100 text-orange-600';
  }
}

export default function ActivityFeed() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Activity Feed</h2>
        <p className="text-sm text-gray-500 mt-1">Recent group activity</p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {mockActivities.map((activity, index) => (
          <div key={activity.id} className="relative">
            {/* Timeline line */}
            {index !== mockActivities.length - 1 && (
              <div className="absolute left-5 top-12 w-0.5 h-full bg-gray-200" />
            )}

            {/* Activity Item */}
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="w-10 h-10 border-2 border-white ring-2 ring-gray-100">
                  <AvatarFallback className={activity.userColor + ' text-white'}>
                    {activity.userAvatar}
                  </AvatarFallback>
                </Avatar>
                {/* Action Icon */}
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ${getActivityColor(
                    activity.type
                  )}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{activity.userName}</span>{' '}
                  {getActivityText(activity)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
          Load more activity
        </button>
      </div>
    </div>
  );
}
