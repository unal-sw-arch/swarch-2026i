import 'package:freezed_annotation/freezed_annotation.dart';

part 'activity.freezed.dart';
part 'activity.g.dart';

/// Activity feed entry model
@freezed
class Activity with _$Activity {
  const factory Activity({
    required String id,
    required String roomId,
    required String userId,
    required String userName,
    required String actionType, // 'task_created', 'task_completed', 'habit_completed', 'joined_room', etc.
    required String description,
    required DateTime createdAt,
    String? targetId, // ID de la tarea, hábito, etc.
    String? targetType, // 'task', 'habit', 'room', etc.
    String? userAvatar,
  }) = _Activity;

  factory Activity.fromJson(Map<String, dynamic> json) =>
      _$ActivityFromJson(json);
}

/// Activity action type constants
class ActivityActionType {
  static const String taskCreated = 'task_created';
  static const String taskCompleted = 'task_completed';
  static const String taskUpdated = 'task_updated';
  static const String habitCompleted = 'habit_completed';
  static const String userJoined = 'user_joined';
  static const String coinEarned = 'coin_earned';
  static const String avatarChanged = 'avatar_changed';

  static String getDescription(String actionType, String details) {
    switch (actionType) {
      case taskCreated:
        return 'creó una nueva tarea';
      case taskCompleted:
        return 'completó una tarea';
      case taskUpdated:
        return 'actualizó una tarea';
      case habitCompleted:
        return 'completó un hábito';
      case userJoined:
        return 'se unió a la sala';
      case coinEarned:
        return 'ganó monedas';
      case avatarChanged:
        return 'cambió de avatar';
      default:
        return 'realizó una acción';
    }
  }
}
