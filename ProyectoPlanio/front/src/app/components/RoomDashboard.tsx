import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  ArrowLeft,
  Share2,
  CheckSquare,
  Heart,
  Clock,
  Coins,
  Sparkles,
  Home,
  Loader2,
} from 'lucide-react';
import TasksBoard from './TasksBoard';
import HabitsPanel from './HabitsPanel';
import ActivityFeed from './ActivityFeed';
import AvatarCustomization from './AvatarCustomization';
import LivingRoom from './LivingRoom';
import { toast } from 'sonner';
import { roomsApi, coinsApi } from '../services/api';
import type { Room, RoomMember } from '../types';

// Colores para avatares de miembros
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

export default function RoomDashboard() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');
  const [room, setRoom] = useState<Room | null>(null);
  const [currency, setCurrency] = useState(0);
  const [loading, setLoading] = useState(true);

  // Cargar datos de la sala
  useEffect(() => {
    async function loadRoom() {
      if (!roomId) return;

      try {
        const roomData = await roomsApi.getById(Number(roomId));
        setRoom(roomData);
        setCurrency(roomData.coins || 0);
      } catch (error) {
        console.error('Error loading room:', error);
        toast.error('Error loading room');
        navigate('/rooms');
      } finally {
        setLoading(false);
      }
    }

    loadRoom();
  }, [roomId, navigate]);

  // Refrescar balance de coins
  const refreshCoins = async () => {
    if (!roomId) return;
    try {
      const { balance } = await coinsApi.getRoomBalance(Number(roomId));
      setCurrency(balance);
    } catch (error) {
      console.error('Error refreshing coins:', error);
    }
  };

  const handleInvite = () => {
    if (room) {
      navigator.clipboard.writeText(room.invite_code);
      toast.success('Invite code copied to clipboard');
    }
  };

  const handleCurrencyReward = (amount: number, message: string) => {
    setCurrency((prev) => prev + amount);
    toast.success(`+${amount} coins`, {
      description: message,
    });
    // Refrescar coins del servidor en background
    refreshCoins();
  };

  const handlePurchase = async (amount: number, item: string) => {
    if (currency >= amount && roomId) {
      try {
        await coinsApi.spendRoomCoins(Number(roomId), amount, `Purchase: ${item}`);
        setCurrency((prev) => prev - amount);
        toast.success(`Purchased ${item}`, {
          description: `-${amount} coins`,
        });
      } catch (error) {
        console.error('Error spending coins:', error);
        toast.error('Error processing purchase');
      }
      return;
    }

    toast.error('Not enough coins for this purchase');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <p className="text-gray-500">Room not found</p>
      </div>
    );
  }

  const members = room.members || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/rooms')} variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{room.name}</h1>
              <p className="text-sm text-gray-500">{members.length} members</p>
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
              {members.slice(0, 4).map((member, idx) => (
                <Avatar key={member.id} className="border-2 border-white">
                  <AvatarFallback className={getMemberColor(idx) + ' text-white text-xs'}>
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {members.length > 4 && (
                <Avatar className="border-2 border-white">
                  <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                    +{members.length - 4}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <Button onClick={handleInvite} variant="outline" size="sm" className="gap-2">
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
            <TasksBoard
              roomId={Number(roomId)}
              members={members}
              onCurrencyReward={handleCurrencyReward}
            />
          </TabsContent>
          <TabsContent value="habits" className="mt-0">
            <HabitsPanel
              roomId={Number(roomId)}
              roomOwnerId={String(room.created_by)}
              onCurrencyReward={handleCurrencyReward}
            />
          </TabsContent>
          <TabsContent value="activity" className="mt-0">
            <ActivityFeed roomId={Number(roomId)} />
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
