import 'package:planio_app/features/chat/domain/models/message.dart';

/// Repository interface para operaciones con Mensajes
abstract class MessageRepository {
  /// Get messages for a room
  Future<List<Message>> getMessages(
    String roomId, {
    int limit = 50,
    int offset = 0,
  });

  /// Get a specific message by ID
  Future<Message> getMessageById(String messageId);

  /// Send a new message
  Future<Message> sendMessage({
    required String roomId,
    required String content,
  });

  /// Edit a message
  Future<Message> editMessage(String messageId, String newContent);

  /// Delete a message
  Future<void> deleteMessage(String messageId);

  /// React to a message (add emoji reaction)
  Future<void> reactToMessage(String messageId, String emoji);
}
