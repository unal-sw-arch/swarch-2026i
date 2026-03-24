import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Plus, LogIn, Users, Loader2 } from 'lucide-react';
import CreateJoinRoomModal from './CreateJoinRoomModal';
import { useAuth } from '../context/AuthContext';
import { roomsApi, usersApi } from '../services/api';
import type { Room } from '../types';
import { toast } from 'sonner';

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

export default function RoomsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'join'>('create');

  // Sincronizar usuario con backend y cargar salas
  useEffect(() => {
    async function loadData() {
      try {
        // Sincronizar usuario con el backend
        await usersApi.login();
        // Cargar salas del usuario
        const userRooms = await roomsApi.getAll();
        setRooms(userRooms);
      } catch (error) {
        console.error('Error loading rooms:', error);
        toast.error('Error loading rooms');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user]);

  const handleCreateRoom = () => {
    setModalMode('create');
    setShowModal(true);
  };

  const handleJoinRoom = () => {
    setModalMode('join');
    setShowModal(true);
  };

  const handleRoomClick = (roomId: number) => {
    navigate(`/room/${roomId}`);
  };

  const handleRoomCreated = (newRoom: Room) => {
    setRooms((prev) => [newRoom, ...prev]);
    setShowModal(false);
  };

  const handleRoomJoined = (joinedRoom: Room) => {
    setRooms((prev) => [joinedRoom, ...prev]);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Planio</h1>
          </div>
          <Avatar>
            <AvatarFallback className="bg-purple-500 text-white">
              {user?.displayName ? getInitials(user.displayName) : user?.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Rooms</h2>
            <p className="text-gray-600 mt-1">Choose a room to start planning</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleJoinRoom} variant="outline" className="gap-2">
              <LogIn className="w-4 h-4" />
              Join Room
            </Button>
            <Button
              onClick={handleCreateRoom}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Room
            </Button>
          </div>
        </div>

        {/* Rooms Grid */}
        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms yet</h3>
            <p className="text-gray-500 mb-4">Create a room or join one with an invite code</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleRoomClick(room.id)}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-left border border-gray-100"
              >
                <h3 className="font-semibold text-lg text-gray-900 mb-3">{room.name}</h3>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {/* Si hay miembros, mostrar avatares */}
                    {room.members ? (
                      room.members.slice(0, 4).map((member, idx) => (
                        <Avatar key={member.id} className="border-2 border-white">
                          <AvatarFallback className={getMemberColor(idx) + ' text-white text-xs'}>
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                      ))
                    ) : (
                      // Si solo tenemos member_count, mostrar placeholders
                      Array.from({ length: Math.min(room.member_count || 1, 4) }).map((_, idx) => (
                        <Avatar key={idx} className="border-2 border-white">
                          <AvatarFallback className={getMemberColor(idx) + ' text-white text-xs'}>
                            ?
                          </AvatarFallback>
                        </Avatar>
                      ))
                    )}
                    {(room.member_count || 0) > 4 && (
                      <Avatar className="border-2 border-white">
                        <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                          +{(room.member_count || 0) - 4}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {room.member_count || 1} {(room.member_count || 1) === 1 ? 'member' : 'members'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Create/Join Modal */}
      {showModal && (
        <CreateJoinRoomModal
          mode={modalMode}
          onClose={() => setShowModal(false)}
          onRoomCreated={handleRoomCreated}
          onRoomJoined={handleRoomJoined}
        />
      )}
    </div>
  );
}
