import { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Plus, GripVertical } from 'lucide-react';
import TaskDetailsModal from './TaskDetailsModal';
import AddTaskModal from './AddTaskModal';
import confetti from 'canvas-confetti';

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

const members = [
  { id: '1', name: 'Laura', avatar: 'L', color: 'bg-purple-500' },
  { id: '2', name: 'Juan', avatar: 'J', color: 'bg-blue-500' },
  { id: '3', name: 'Jerónimo', avatar: 'JE', color: 'bg-green-500' },
];

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Wash dishes',
    description: 'Clean all dishes from dinner',
    assignedTo: { id: '2', name: 'Juan', avatar: 'J', color: 'bg-blue-500' },
    status: 'TODO',
  },
  {
    id: '2',
    title: 'Buy groceries',
    description: 'Milk, eggs, bread',
    assignedTo: { id: '1', name: 'Laura', avatar: 'L', color: 'bg-purple-500' },
    status: 'TODO',
  },
  {
    id: '3',
    title: 'Sweep floor',
    assignedTo: { id: '3', name: 'Jerónimo', avatar: 'JE', color: 'bg-green-500' },
    status: 'DONE',
  },
  {
    id: '4',
    title: 'Take out trash',
    assignedTo: { id: '2', name: 'Juan', avatar: 'J', color: 'bg-blue-500' },
    status: 'DONE',
  },
];

const ITEM_TYPE = 'TASK';

interface TaskCardProps {
  task: Task;
  onMove: (taskId: string, newStatus: 'TODO' | 'DONE') => void;
  onClick: (task: Task) => void;
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
  tasks: Task[];
  onMove: (taskId: string, newStatus: 'TODO' | 'DONE') => void;
  onAddTask: () => void;
  onTaskClick: (task: Task) => void;
}

function Column({ title, status, tasks, onMove, onAddTask, onTaskClick }: ColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ITEM_TYPE,
    drop: (item: { id: string; status: 'TODO' | 'DONE' }) => {
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
  onCurrencyReward: (amount: number, message: string) => void;
}

export default function TasksBoard({ onCurrencyReward }: TasksBoardProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
    });
  };

  const handleMove = (taskId: string, newStatus: 'TODO' | 'DONE') => {
    const task = tasks.find((t) => t.id === taskId);
    const wasNotDone = task?.status !== 'DONE';
    
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    // If moved to DONE from TODO, trigger celebration
    if (newStatus === 'DONE' && wasNotDone) {
      triggerConfetti();
      onCurrencyReward(15, 'Task completed!');
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleSaveTask = (updatedTask: Task) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const handleAddTask = (newTaskData: {
    title: string;
    description?: string;
    assignedTo?: { id: string; name: string; avatar: string; color: string };
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskData.title,
      description: newTaskData.description,
      assignedTo: newTaskData.assignedTo,
      status: 'TODO',
    };
    setTasks([...tasks, newTask]);
  };

  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const doneTasks = tasks.filter((t) => t.status === 'DONE');

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
          task={selectedTask}
          members={members}
          onClose={() => setSelectedTask(null)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal
          members={members}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTask}
        />
      )}
    </div>
  );
}