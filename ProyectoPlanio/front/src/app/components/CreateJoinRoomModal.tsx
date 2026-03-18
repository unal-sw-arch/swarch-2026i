import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Copy, Check } from 'lucide-react';

interface CreateJoinRoomModalProps {
  mode: 'create' | 'join';
  onClose: () => void;
}

export default function CreateJoinRoomModal({ mode, onClose }: CreateJoinRoomModalProps) {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateRoom = () => {
    if (roomName) {
      // Generate random invite code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setGeneratedCode(code);
    }
  };

  const handleJoinRoom = () => {
    if (inviteCode) {
      // Mock join - navigate to room 1
      navigate('/room/1');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          {mode === 'create' && !generatedCode && (
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
                />
              </div>
              <Button
                onClick={handleCreateRoom}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                disabled={!roomName}
              >
                Create Room
              </Button>
            </div>
          )}

          {mode === 'create' && generatedCode && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium mb-2">
                  Room created successfully! 🎉
                </p>
                <p className="text-sm text-green-700">
                  Share this invite code with others:
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <code className="text-2xl font-mono font-bold text-gray-900">
                    {generatedCode}
                  </code>
                  <Button
                    onClick={handleCopyCode}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
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
                onClick={() => navigate(`/room/${Math.floor(Math.random() * 100)}`)}
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
                />
              </div>
              <Button
                onClick={handleJoinRoom}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                disabled={inviteCode.length !== 6}
              >
                Join Room
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
