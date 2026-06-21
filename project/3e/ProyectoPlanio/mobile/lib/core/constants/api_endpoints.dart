/// API endpoints for Planio backend services
class ApiEndpoints {
  // Auth endpoints (API Gateway)
  static const String login = '/auth/login';
  static const String logout = '/auth/logout';
  static const String refresh = '/auth/refresh';
  static const String googleAuth = '/auth/google';
  
  // Activity Service endpoints
  static const String rooms = '/activity/rooms';
  static const String tasks = '/activity/tasks';
  static const String habits = '/activity/habits';
  static const String activities = '/activity/activities';
  static const String coins = '/activity/coins';
  
  // Personalization Service endpoints
  static const String avatars = '/personalization/avatars';
  static const String items = '/personalization/items';
  static const String virtualRooms = '/personalization/virtual-rooms';
  
  // Chat/Notification endpoints
  static const String messages = '/chat/messages';
  static const String notifications = '/notifications';
  
  // Utility methods
  static String roomById(String roomId) => '/activity/rooms/$roomId';
  static String taskById(String taskId) => '/activity/tasks/$taskId';
  static String habitById(String habitId) => '/activity/habits/$habitId';
  static String messagesByRoom(String roomId) => '/chat/rooms/$roomId/messages';
}
