// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chat_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Message _$MessageFromJson(Map<String, dynamic> json) => Message(
  id: json['id'] as String,
  roomId: json['roomId'] as String,
  userId: json['userId'] as String,
  userName: json['userName'] as String,
  content: json['content'] as String,
  timestamp: DateTime.parse(json['createdAt'] as String),
  reactions:
      (json['reactions'] as List<dynamic>?)
          ?.map((e) => Reaction.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
);

Map<String, dynamic> _$MessageToJson(Message instance) => <String, dynamic>{
  'id': instance.id,
  'roomId': instance.roomId,
  'userId': instance.userId,
  'userName': instance.userName,
  'content': instance.content,
  'createdAt': instance.timestamp.toIso8601String(),
  'reactions': instance.reactions,
};

Reaction _$ReactionFromJson(Map<String, dynamic> json) => Reaction(
  userId: json['userId'] as String,
  emoji: json['emoji'] as String,
  timestamp: DateTime.parse(json['timestamp'] as String),
);

Map<String, dynamic> _$ReactionToJson(Reaction instance) => <String, dynamic>{
  'userId': instance.userId,
  'emoji': instance.emoji,
  'timestamp': instance.timestamp.toIso8601String(),
};
