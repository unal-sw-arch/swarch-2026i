import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { X, Trash2, Save } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo?: {
    id: string;
    name: string;
    avatar: string;
    color: string;
  };
  status: 'TODO' | 'DONE';
}

interface TaskDetailsModalProps {
  task: Task;
  members: Array<{ id: string; name: string; avatar: string; color: string }>;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskDetailsModal({
  task,
  members,
  onClose,
  onSave,
  onDelete,
}: TaskDetailsModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [assignedTo, setAssignedTo] = useState(task.assignedTo?.id || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    if (title) {
      const updatedTask: Task = {
        ...task,
        title,
        description: description || undefined,
        assignedTo: assignedTo
          ? members.find((m) => m.id === assignedTo)
          : undefined,
      };
      onSave(updatedTask);
      onClose();
    }
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Task</h2>
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
            <Label htmlFor="title">Task Title</Label>
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
              placeholder="Add more details..."
              className="mt-1.5 min-h-[100px]"
            />
          </div>

          {/* Assign To */}
          <div>
            <Label htmlFor="assignTo">Assign To</Label>
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
        {!showDeleteConfirm ? (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Task
            </Button>
            <div className="flex gap-2">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!title}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-red-50 rounded-b-2xl">
            <p className="text-sm text-red-800 font-medium">Are you sure you want to delete this task?</p>
            <div className="flex gap-2">
              <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" size="sm">
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                size="sm"
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
