import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:planio_app/features/activity/data/repositories/room_repository_impl.dart';
import 'package:planio_app/features/activity/data/repositories/task_repository_impl.dart';
import 'package:planio_app/features/activity/data/repositories/habit_repository_impl.dart';
import 'package:planio_app/features/activity/domain/repositories/room_repository.dart';
import 'package:planio_app/features/activity/domain/repositories/task_repository.dart';
import 'package:planio_app/features/activity/domain/repositories/activity_repository.dart';
import 'package:planio_app/providers/core_providers.dart';

/// Activity Repository Providers

/// Room repository provider
final roomRepositoryProvider = Provider<RoomRepository>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return RoomRepositoryImpl(apiService: apiService);
});

/// Task repository provider
final taskRepositoryProvider = Provider<TaskRepository>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return TaskRepositoryImpl(apiService: apiService);
});

/// Habit repository provider
final habitRepositoryProvider = Provider<HabitRepository>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return HabitRepositoryImpl(apiService: apiService);
});

/// Get all rooms
final allRoomsProvider = FutureProvider<List<dynamic>>((ref) async {
  final roomRepository = ref.watch(roomRepositoryProvider);
  return roomRepository.getAllRooms();
});

/// Get tasks for selected room
final roomTasksProvider = FutureProvider.family<List<dynamic>, String>((ref, roomId) async {
  final taskRepository = ref.watch(taskRepositoryProvider);
  return taskRepository.getTasksByRoom(roomId);
});

/// Get habits for selected room
final roomHabitsProvider = FutureProvider.family<List<dynamic>, String>((ref, roomId) async {
  final habitRepository = ref.watch(habitRepositoryProvider);
  return habitRepository.getHabitsByRoom(roomId);
});

/// Get tasks by status
final tasksByStatusProvider =
    FutureProvider.family<List<dynamic>, ({String roomId, String status})>(
  (ref, params) async {
    final taskRepository = ref.watch(taskRepositoryProvider);
    return taskRepository.getTasksByStatus(params.roomId, params.status);
  },
);
