import { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import { analyticsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StreakCard } from './StreakCard';
import { LeaderboardCard } from './LeaderboardCard';

interface AnalyticsPanelProps {
  roomId: number;
}

export default function AnalyticsPanel({ roomId }: AnalyticsPanelProps) {
  const { dbUserId } = useAuth();

  const [streak, setStreak] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<
    { position: number; userId: number; userName: string; totalTasks: number }[]
  >([]);
  const [weekStart, setWeekStart] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dbUserId) return;

    let cancelled = false;

    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const [streakData, leaderboardData] = await Promise.all([
          analyticsApi.getStreak(roomId, dbUserId!),
          analyticsApi.getLeaderboard(roomId),
        ]);

        if (!cancelled) {
          setStreak(streakData.streak);
          setLeaderboard(leaderboardData.leaderboard);
          setWeekStart(leaderboardData.weekStart);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading analytics:', err);
          setError('No se pudieron cargar las estadísticas.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAnalytics();
    return () => { cancelled = true; };
  }, [roomId, dbUserId]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <BarChart2 className="w-10 h-10 text-[#2E2E42]" />
        <p className="text-[#6B6B8A] text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StreakCard streak={streak} isLoading={loading} />
      <LeaderboardCard leaderboard={leaderboard} weekStart={weekStart} isLoading={loading} />
    </div>
  );
}
