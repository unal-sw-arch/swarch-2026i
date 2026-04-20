import 'package:planio_app/core/constants/api_endpoints.dart';
import 'package:planio_app/core/services/api_service.dart';
import 'package:planio_app/features/chat/domain/models/message.dart';
import 'package:planio_app/features/chat/domain/repositories/message_repository.dart';

/// Implementación de MessageRepository
class MessageRepositoryImpl implements MessageRepository {
  final ApiService apiService;

  MessageRepositoryImpl({required this.apiService});

  @override
  Future<List<Message>> getMessages(
    String roomId, {
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final response = await apiService.get(
        ApiEndpoints.messagesByRoom(roomId),
        queryParameters: {
          'limit': limit,
          'offset': offset,
        },
      );
      
      if (response is List) {
        return response
            .map((item) => Message.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Message> getMessageById(String messageId) async {
    try {
      final response = await apiService.get<Message>(
        '${ApiEndpoints.messages}/$messageId',
        fromJson: (data) => Message.fromJson(data as Map<String, dynamic>),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Message> sendMessage({
    required String roomId,
    required String content,
  }) async {
    try {
      final response = await apiService.post<Message>(
        ApiEndpoints.messages,
        data: {
          'roomId': roomId,
          'content': content,
        },
        fromJson: (data) => Message.fromJson(data as Map<String, dynamic>),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Message> editMessage(String messageId, String newContent) async {
    try {
      final response = await apiService.put<Message>(
        '${ApiEndpoints.messages}/$messageId',
        data: {'content': newContent},
        fromJson: (data) => Message.fromJson(data as Map<String, dynamic>),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> deleteMessage(String messageId) async {
    try {
      await apiService.delete<void>('${ApiEndpoints.messages}/$messageId');
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> reactToMessage(String messageId, String emoji) async {
    try {
      await apiService.post<void>(
        '${ApiEndpoints.messages}/$messageId/reactions',
        data: {'emoji': emoji},
      );
    } catch (e) {
      rethrow;
    }
  }
}
