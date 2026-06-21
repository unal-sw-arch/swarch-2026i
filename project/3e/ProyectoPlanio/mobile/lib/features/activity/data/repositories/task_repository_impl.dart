import 'package:planio_app/core/constants/api_endpoints.dart';
import 'package:planio_app/core/services/api_service.dart';
import 'package:planio_app/features/activity/domain/models/task.dart';
import 'package:planio_app/features/activity/domain/repositories/task_repository.dart';

/// Implementación de TaskRepository
class TaskRepositoryImpl implements TaskRepository {
  final ApiService apiService;

  TaskRepositoryImpl({required this.apiService});

  @override
  Future<List<Task>> getTasksByRoom(String roomId) async {
    try {
      final response = await apiService.get(
        ApiEndpoints.tasks,
        queryParameters: {'roomId': roomId},
      );
      
      if (response is List) {
        return response
            .map((item) => Task.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Task> getTaskById(String taskId) async {
    try {
      final response = await apiService.get<Task>(
        ApiEndpoints.taskById(taskId),
        fromJson: (data) => Task.fromJson(data as Map<String, dynamic>),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Task> createTask({
    required String roomId,
    required String title,
    required String description,
    required String assignedTo,
    DateTime? dueDate,
    int? priority,
  }) async {
    try {
      final response = await apiService.post<Task>(
        ApiEndpoints.tasks,
        data: {
          'roomId': roomId,
          'title': title,
          'description': description,
          'assignedTo': assignedTo,
          'dueDate': dueDate?.toIso8601String(),
          'priority': priority,
        },
        fromJson: (data) => Task.fromJson(data as Map<String, dynamic>),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Task> updateTask(Task task) async {
    try {
      final response = await apiService.put<Task>(
        ApiEndpoints.taskById(task.id),
        data: task.toJson(),
        fromJson: (data) => Task.fromJson(data as Map<String, dynamic>),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> deleteTask(String taskId) async {
    try {
      await apiService.delete<void>(ApiEndpoints.taskById(taskId));
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Task> updateTaskStatus(String taskId, String status) async {
    try {
      final response = await apiService.put<Task>(
        ApiEndpoints.taskById(taskId),
        data: {'status': status},
        fromJson: (data) => Task.fromJson(data as Map<String, dynamic>),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<Task>> getTasksByStatus(String roomId, String status) async {
    try {
      final response = await apiService.get(
        ApiEndpoints.tasks,
        queryParameters: {
          'roomId': roomId,
          'status': status,
        },
      );
      
      if (response is List) {
        return response
            .map((item) => Task.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<Task>> searchTasks(String roomId, String query) async {
    try {
      final response = await apiService.get(
        ApiEndpoints.tasks,
        queryParameters: {
          'roomId': roomId,
          'search': query,
        },
      );
      
      if (response is List) {
        return response
            .map((item) => Task.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }
}
