import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ArrowLeft, Share2, CheckSquare, Heart, Clock, Coins, Sparkles, Home } from 'lucide-react';
import TasksBoard from './TasksBoard';
import HabitsPanel from './HabitsPanel';
import ActivityFeed from './ActivityFeed';
import AvatarCustomization from './AvatarCustomization';
import LivingRoom from './LivingRoom';
import { toast } from 'sonner';

// Mock data
const mockRoom = {
  id: '1',
  name: 'Family Planning',
  members: [
    { id: '1', name: 'Laura', avatar: 'L', color: 'bg-purple-500' },
    { id: '2', name: 'Juan', avatar: 'J', color: 'bg-blue-500' },
    { id: '3', name: 'Jerónimo', avatar: 'JE', color: 'bg-green-500' },
  ],
  inviteCode: 'ABC123',
  ownerId: '2', // Juan is the owner
};

export default function RoomDashboard() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');
  const [currency, setCurrency] = useState(450); // Group currency

  const handleInvite = () => {
    navigator.clipboard.writeText(mockRoom.inviteCode);
    toast.success('Invite code copied to clipboard');
  };

  const handleCurrencyReward = (amount: number, message: string) => {
    setCurrency((prev) => prev + amount);
    toast.success(`+${amount} coins`, {
      description: message,
    });
  };

  const handlePurchase = (amount: number, item: string) => {
    if (currency >= amount) {
      setCurrency((prev) => prev - amount);
      toast.success(`Purchased ${item}`, {
        description: `-${amount} coins`,
      });
      return;
    }

    toast.error('Not enough coins for this purchase');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/rooms')}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{mockRoom.name}</h1>
              <p className="text-sm text-gray-500">
                {mockRoom.members.length} members{roomId ? ` - Room #${roomId}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Currency Display */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl px-4 py-2 flex items-center gap-2 shadow-md border-2 border-yellow-300">
              <Coins className="w-5 h-5 text-white" />
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">{currency}</span>
                <span className="text-xs font-semibold text-yellow-100">coins</span>
              </div>
            </div>

            <div className="flex -space-x-2">
              {mockRoom.members.map((member) => (
                <Avatar key={member.id} className="border-2 border-white">
                  <AvatarFallback className={member.color + ' text-white text-xs'}>
                    {member.avatar}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <Button
              onClick={handleInvite}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Share2 className="w-4 h-4" />
              Invite
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent border-b-0 h-auto p-0">
              <TabsTrigger
                value="tasks"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger
                value="habits"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent gap-2"
              >
                <Heart className="w-4 h-4" />
                Habits
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent gap-2"
              >
                <Clock className="w-4 h-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="avatar"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Avatar
              </TabsTrigger>
              <TabsTrigger
                value="livingroom"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent gap-2"
              >
                <Home className="w-4 h-4" />
                Living Room
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <Tabs value={activeTab} className="space-y-4">
          <TabsContent value="tasks" className="mt-0">
            <TasksBoard onCurrencyReward={handleCurrencyReward} />
          </TabsContent>
          <TabsContent value="habits" className="mt-0">
            <HabitsPanel 
              roomOwnerId={mockRoom.ownerId}
              onCurrencyReward={handleCurrencyReward}
            />
          </TabsContent>
          <TabsContent value="activity" className="mt-0">
            <ActivityFeed />
          </TabsContent>
          <TabsContent value="avatar" className="mt-0">
            <AvatarCustomization currency={currency} onPurchase={handlePurchase} />
          </TabsContent>
          <TabsContent value="livingroom" className="mt-0">
            <LivingRoom currency={currency} onPurchase={handlePurchase} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}