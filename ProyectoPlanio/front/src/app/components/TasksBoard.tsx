import { useState, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Plus, GripVertical, Loader2 } from 'lucide-react';
import TaskDetailsModal from './TaskDetailsModal';
import AddTaskModal from './AddTaskModal';
import confetti from 'canvas-confetti';
import { tasksApi } from '../services/api';
import type { Task as ApiTask, RoomMember } from '../types';
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

function getMemberColor(memberId: number, members: RoomMember[]): string {
  const index = members.findIndex((m) => m.id === memberId);
  return memberColors[index >= 0 ? index % memberColors.length : 0];
}

// Tipo interno para el componente
interface TaskDisplay {
  id: number;
  title: string;
  description?: string;
  assignedTo?: {
    id: number;
    name: string;
    avatar: string;
    color: string;
  };
  status: 'TODO' | 'DONE';
}

// Convertir tarea de API a formato de display
function apiTaskToDisplay(task: ApiTask, members: RoomMember[]): TaskDisplay {
  let assignedTo: TaskDisplay['assignedTo'];
  if (task.assigned_to && task.assigned_to_name) {
    assignedTo = {
      id: task.assigned_to,
      name: task.assigned_to_name,
      avatar: getInitials(task.assigned_to_name),
      color: getMemberColor(task.assigned_to, members),
    };
  }

  return {
    id: task.id,
    title: task.title,
    description: task.description || undefined,
    assignedTo,
    status: task.status,
  };
}

const ITEM_TYPE = 'TASK';

interface TaskCardProps {
  task: TaskDisplay;
  onMove: (taskId: number, newStatus: 'TODO' | 'DONE') => void;
  onClick: (task: TaskDisplay) => void;
}

function TaskCard({ task, onMove, onClick }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ITEM_TYPE,
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      onClick={() => onClick(task)}
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-purple-300 transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <GripVertical className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
          {task.assignedTo && (
            <div className="flex items-center gap-2 mt-3">
              <Avatar className="w-6 h-6">
                <AvatarFallback className={task.assignedTo.color + ' text-white text-xs'}>
                  {task.assignedTo.avatar}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600">{task.assignedTo.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ColumnProps {
  title: string;
  status: 'TODO' | 'DONE';
  tasks: TaskDisplay[];
  onMove: (taskId: number, newStatus: 'TODO' | 'DONE') => void;
  onAddTask: () => void;
  onTaskClick: (task: TaskDisplay) => void;
}

function Column({ title, status, tasks, onMove, onAddTask, onTaskClick }: ColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: { id: number; status: 'TODO' | 'DONE' }) => {
      if (item.status !== status) {
        onMove(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`bg-gray-50 rounded-xl p-4 flex-1 transition-colors ${
        isOver ? 'bg-purple-50 ring-2 ring-purple-300' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <Button
          onClick={onAddTask}
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-8 px-3 gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onMove={onMove} onClick={onTaskClick} />
        ))}
      </div>
    </div>
  );
}

interface TasksBoardProps {
  roomId: number;
  members: RoomMember[];
  onCurrencyReward: (amount: number, message: string) => void;
}

export default function TasksBoard({ roomId, members, onCurrencyReward }: TasksBoardProps) {
  const [tasks, setTasks] = useState<TaskDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskDisplay | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Cargar tareas
  useEffect(() => {
    async function loadTasks() {
      try {
        const apiTasks = await tasksApi.getByRoom(roomId);
        setTasks(apiTasks.map((t) => apiTaskToDisplay(t, members)));
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast.error('Error loading tasks');
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [roomId, members]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
    });
  };

  const handleMove = async (taskId: number, newStatus: 'TODO' | 'DONE') => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const wasNotDone = task.status !== 'DONE';

    // Actualización optimista
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await tasksApi.updateStatus(roomId, taskId, { status: newStatus });

      // Si se completó la tarea, celebrar
      if (newStatus === 'DONE' && wasNotDone) {
        triggerConfetti();
        onCurrencyReward(15, 'Task completed!');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Error updating task');
      // Revertir cambio
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? { ...t, status: task.status } : t))
      );
    }
  };

  const handleTaskClick = (task: TaskDisplay) => {
    setSelectedTask(task);
  };

  const handleSaveTask = async (updatedTask: TaskDisplay) => {
    try {
      await tasksApi.update(roomId, updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        assigned_to: updatedTask.assignedTo?.id,
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      setSelectedTask(null);
      toast.success('Task updated');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Error updating task');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await tasksApi.delete(roomId, taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      setSelectedTask(null);
      toast.success('Task deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Error deleting task');
    }
  };

  const handleAddTask = async (newTaskData: {
    title: string;
    description?: string;
    assignedTo?: { id: number; name: string; avatar: string; color: string };
  }) => {
    try {
      const createdTask = await tasksApi.create(roomId, {
        title: newTaskData.title,
        description: newTaskData.description,
        assigned_to: newTaskData.assignedTo?.id,
      });

      const displayTask = apiTaskToDisplay(createdTask, members);
      setTasks([displayTask, ...tasks]);
      setShowAddModal(false);
      toast.success('Task created');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Error creating task');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');

  // Convertir members a formato esperado por los modales
  const membersForModal = members.map((m, idx) => ({
    id: String(m.id),
    name: m.name,
    avatar: getInitials(m.name),
    color: memberColors[idx % memberColors.length],
  }));

  return (
    <div className="space-y-4">
      {/* Kanban Board */}
      <div className="flex gap-4">
        <Column
          title="TODO"
          status="TODO"
          tasks={todoTasks}
          onMove={handleMove}
          onAddTask={() => setShowAddModal(true)}
          onTaskClick={handleTaskClick}
        />
        <Column
          title="DONE"
          status="DONE"
          tasks={doneTasks}
          onMove={handleMove}
          onAddTask={() => setShowAddModal(true)}
          onTaskClick={handleTaskClick}
        />
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={{
            ...selectedTask,
            id: String(selectedTask.id),
            assignedTo: selectedTask.assignedTo
              ? { ...selectedTask.assignedTo, id: String(selectedTask.assignedTo.id) }
              : undefined,
          }}
          members={membersForModal}
          onClose={() => setSelectedTask(null)}
          onSave={(task) =>
            handleSaveTask({
              ...task,
              id: Number(task.id),
              assignedTo: task.assignedTo
                ? { ...task.assignedTo, id: Number(task.assignedTo.id) }
                : undefined,
            })
          }
          onDelete={(id) => handleDeleteTask(Number(id))}
        />
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal
          members={membersForModal}
          onClose={() => setShowAddModal(false)}
          onAdd={(data) =>
            handleAddTask({
              ...data,
              assignedTo: data.assignedTo
                ? { ...data.assignedTo, id: Number(data.assignedTo.id) }
                : undefined,
            })
          }
        />
      )}
    </div>
  );
}
