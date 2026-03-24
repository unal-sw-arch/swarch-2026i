import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { X, Plus } from 'lucide-react';

interface AddTaskModalProps {
  members: Array<{ id: string; name: string; avatar: string; color: string }>;
  onClose: () => void;
  onAdd: (task: {
    title: string;
    description?: string;
    assignedTo?: { id: string; name: string; avatar: string; color: string };
  }) => void;
}

export default function AddTaskModal({ members, onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const handleAdd = () => {
    if (title) {
      onAdd({
        title,
        description: description || undefined,
        assignedTo: assignedTo ? members.find((m) => m.id === assignedTo) : undefined,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="mt-1.5"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this task..."
              className="mt-1.5 min-h-[100px]"
            />
          </div>

          {/* Assign To */}
          <div>
            <Label>Assign To (optional)</Label>
            <div className="mt-2 space-y-2">
              <button
                onClick={() => setAssignedTo('')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  assignedTo === ''
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                  ?
                </div>
                <span className="text-sm font-medium text-gray-700">Unassigned</span>
              </button>

              {members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setAssignedTo(member.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    assignedTo === member.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={member.color + ' text-white text-sm'}>
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">{member.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!title}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </Button>
        </div>
      </div>
    </div>
  );
}
