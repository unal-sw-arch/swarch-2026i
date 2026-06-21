import 'package:planio_app/features/chat/data/models/chat_models.dart';

abstract class ChatRepository {
  /// Obtiene los mensajes de una sala
  Future<List<Message>> getMessages(String roomId, {int limit = 50});

  /// Envía un mensaje a una sala
  Future<Message> sendMessage(String roomId, String content);

  /// Agrega una reacción a un mensaje
  Future<void> addReaction(
    String roomId,
    String messageId,
    String emoji,
  );

  /// Stream de mensajes en tiempo real para una sala
  Stream<Message> getMessagesStream(String roomId);

  /// Conecta al WebSocket de la sala
  Future<void> connectToRoom(String roomId);

  /// Desconecta del WebSocket de la sala
  Future<void> disconnectFromRoom(String roomId);
}
