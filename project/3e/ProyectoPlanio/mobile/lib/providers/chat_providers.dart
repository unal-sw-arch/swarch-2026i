import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:planio_app/features/chat/data/models/chat_models.dart';
import 'package:planio_app/features/chat/data/repositories/chat_repository.dart';
import 'package:planio_app/features/chat/data/repositories/chat_repository_impl.dart';
import 'package:planio_app/providers/core_providers.dart';

// Chat Repository Provider
final chatRepositoryProvider = Provider<ChatRepository>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return ChatRepositoryImpl(apiService);
});

// Messages for a specific room
final chatMessagesProvider =
    FutureProvider.family<List<Message>, String>((ref, roomId) async {
  final repository = ref.watch(chatRepositoryProvider);
  return repository.getMessages(roomId);
});

// Current chat message input
final chatInputProvider = StateProvider<String>((ref) => '');

// Send message provider
final sendMessageProvider =
    FutureProvider.family<Message, ({String roomId, String content})>(
  (ref, params) async {
    final repository = ref.watch(chatRepositoryProvider);
    final message = await repository.sendMessage(params.roomId, params.content);
    // Invalidate the messages list to refresh
    ref.invalidate(chatMessagesProvider(params.roomId));
    return message;
  },
);

// Add reaction provider
final addReactionProvider = FutureProvider.family<
    void,
    ({String roomId, String messageId, String emoji})>(
  (ref, params) async {
    final repository = ref.watch(chatRepositoryProvider);
    await repository.addReaction(params.roomId, params.messageId, params.emoji);
    // Invalidate the messages list to refresh
    ref.invalidate(chatMessagesProvider(params.roomId));
  },
);

/// Loading state for chat operations
final chatLoadingProvider = StateProvider<bool>((ref) {
  return false;
});

/// Error message for chat operations
final chatErrorProvider = StateProvider<String?>((ref) {
  return null;
});

/// WebSocket connection status
final wsConnectedProvider = StateProvider<bool>((ref) {
  return false;
});
