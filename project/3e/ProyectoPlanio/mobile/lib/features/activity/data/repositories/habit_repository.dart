import 'package:planio_app/features/activity/data/models/habit_model.dart';

abstract class HabitRepository {
  /// Obtiene los hábitos de una sala
  Future<List<Habit>> getHabits(String roomId);

  /// Crea un nuevo hábito en una sala
  Future<Habit> createHabit(
    String roomId, {
    required String name,
    String? description,
    String? icon,
  });

  /// Marca un hábito como completado
  Future<Habit> completeHabit(String roomId, String habitId);

  /// Elimina un hábito
  Future<void> deleteHabit(String roomId, String habitId);

  /// Obtiene un hábito específico
  Future<Habit> getHabit(String roomId, String habitId);
}
