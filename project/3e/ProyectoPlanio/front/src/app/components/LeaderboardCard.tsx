import { useState } from 'react';

interface LeaderboardEntry {
  position: number;
  userId: number;
  userName: string;
  totalTasks: number;
}

interface LeaderboardCardProps {
  leaderboard: LeaderboardEntry[];
  weekStart?: string;
  isLoading?: boolean;
}

function getAvatarGradient(userId: number): string {
  const gradients = [
    'from-[#7C3AED] to-[#A78BFA]',
    'from-[#EC4899] to-[#F472B6]',
    'from-[#3B82F6] to-[#60A5FA]',
    'from-[#10B981] to-[#34D399]',
    'from-[#F59E0B] to-[#FBBF24]',
  ];
  return gradients[userId % gradients.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getMedalEmoji(position: number): string {
  switch (position) {
    case 1: return '🥇';
    case 2: return '🥈';
    case 3: return '🥉';
    default: return '';
  }
}

function getMedalBg(position: number): string {
  switch (position) {
    case 1: return 'bg-gradient-to-br from-[#FFD700] to-[#FFA500]';
    case 2: return 'bg-gradient-to-br from-[#C0C0C0] to-[#A8A8A8]';
    case 3: return 'bg-gradient-to-br from-[#CD7F32] to-[#B87333]';
    default: return 'bg-[#2E2E42]';
  }
}

function formatWeekRange(weekStart?: string): string {
  if (!weekStart) return 'Semana actual';
  const start = new Date(weekStart + 'T00:00:00');
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  return `lun ${fmt(start)} – dom ${fmt(end)}`;
}

export function LeaderboardCard({ leaderboard, weekStart, isLoading }: LeaderboardCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isEmpty = leaderboard.length === 0;

  if (isLoading) {
    return (
      <div className="bg-[#1A1A24] border border-[#2E2E42] rounded-2xl p-6 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="h-5 bg-[#252532] rounded w-40 animate-pulse" />
          <div className="h-5 bg-[#252532] rounded w-48 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <div className="w-8 h-8 bg-[#252532] rounded-full animate-pulse" />
              <div className="w-9 h-9 bg-[#252532] rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-[#252532] rounded w-24 animate-pulse" />
                <div className="h-3 bg-[#252532] rounded w-16 animate-pulse" />
              </div>
              <div className="text-right space-y-2">
                <div className="h-5 bg-[#252532] rounded w-12 animate-pulse" />
                <div className="h-3 bg-[#252532] rounded w-12 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-[#1A1A24] border rounded-2xl p-6 transition-all duration-300 ${
        isHovered ? 'border-[#7C3AED]' : 'border-[#2E2E42]'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white" style={{ fontSize: '16px', fontWeight: 700 }}>
          Leaderboard Semanal
        </h2>
        <div
          className="bg-[#252532] text-[#A78BFA] px-3 py-1.5 rounded-full"
          style={{ fontSize: '11px' }}
        >
          Semana actual · {formatWeekRange(weekStart)}
        </div>
      </div>

      {isEmpty ? (
        <div className="py-12 text-center">
          <div className="text-[#2E2E42] text-5xl mb-4">🏆</div>
          <div className="text-[#6B6B8A] mb-2" style={{ fontSize: '14px' }}>
            Nadie ha completado tareas esta semana
          </div>
          <div className="text-[#444460]" style={{ fontSize: '12px' }}>
            ¡Completa tareas para aparecer aquí!
          </div>
        </div>
      ) : (
        <div className="space-y-0">
          {leaderboard.map((entry, index) => {
            const isFirst = entry.position === 1;
            return (
              <div key={entry.userId}>
                {index > 0 && <div className="h-px bg-[#2E2E42]" />}
                <div
                  className={`flex items-center gap-3 py-3 transition-all duration-200 ${
                    isFirst ? 'bg-[#1E1830] -mx-6 px-6 border-l-[3px] border-l-[#7C3AED]' : ''
                  }`}
                >
                  {/* Medal */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getMedalBg(entry.position)}`}
                  >
                    <span className="text-base">{getMedalEmoji(entry.position)}</span>
                  </div>

                  {/* Avatar */}
                  <div
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${getAvatarGradient(entry.userId)} flex items-center justify-center text-white flex-shrink-0`}
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  >
                    {getInitials(entry.userName)}
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white truncate" style={{ fontSize: '14px', fontWeight: 600 }}>
                      {entry.userName}
                    </div>
                    <div className="text-[#6B6B8A]" style={{ fontSize: '12px' }}>
                      miembro
                    </div>
                  </div>

                  {/* Tasks count */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-[#A78BFA]" style={{ fontSize: '20px', fontWeight: 800 }}>
                      {entry.totalTasks}
                    </div>
                    <div className="text-[#6B6B8A]" style={{ fontSize: '11px' }}>
                      tareas
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
