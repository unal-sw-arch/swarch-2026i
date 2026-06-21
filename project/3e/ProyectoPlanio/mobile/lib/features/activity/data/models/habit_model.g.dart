// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'habit_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Habit _$HabitFromJson(Map<String, dynamic> json) => Habit(
  id: json['id'] as String,
  roomId: json['roomId'] as String,
  name: json['name'] as String,
  description: json['description'] as String?,
  icon: json['icon'] as String?,
  completedToday: json['completedToday'] as bool? ?? false,
  streak: (json['streak'] as num?)?.toInt() ?? 0,
  createdAt: DateTime.parse(json['createdAt'] as String),
  lastCompletedAt: json['lastCompletedAt'] == null
      ? null
      : DateTime.parse(json['lastCompletedAt'] as String),
);

Map<String, dynamic> _$HabitToJson(Habit instance) => <String, dynamic>{
  'id': instance.id,
  'roomId': instance.roomId,
  'name': instance.name,
  'description': instance.description,
  'icon': instance.icon,
  'completedToday': instance.completedToday,
  'streak': instance.streak,
  'createdAt': instance.createdAt.toIso8601String(),
  'lastCompletedAt': instance.lastCompletedAt?.toIso8601String(),
};
