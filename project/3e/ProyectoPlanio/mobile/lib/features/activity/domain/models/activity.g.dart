// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'activity.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ActivityImpl _$$ActivityImplFromJson(Map<String, dynamic> json) =>
    _$ActivityImpl(
      id: json['id'] as String,
      roomId: json['roomId'] as String,
      userId: json['userId'] as String,
      userName: json['userName'] as String,
      actionType: json['actionType'] as String,
      description: json['description'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      targetId: json['targetId'] as String?,
      targetType: json['targetType'] as String?,
      userAvatar: json['userAvatar'] as String?,
    );

Map<String, dynamic> _$$ActivityImplToJson(_$ActivityImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'roomId': instance.roomId,
      'userId': instance.userId,
      'userName': instance.userName,
      'actionType': instance.actionType,
      'description': instance.description,
      'createdAt': instance.createdAt.toIso8601String(),
      'targetId': instance.targetId,
      'targetType': instance.targetType,
      'userAvatar': instance.userAvatar,
    };
