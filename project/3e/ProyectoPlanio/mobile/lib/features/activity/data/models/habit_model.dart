import 'package:json_annotation/json_annotation.dart';

part 'habit_model.g.dart';

/// Modelo de un hábito en una sala
@JsonSerializable()
class Habit {
  final String id;
  final String roomId;
  final String name;
  final String? description;
  final String? icon;
  final bool completedToday;
  final int streak;
  @JsonKey(name: 'createdAt')
  final DateTime createdAt;
  @JsonKey(name: 'lastCompletedAt')
  final DateTime? lastCompletedAt;

  Habit({
    required this.id,
    required this.roomId,
    required this.name,
    this.description,
    this.icon,
    this.completedToday = false,
    this.streak = 0,
    required this.createdAt,
    this.lastCompletedAt,
  });

  factory Habit.fromJson(Map<String, dynamic> json) => _$HabitFromJson(json);
  Map<String, dynamic> toJson() => _$HabitToJson(this);

  Habit copyWith({
    String? id,
    String? roomId,
    String? name,
    String? description,
    String? icon,
    bool? completedToday,
    int? streak,
    DateTime? createdAt,
    DateTime? lastCompletedAt,
  }) {
    return Habit(
      id: id ?? this.id,
      roomId: roomId ?? this.roomId,
      name: name ?? this.name,
      description: description ?? this.description,
      icon: icon ?? this.icon,
      completedToday: completedToday ?? this.completedToday,
      streak: streak ?? this.streak,
      createdAt: createdAt ?? this.createdAt,
      lastCompletedAt: lastCompletedAt ?? this.lastCompletedAt,
    );
  }
}
