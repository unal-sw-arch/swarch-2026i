import 'package:freezed_annotation/freezed_annotation.dart';

part 'habit.freezed.dart';
part 'habit.g.dart';

/// Habit (Hábito) model
@freezed
class Habit with _$Habit {
  const factory Habit({
    required String id,
    required String roomId,
    required String name,
    required String description,
    required String userId,
    required String frequency, // 'daily', 'weekly', 'monthly'
    required int completionStreak,
    required int totalCompletions,
    required DateTime createdAt,
    required DateTime updatedAt,
    DateTime? lastCompletedAt,
    String? icon,
    int? coinsReward, // Monedas por completar
  }) = _Habit;

  factory Habit.fromJson(Map<String, dynamic> json) => _$HabitFromJson(json);
}

/// Habit frequency constants
class HabitFrequency {
  static const String daily = 'daily';
  static const String weekly = 'weekly';
  static const String monthly = 'monthly';

  static List<String> get values => [daily, weekly, monthly];

  static String getName(String frequency) {
    switch (frequency) {
      case daily:
        return 'Diario';
      case weekly:
        return 'Semanal';
      case monthly:
        return 'Mensual';
      default:
        return 'Desconocido';
    }
  }
}

/// Habit completion record
@freezed
class HabitCompletion with _$HabitCompletion {
  const factory HabitCompletion({
    required String id,
    required String habitId,
    required String userId,
    required DateTime completedAt,
    int? coinsEarned,
  }) = _HabitCompletion;

  factory HabitCompletion.fromJson(Map<String, dynamic> json) =>
      _$HabitCompletionFromJson(json);
}
