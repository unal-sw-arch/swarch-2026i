// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'task.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$TaskImpl _$$TaskImplFromJson(Map<String, dynamic> json) => _$TaskImpl(
  id: json['id'] as String,
  roomId: json['roomId'] as String,
  title: json['title'] as String,
  description: json['description'] as String,
  status: json['status'] as String,
  createdBy: json['createdBy'] as String,
  assignedTo: json['assignedTo'] as String,
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
  dueDate: json['dueDate'] == null
      ? null
      : DateTime.parse(json['dueDate'] as String),
  priority: (json['priority'] as num?)?.toInt(),
  tags: (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList(),
);

Map<String, dynamic> _$$TaskImplToJson(_$TaskImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'roomId': instance.roomId,
      'title': instance.title,
      'description': instance.description,
      'status': instance.status,
      'createdBy': instance.createdBy,
      'assignedTo': instance.assignedTo,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
      'dueDate': instance.dueDate?.toIso8601String(),
      'priority': instance.priority,
      'tags': instance.tags,
    };
