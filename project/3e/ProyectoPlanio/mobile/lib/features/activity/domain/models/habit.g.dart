// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'habit.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$HabitImpl _$$HabitImplFromJson(Map<String, dynamic> json) => _$HabitImpl(
  id: json['id'] as String,
  roomId: json['roomId'] as String,
  name: json['name'] as String,
  description: json['description'] as String,
  userId: json['userId'] as String,
  frequency: json['frequency'] as String,
  completionStreak: (json['completionStreak'] as num).toInt(),
  totalCompletions: (json['totalCompletions'] as num).toInt(),
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
  lastCompletedAt: json['lastCompletedAt'] == null
      ? null
      : DateTime.parse(json['lastCompletedAt'] as String),
  icon: json['icon'] as String?,
  coinsReward: (json['coinsReward'] as num?)?.toInt(),
);

Map<String, dynamic> _$$HabitImplToJson(_$HabitImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'roomId': instance.roomId,
      'name': instance.name,
      'description': instance.description,
      'userId': instance.userId,
      'frequency': instance.frequency,
      'completionStreak': instance.completionStreak,
      'totalCompletions': instance.totalCompletions,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'lastCompletedAt': instance.lastCompletedAt?.toIso8601String(),
      'icon': instance.icon,
      'coinsReward': instance.coinsReward,
    };

_$HabitCompletionImpl _$$HabitCompletionImplFromJson(
  Map<String, dynamic> json,
) => _$HabitCompletionImpl(
  id: json['id'] as String,
  habitId: json['habitId'] as String,
  userId: json['userId'] as String,
  completedAt: DateTime.parse(json['completedAt'] as String),
  coinsEarned: (json['coinsEarned'] as num?)?.toInt(),
);

Map<String, dynamic> _$$HabitCompletionImplToJson(
  _$HabitCompletionImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'habitId': instance.habitId,
  'userId': instance.userId,
  'completedAt': instance.completedAt.toIso8601String(),
  'coinsEarned': instance.coinsEarned,
};
