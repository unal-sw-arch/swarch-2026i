import 'package:json_annotation/json_annotation.dart';

part 'chat_models.g.dart';

/// Modelo de un mensaje en el chat
@JsonSerializable()
class Message {
  final String id;
  final String roomId;
  final String userId;
  final String userName;
  final String content;
  @JsonKey(name: 'createdAt')
  final DateTime timestamp;
  final List<Reaction> reactions;

  Message({
    required this.id,
    required this.roomId,
    required this.userId,
    required this.userName,
    required this.content,
    required this.timestamp,
    this.reactions = const [],
  });

  factory Message.fromJson(Map<String, dynamic> json) =>
      _$MessageFromJson(json);
  Map<String, dynamic> toJson() => _$MessageToJson(this);

  // Getter para saber si es mensaje del usuario actual
  bool isCurrentUserMessage(String currentUserId) => userId == currentUserId;
}

/// Modelo de reacción en un mensaje
@JsonSerializable()
class Reaction {
  final String userId;
  final String emoji;
  final DateTime timestamp;

  Reaction({
    required this.userId,
    required this.emoji,
    required this.timestamp,
  });

  factory Reaction.fromJson(Map<String, dynamic> json) =>
      _$ReactionFromJson(json);
  Map<String, dynamic> toJson() => _$ReactionToJson(this);
}

/// Modelo de la sala de chat
class ChatRoom {
  final String id;
  final String name;
  final List<Message> messages;
  final bool isConnected;

  ChatRoom({
    required this.id,
    required this.name,
    this.messages = const [],
    this.isConnected = false,
  });

  ChatRoom copyWith({
    String? id,
    String? name,
    List<Message>? messages,
    bool? isConnected,
  }) {
    return ChatRoom(
      id: id ?? this.id,
      name: name ?? this.name,
      messages: messages ?? this.messages,
      isConnected: isConnected ?? this.isConnected,
    );
  }
}
