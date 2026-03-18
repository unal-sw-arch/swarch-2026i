import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Plus, LogIn, Users } from 'lucide-react';
import CreateJoinRoomModal from './CreateJoinRoomModal';

// Mock data
const mockRooms = [
  {
    id: '1',
    name: 'Family Planning',
    members: [
      { id: '1', name: 'Laura', avatar: 'L', color: 'bg-purple-500' },
      { id: '2', name: 'Juan', avatar: 'J', color: 'bg-blue-500' },
      { id: '3', name: 'Jerónimo', avatar: 'JE', color: 'bg-green-500' },
    ],
  },
  {
    id: '2',
    name: 'Work Projects',
    members: [
      { id: '1', name: 'Laura', avatar: 'L', color: 'bg-purple-500' },
      { id: '4', name: 'Sarah', avatar: 'S', color: 'bg-pink-500' },
    ],
  },
  {
    id: '3',
    name: 'Fitness Challenge',
    members: [
      { id: '1', name: 'Laura', avatar: 'L', color: 'bg-purple-500' },
      { id: '2', name: 'Juan', avatar: 'J', color: 'bg-blue-500' },
      { id: '3', name: 'Jerónimo', avatar: 'JE', color: 'bg-green-500' },
      { id: '5', name: 'Mike', avatar: 'M', color: 'bg-orange-500' },
    ],
  },
];

const currentUser = { name: 'Laura', avatar: 'L', color: 'bg-purple-500' };

export default function RoomsList() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'join'>('create');

  const handleCreateRoom = () => {
    setModalMode('create');
    setShowModal(true);
  };

  const handleJoinRoom = () => {
    setModalMode('join');
    setShowModal(true);
  };

  const handleRoomClick = (roomId: string) => {
    navigate(`/room/${roomId}`);
  };

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
            <AvatarFallback className={currentUser.color + ' text-white'}>
              {currentUser.avatar}
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
            <Button
              onClick={handleJoinRoom}
              variant="outline"
              className="gap-2"
            >
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => handleRoomClick(room.id)}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-left border border-gray-100"
            >
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                {room.name}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {room.members.slice(0, 4).map((member, idx) => (
                    <Avatar key={member.id} className="border-2 border-white">
                      <AvatarFallback className={member.color + ' text-white text-xs'}>
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {room.members.length > 4 && (
                    <Avatar className="border-2 border-white">
                      <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                        +{room.members.length - 4}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {room.members.length} {room.members.length === 1 ? 'member' : 'members'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Create/Join Modal */}
      {showModal && (
        <CreateJoinRoomModal
          mode={modalMode}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
