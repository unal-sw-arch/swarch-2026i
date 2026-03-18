import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Plus, Check, Trash2, AlertCircle } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import confetti from 'canvas-confetti';

interface HabitCompletion {
  userId: string;
  userName: string;
  avatar: string;
  color: string;
  completed: boolean;
}

interface Habit {
  id: string;
  name: string;
  completions: HabitCompletion[];
}

const members = [
  { id: '1', name: 'Laura', avatar: 'L', color: 'bg-purple-500' },
  { id: '2', name: 'Juan', avatar: 'J', color: 'bg-blue-500' },
  { id: '3', name: 'Jerónimo', avatar: 'JE', color: 'bg-green-500' },
];

// Current user (in a real app, this would come from auth)
const currentUser = members[0]; // Laura

const initialHabits: Habit[] = [
  {
    id: '1',
    name: 'Drink Water',
    completions: [
      { userId: '1', userName: 'Laura', avatar: 'L', color: 'bg-purple-500', completed: true },
      { userId: '2', userName: 'Juan', avatar: 'J', color: 'bg-blue-500', completed: false },
      { userId: '3', userName: 'Jerónimo', avatar: 'JE', color: 'bg-green-500', completed: true },
    ],
  },
  {
    id: '2',
    name: 'Morning Exercise',
    completions: [
      { userId: '1', userName: 'Laura', avatar: 'L', color: 'bg-purple-500', completed: true },
      { userId: '2', userName: 'Juan', avatar: 'J', color: 'bg-blue-500', completed: true },
      { userId: '3', userName: 'Jerónimo', avatar: 'JE', color: 'bg-green-500', completed: false },
    ],
  },
  {
    id: '3',
    name: 'Read for 30min',
    completions: [
      { userId: '1', userName: 'Laura', avatar: 'L', color: 'bg-purple-500', completed: false },
      { userId: '2', userName: 'Juan', avatar: 'J', color: 'bg-blue-500', completed: false },
      { userId: '3', userName: 'Jerónimo', avatar: 'JE', color: 'bg-green-500', completed: true },
    ],
  },
];

interface HabitsPanelProps {
  roomOwnerId: string;
  onCurrencyReward: (amount: number, message: string) => void;
}

export default function HabitsPanel({ roomOwnerId, onCurrencyReward }: HabitsPanelProps) {
  const [habits, setHabits] = useState(initialHabits);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [ownerAlert, setOwnerAlert] = useState<string | null>(null);

  const isOwner = currentUser.id === roomOwnerId;

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
    });
  };

  const handleToggleCompletion = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    const myCompletion = habit?.completions.find((c) => c.userId === currentUser.id);
    
    // Only toggle for current user
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              completions: habit.completions.map((comp) =>
                comp.userId === currentUser.id
                  ? { ...comp, completed: !comp.completed }
                  : comp
              ),
            }
          : habit
      )
    );

    // If completing (not uncompleting), trigger celebration
    if (myCompletion && !myCompletion.completed) {
      triggerConfetti();
      onCurrencyReward(10, 'Habit completed!');
    }
  };

  const handleDeleteHabit = (habitId: string) => {
    if (!isOwner) {
      setOwnerAlert('Only the room owner can delete habits.');
      setTimeout(() => setOwnerAlert(null), 3000);
      return;
    }
    setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== habitId));
  };

  const handleTryAddHabit = () => {
    if (!isOwner) {
      setOwnerAlert('Only the room owner can create new habits.');
      setTimeout(() => setOwnerAlert(null), 3000);
      return;
    }
    setShowAddHabit(true);
  };

  const handleCreateHabit = () => {
    if (newHabitName) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: newHabitName,
        completions: members.map((member) => ({
          userId: member.id,
          userName: member.name,
          avatar: member.avatar,
          color: member.color,
          completed: false,
        })),
      };
      setHabits([...habits, newHabit]);
      setNewHabitName('');
      setShowAddHabit(false);
    }
  };

  const getCompletionStats = (habit: Habit) => {
    const completed = habit.completions.filter((c) => c.completed).length;
    const total = habit.completions.length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const getCurrentUserCompletion = (habit: Habit) => {
    return habit.completions.find((c) => c.userId === currentUser.id);
  };

  return (
    <div className="space-y-4">
      {/* Owner Alert */}
      {ownerAlert && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-orange-900">{ownerAlert}</p>
            <p className="text-sm text-orange-700 mt-1">
              Contact {members.find(m => m.id === roomOwnerId)?.name || 'the owner'} if you'd like to make changes.
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
              <Button onClick={handleCreateHabit} disabled={!newHabitName}>
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
            📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6 ring-2 ring-purple-300">
              <AvatarFallback className={currentUser.color + ' text-white text-xs'}>
                {currentUser.avatar}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">You: {currentUser.name}</span>
          </div>
        </div>

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
                    title={!isOwner ? 'Only owner can delete' : 'Delete habit'}
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
                <div className="mb-4 bg-white rounded-lg p-4 border-2 border-purple-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className={currentUser.color + ' text-white text-sm'}>
                        {currentUser.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">You ({currentUser.name})</span>
                      {myCompletion?.completed && (
                        <span className="ml-2 text-sm text-green-600 font-medium">✓ Completed</span>
                      )}
                    </div>
                    <Checkbox
                      checked={myCompletion?.completed || false}
                      onCheckedChange={() => handleToggleCompletion(habit.id)}
                      className="h-7 w-7 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-purple-500 data-[state=checked]:to-blue-500"
                    />
                  </label>
                </div>

                {/* Other Members - View Only */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                    Team Progress
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {habit.completions
                      .filter((comp) => comp.userId !== currentUser.id)
                      .map((completion) => (
                        <div
                          key={completion.userId}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                            completion.completed
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <Avatar className="w-7 h-7">
                            <AvatarFallback className={completion.color + ' text-white text-xs'}>
                              {completion.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-700 flex-1">{completion.userName}</span>
                          {completion.completed ? (
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
          💡 <strong>Stay motivated together!</strong> You can only check your own habits. See how your team is doing and encourage each other!
        </p>
      </div>
    </div>
  );
}