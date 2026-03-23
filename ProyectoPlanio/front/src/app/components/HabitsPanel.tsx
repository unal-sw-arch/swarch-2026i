import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Plus, Check, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import confetti from 'canvas-confetti';
import { habitsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

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

function getMemberColor(index: number): string {
  return memberColors[index % memberColors.length];
}

// Tipos para la respuesta del API
interface HabitMember {
  id: number;
  name: string;
  completed: boolean;
}

interface ApiHabit {
  id: number;
  room_id: number;
  name: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  members: HabitMember[];
  completed_count: number;
  total_members: number;
}

interface HabitsPanelProps {
  roomId: number;
  roomOwnerId: string;
  onCurrencyReward: (amount: number, message: string) => void;
}

export default function HabitsPanel({ roomId, roomOwnerId, onCurrencyReward }: HabitsPanelProps) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<ApiHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [ownerAlert, setOwnerAlert] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Cargar hábitos
  useEffect(() => {
    async function loadHabits() {
      try {
        const data = (await habitsApi.getByRoom(roomId)) as ApiHabit[];
        setHabits(data);

        // Determinar el ID del usuario actual basado en su email
        if (data.length > 0 && data[0].members.length > 0) {
          const userMember = data[0].members.find(
            (m: HabitMember) =>
              user?.displayName?.toLowerCase().includes(m.name.toLowerCase()) ||
              m.name.toLowerCase().includes(user?.displayName?.toLowerCase() || '')
          );
          if (userMember) {
            setCurrentUserId(userMember.id);
          } else {
            // Asumir que el primer miembro es el usuario actual (fallback)
            setCurrentUserId(data[0].members[0]?.id || null);
          }
        }
      } catch (error) {
        console.error('Error loading habits:', error);
        toast.error('Error loading habits');
      } finally {
        setLoading(false);
      }
    }

    loadHabits();
  }, [roomId, user]);

  const isOwner = String(currentUserId) === roomOwnerId;

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
    });
  };

  const handleToggleCompletion = async (habitId: number) => {
    const habit = habits.find((h) => h.id === habitId);
    const myCompletion = habit?.members.find((m) => m.id === currentUserId);

    if (!myCompletion || myCompletion.completed) {
      toast.info('Habit already completed today');
      return;
    }

    // Actualización optimista
    setHabits((prevHabits) =>
      prevHabits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              members: h.members.map((m) =>
                m.id === currentUserId ? { ...m, completed: true } : m
              ),
              completed_count: h.completed_count + 1,
            }
          : h
      )
    );

    try {
      await habitsApi.complete(roomId, habitId);
      triggerConfetti();
      onCurrencyReward(10, 'Habit completed!');
    } catch (error) {
      console.error('Error completing habit:', error);
      toast.error('Error completing habit');
      // Revertir
      setHabits((prevHabits) =>
        prevHabits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                members: h.members.map((m) =>
                  m.id === currentUserId ? { ...m, completed: false } : m
                ),
                completed_count: h.completed_count - 1,
              }
            : h
        )
      );
    }
  };

  const handleDeleteHabit = async (habitId: number) => {
    try {
      await habitsApi.delete(roomId, habitId);
      setHabits((prevHabits) => prevHabits.filter((h) => h.id !== habitId));
      toast.success('Habit deleted');
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error('Error deleting habit');
    }
  };

  const handleTryAddHabit = () => {
    setShowAddHabit(true);
  };

  const handleCreateHabit = async () => {
    if (!newHabitName.trim()) return;

    try {
      await habitsApi.create(roomId, {
        name: newHabitName.trim(),
      });

      // Recargar hábitos para tener la estructura completa
      const data = (await habitsApi.getByRoom(roomId)) as ApiHabit[];
      setHabits(data);

      setNewHabitName('');
      setShowAddHabit(false);
      toast.success('Habit created');
    } catch (error) {
      console.error('Error creating habit:', error);
      toast.error('Error creating habit');
    }
  };

  const getCompletionStats = (habit: ApiHabit) => {
    return {
      completed: habit.completed_count,
      total: habit.total_members,
      percentage: habit.total_members > 0 ? (habit.completed_count / habit.total_members) * 100 : 0,
    };
  };

  const getCurrentUserCompletion = (habit: ApiHabit) => {
    return habit.members.find((m) => m.id === currentUserId);
  };

  const currentUserName = user?.displayName || user?.email || 'You';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Owner Alert */}
      {ownerAlert && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-orange-900">{ownerAlert}</p>
            <p className="text-sm text-orange-700 mt-1">
              Contact the room owner if you'd like to make changes.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Daily Habits</h2>
            <p className="text-sm text-gray-500 mt-1">Track habits together as a group</p>
          </div>
          <Button
            onClick={handleTryAddHabit}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Habit
          </Button>
        </div>

        {/* Add Habit Form */}
        {showAddHabit && (
          <div className="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-200">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Habit name..."
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateHabit();
                  if (e.key === 'Escape') setShowAddHabit(false);
                }}
                autoFocus
              />
              <Button onClick={handleCreateHabit} disabled={!newHabitName.trim()}>
                Create
              </Button>
              <Button onClick={() => setShowAddHabit(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Date Info */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6 ring-2 ring-purple-300">
              <AvatarFallback className="bg-purple-500 text-white text-xs">
                {getInitials(currentUserName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">You: {currentUserName}</span>
          </div>
        </div>

        {/* No Habits Message */}
        {habits.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No habits yet. Create one to get started!</p>
          </div>
        )}

        {/* Habits List */}
        <div className="space-y-4">
          {habits.map((habit) => {
            const stats = getCompletionStats(habit);
            const myCompletion = getCurrentUserCompletion(habit);
            return (
              <div
                key={habit.id}
                className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 hover:border-purple-200 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{habit.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {stats.completed} of {stats.total} completed today
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Delete habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-500"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>

                {/* My Completion - Prominent - Checkbox on Right */}
                {myCompletion && (
                  <div className="mb-4 bg-white rounded-lg p-4 border-2 border-purple-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-purple-500 text-white text-sm">
                          {getInitials(myCompletion.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <span className="font-semibold text-gray-900">
                          You ({myCompletion.name})
                        </span>
                        {myCompletion.completed && (
                          <span className="ml-2 text-sm text-green-600 font-medium">Completed</span>
                        )}
                      </div>
                      <Checkbox
                        checked={myCompletion.completed}
                        onCheckedChange={() => handleToggleCompletion(habit.id)}
                        disabled={myCompletion.completed}
                        className="h-7 w-7 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-purple-500 data-[state=checked]:to-blue-500"
                      />
                    </label>
                  </div>
                )}

                {/* Other Members - View Only */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Team Progress
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {habit.members
                      .filter((m) => m.id !== currentUserId)
                      .map((member, memberIndex) => (
                        <div
                          key={member.id}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                            member.completed
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <Avatar className="w-7 h-7">
                            <AvatarFallback
                              className={getMemberColor(memberIndex + 1) + ' text-white text-xs'}
                            >
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-700 flex-1">{member.name}</span>
                          {member.completed ? (
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-300" />
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-gray-800">
          <strong>Stay motivated together!</strong> You can only check your own habits. See how
          your team is doing and encourage each other!
        </p>
      </div>
    </div>
  );
}
