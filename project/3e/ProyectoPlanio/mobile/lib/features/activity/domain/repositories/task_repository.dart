import 'package:planio_app/features/activity/domain/models/task.dart';

/// Repository interface para operaciones con Tasks
abstract class TaskRepository {
  /// Get all tasks for a room
  Future<List<Task>> getTasksByRoom(String roomId);

  /// Get a specific task by ID
  Future<Task> getTaskById(String taskId);

  /// Create a new task
  Future<Task> createTask({
    required String roomId,
    required String title,
    required String description,
    required String assignedTo,
    DateTime? dueDate,
    int? priority,
  });

  /// Update a task
  Future<Task> updateTask(Task task);

  /// Delete a task
  Future<void> deleteTask(String taskId);

  /// Update task status
  Future<Task> updateTaskStatus(String taskId, String status);

  /// Get tasks by status
  Future<List<Task>> getTasksByStatus(String roomId, String status);

  /// Search tasks
  Future<List<Task>> searchTasks(String roomId, String query);
}
