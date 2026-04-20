import 'package:planio_app/features/activity/domain/models/habit.dart';

/// Repository interface para operaciones con Habits
abstract class HabitRepository {
  /// Get all habits for a room
  Future<List<Habit>> getHabitsByRoom(String roomId);

  /// Get habits for a specific user in a room
  Future<List<Habit>> getHabitsByUser(String roomId, String userId);

  /// Get a specific habit by ID
  Future<Habit> getHabitById(String habitId);

  /// Create a new habit
  Future<Habit> createHabit({
    required String roomId,
    required String name,
    required String description,
    required String frequency,
    int? coinsReward,
  });

  /// Update a habit
  Future<Habit> updateHabit(Habit habit);

  /// Delete a habit
  Future<void> deleteHabit(String habitId);

  /// Mark habit as completed
  Future<HabitCompletion> completeHabit(String habitId);

  /// Get completion history for a habit
  Future<List<HabitCompletion>> getHabitCompletions(
    String habitId, {
    int limit = 30,
  });
}
