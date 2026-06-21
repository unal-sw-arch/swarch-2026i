import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ActivityItem {
  icon: LucideIcon;
  title: string;
  description: string;
  time: string;
  color: string;
}

const ActivityFeed: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad reciente</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {activities.length === 0 && (
          <p className="text-sm text-gray-400">Sin actividad reciente</p>
        )}
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={index} className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${activity.color} shrink-0`}>
                <Icon size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-600 truncate" title={activity.description}>
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityFeed;
