import 'dart:async';

import 'package:dio/dio.dart';
import 'package:planio_app/core/services/api_client.dart';
import 'package:planio_app/core/services/api_service.dart';
import 'package:planio_app/features/chat/data/models/chat_models.dart';
import 'package:planio_app/features/chat/data/repositories/chat_repository.dart';

class ChatRepositoryImpl implements ChatRepository {
  final ApiService _apiService;
  StreamController<Message>? _messageStreamController;
  String? _currentRoomId;
  static final Map<String, List<Message>> _demoMessagesByRoom = {};

  ChatRepositoryImpl(this._apiService);

  @override
  Future<List<Message>> getMessages(String roomId, {int limit = 50}) async {
    try {
      final response = await _apiService.dio.get(
        ApiClient.buildUrl(
          '${ApiClient.chatEndpoint}/rooms/$roomId/chat',
          queryParams: {'limit': limit},
        ),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['messages'] ?? [];
        return data
            .map((m) => _mapMessage(m as Map<String, dynamic>, roomId))
            .toList();
      }
      throw Exception('Failed to fetch messages');
    } on DioException {
      final roomMessages = _demoMessagesByRoom.putIfAbsent(
        roomId,
        () => [
          Message(
            id: 'demo-$roomId-1',
            roomId: roomId,
            userId: '2',
            userName: 'Compañero Demo',
            content: 'Bienvenido al chat de la sala.',
            timestamp: DateTime.now().subtract(const Duration(minutes: 8)),
          ),
          Message(
            id: 'demo-$roomId-2',
            roomId: roomId,
            userId: '1',
            userName: 'Tú',
            content: 'Excelente, ya funciona para la demo.',
            timestamp: DateTime.now().subtract(const Duration(minutes: 3)),
          ),
        ],
      );
      return List<Message>.from(roomMessages);
    }
  }

  @override
  Future<Message> sendMessage(String roomId, String content) async {
    try {
      final response = await _apiService.dio.post(
        ApiClient.buildUrl('${ApiClient.chatEndpoint}/rooms/$roomId/chat'),
        data: {'text': content},
      );

      if (response.statusCode == 201) {
        final payload = response.data['message'] as Map<String, dynamic>;
        return _mapMessage(payload, roomId);
      }
      throw Exception('Failed to send message');
    } on DioException {
      final localMessage = Message(
        id: 'local-${DateTime.now().millisecondsSinceEpoch}',
        roomId: roomId,
        userId: '1',
        userName: 'Tú',
        content: content,
        timestamp: DateTime.now(),
      );
      final roomMessages = _demoMessagesByRoom.putIfAbsent(roomId, () => []);
      roomMessages.add(localMessage);
      return localMessage;
    }
  }

  @override
  Future<void> addReaction(
    String roomId,
    String messageId,
    String emoji,
  ) async {
    try {
      await _apiService.dio.post(
        ApiClient.buildUrl(
          '${ApiClient.chatEndpoint}/rooms/$roomId/chat/$messageId/reactions',
        ),
        data: {'reaction_key': _mapEmojiToReactionKey(emoji)},
      );
    } on DioException {
      final roomMessages = _demoMessagesByRoom[roomId];
      if (roomMessages == null) {
        return;
      }
      final index = roomMessages.indexWhere((item) => item.id == messageId);
      if (index == -1) {
        return;
      }

      final existing = roomMessages[index];
      final updatedReactions = List<Reaction>.from(existing.reactions);
      updatedReactions.add(
        Reaction(
          userId: '1',
          emoji: _mapEmojiToReactionKey(emoji),
          timestamp: DateTime.now(),
        ),
      );

      roomMessages[index] = Message(
        id: existing.id,
        roomId: existing.roomId,
        userId: existing.userId,
        userName: existing.userName,
        content: existing.content,
        timestamp: existing.timestamp,
        reactions: updatedReactions,
      );
    }
  }

  Message _mapMessage(Map<String, dynamic> data, String roomId) {
    final reactionCounts = data['reactions'];
    final reactions = <Reaction>[];

    if (reactionCounts is Map<String, dynamic>) {
      reactionCounts.forEach((key, value) {
        final count = value is num ? value.toInt() : 0;
        for (var i = 0; i < count; i++) {
          reactions.add(
            Reaction(
              userId: key,
              emoji: key,
              timestamp: DateTime.tryParse('${data['createdAt']}') ?? DateTime.now(),
            ),
          );
        }
      });
    }

    return Message(
      id: '${data['id']}',
      roomId: roomId,
      userId: '${data['memberId'] ?? ''}',
      userName: '${data['memberName'] ?? 'Usuario'}',
      content: '${data['text'] ?? ''}',
      timestamp: DateTime.tryParse('${data['createdAt']}') ?? DateTime.now(),
      reactions: reactions,
    );
  }

  String _mapEmojiToReactionKey(String emoji) {
    switch (emoji) {
      case 'love':
      case 'clap':
      case 'fire':
      case 'encourage':
        return emoji;
      case '❤️':
        return 'love';
      case '👏':
        return 'clap';
      case '🔥':
        return 'fire';
      default:
        return 'encourage';
    }
  }

  @override
  Stream<Message> getMessagesStream(String roomId) {
    _messageStreamController ??= StreamController<Message>.broadcast();
    return _messageStreamController!.stream;
  }

  @override
  Future<void> connectToRoom(String roomId) async {
    _currentRoomId = roomId;
    // La conexión WebSocket se manejará en el servicio de WebSocket
    // Este método es un placeholder para lógica futura
  }

  @override
  Future<void> disconnectFromRoom(String roomId) async {
    if (_currentRoomId == roomId) {
      _currentRoomId = null;
    }
  }

  void dispose() {
    _messageStreamController?.close();
    _messageStreamController = null;
  }
}
