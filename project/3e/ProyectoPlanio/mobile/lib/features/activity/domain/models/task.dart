import 'package:freezed_annotation/freezed_annotation.dart';

part 'task.freezed.dart';
part 'task.g.dart';

/// Task (Tarea) model
@freezed
class Task with _$Task {
  const factory Task({
    required String id,
    required String roomId,
    required String title,
    required String description,
    required String status, // 'TODO' or 'DONE'
    required String createdBy,
    required String assignedTo,
    required DateTime createdAt,
    required DateTime updatedAt,
    DateTime? dueDate,
    int? priority, // 0-3 (low to high)
    List<String>? tags,
  }) = _Task;

  factory Task.fromJson(Map<String, dynamic> json) => _$TaskFromJson(json);
}

/// Task status constants
class TaskStatus {
  static const String todo = 'TODO';
  static const String done = 'DONE';

  static List<String> get values => [todo, done];
}

/// Task priority levels
class TaskPriority {
  static const int low = 0;
  static const int medium = 1;
  static const int high = 2;
  static const int critical = 3;

  static String getName(int priority) {
    switch (priority) {
      case low:
        return 'Baja';
      case medium:
        return 'Media';
      case high:
        return 'Alta';
      case critical:
        return 'Crítica';
      default:
        return 'Desconocida';
    }
  }
}
