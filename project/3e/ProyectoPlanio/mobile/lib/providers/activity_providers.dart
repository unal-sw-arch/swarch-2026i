import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Activity state providers

/// List of rooms
final roomsProvider = StateProvider<List<dynamic>>((ref) {
  return [];
});

/// Selected room
final selectedRoomProvider = StateProvider<String?>((ref) {
  return null;
});

/// List of tasks for the selected room
final tasksProvider = StateProvider<List<dynamic>>((ref) {
  return [];
});

/// List of habits
final habitsProvider = StateProvider<List<dynamic>>((ref) {
  return [];
});

/// Activity feed
final activityFeedProvider = StateProvider<List<dynamic>>((ref) {
  return [];
});

/// Loading state for activity operations
final activityLoadingProvider = StateProvider<bool>((ref) {
  return false;
});

/// Error message for activity operations
final activityErrorProvider = StateProvider<String?>((ref) {
  return null;
});
