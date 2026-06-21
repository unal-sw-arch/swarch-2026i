/// Application-wide constants
class AppConstants {
  // Storage keys
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userIdKey = 'user_id';
  static const String userDataKey = 'user_data';
  
  // Task status
  static const String taskStatusTodo = 'TODO';
  static const String taskStatusDone = 'DONE';
  
  // Timeouts
  static const Duration apiTimeout = Duration(seconds: 30);
  static const Duration websocketReconnectDelay = Duration(seconds: 5);
  
  // Pagination
  static const int pageSize = 20;
  
  // WebSocket events
  static const String wsEventTaskCreated = 'task_created';
  static const String wsEventTaskUpdated = 'task_updated';
  static const String wsEventTaskDeleted = 'task_deleted';
  static const String wsEventHabitCompleted = 'habit_completed';
  static const String wsEventCoinEarned = 'coin_earned';
  static const String wsEventMessageReceived = 'message_received';
  static const String wsEventUserJoined = 'user_joined';
  static const String wsEventUserLeft = 'user_left';
}
