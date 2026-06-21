import { useState } from 'react';

interface StreakCardProps {
  streak: number;
  isLoading?: boolean;
}

export function StreakCard({ streak, isLoading }: StreakCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hasStreak = streak > 0;
  const progress = Math.min((streak / 30) * 100, 100);

  if (isLoading) {
    return (
      <div className="bg-[#1A1A24] border border-[#2E2E42] rounded-2xl p-6 transition-all duration-300">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-[#252532] rounded-full animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-3 bg-[#252532] rounded w-24 animate-pulse" />
            <div className="h-12 bg-[#252532] rounded w-16 animate-pulse" />
            <div className="h-4 bg-[#252532] rounded w-48 animate-pulse" />
            <div className="mt-4 space-y-2">
              <div className="h-1.5 bg-[#252532] rounded-full w-full animate-pulse" />
              <div className="h-3 bg-[#252532] rounded w-32 animate-pulse" />
            </div>
          </div>
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
      <div className="flex items-start gap-6">
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
            hasStreak
              ? 'bg-gradient-to-br from-[#7C3AED] to-[#C026D3]'
              : 'bg-[#2E2E42]'
          }`}
          style={
            hasStreak
              ? { boxShadow: '0 0 32px rgba(124,58,237,0.5), 0 0 48px rgba(192,38,211,0.3)' }
              : {}
          }
        >
          <span className="text-3xl" style={{ filter: hasStreak ? 'none' : 'grayscale(1)' }}>
            🔥
          </span>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="uppercase tracking-wider text-[#6B6B8A]" style={{ fontSize: '11px' }}>
            RACHA ACTUAL
          </div>
          <div
            className="text-white mt-1"
            style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1 }}
          >
            {streak}
          </div>
          <div className="text-[#A78BFA] mt-2" style={{ fontSize: '14px' }}>
            {hasStreak
              ? 'días consecutivos completando hábitos'
              : 'Completa un hábito hoy para comenzar tu racha'}
          </div>

          {hasStreak && (
            <div className="mt-4 space-y-2">
              <div className="h-1.5 bg-[#2E2E42] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] transition-all duration-500 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-[#6B6B8A]" style={{ fontSize: '12px' }}>
                ¡Sigue así! Mañana llegarás a {streak + 1} días
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
