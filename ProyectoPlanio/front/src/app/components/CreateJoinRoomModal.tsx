import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Copy, Check, Loader2 } from 'lucide-react';
import { roomsApi } from '../services/api';
import type { Room } from '../types';
import { toast } from 'sonner';

interface CreateJoinRoomModalProps {
  mode: 'create' | 'join';
  onClose: () => void;
  onRoomCreated?: (room: Room) => void;
  onRoomJoined?: (room: Room) => void;
}

export default function CreateJoinRoomModal({
  mode,
  onClose,
  onRoomCreated,
  onRoomJoined,
}: CreateJoinRoomModalProps) {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [createdRoom, setCreatedRoom] = useState<Room | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return;

    setLoading(true);
    setError('');

    try {
      const newRoom = await roomsApi.create({ name: roomName.trim() });
      setCreatedRoom(newRoom);
      onRoomCreated?.(newRoom);
      toast.success('Room created successfully!');
    } catch (err) {
      console.error('Error creating room:', err);
      setError(err instanceof Error ? err.message : 'Error creating room');
      toast.error('Error creating room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (inviteCode.length !== 6) return;

    setLoading(true);
    setError('');

    try {
      const room = await roomsApi.join({ invite_code: inviteCode });
      onRoomJoined?.(room);
      toast.success('Joined room successfully!');
      navigate(`/room/${room.id}`);
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err instanceof Error ? err.message : 'Error joining room');
      toast.error(err instanceof Error ? err.message : 'Error joining room');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (createdRoom) {
      navigator.clipboard.writeText(createdRoom.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoToRoom = () => {
    if (createdRoom) {
      navigate(`/room/${createdRoom.id}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {mode === 'create' ? 'Create Room' : 'Join Room'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'create' && !createdRoom && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  type="text"
                  placeholder="e.g., Family Planning"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="mt-1"
                  autoFocus
                  disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button
                onClick={handleCreateRoom}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                disabled={!roomName.trim() || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Room'
                )}
              </Button>
            </div>
          )}

          {mode === 'create' && createdRoom && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium mb-2">
                  Room created successfully!
                </p>
                <p className="text-sm text-green-700">Share this invite code with others:</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <code className="text-2xl font-mono font-bold text-gray-900">
                    {createdRoom.invite_code}
                  </code>
                  <Button onClick={handleCopyCode} variant="outline" size="sm" className="gap-2">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleGoToRoom}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Go to Room
              </Button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="inviteCode">Invite Code</Label>
                <Input
                  id="inviteCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="mt-1 font-mono"
                  maxLength={6}
                  autoFocus
                  disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button
                onClick={handleJoinRoom}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                disabled={inviteCode.length !== 6 || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Room'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
