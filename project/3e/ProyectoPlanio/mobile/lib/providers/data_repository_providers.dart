import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:planio_app/features/activity/data/repositories/activity_feed_repository_impl.dart';
import 'package:planio_app/features/activity/domain/repositories/activity_feed_repository.dart';
import 'package:planio_app/features/chat/data/repositories/message_repository_impl.dart';
import 'package:planio_app/features/chat/domain/repositories/message_repository.dart';
import 'package:planio_app/features/personalization/data/repositories/personalization_repository_impl.dart';
import 'package:planio_app/features/personalization/data/repositories/personalization_repository.dart';
import 'package:planio_app/providers/core_providers.dart';

/// ActivityFeed Repository Provider
final activityFeedRepositoryProvider =
    Provider<ActivityFeedRepository>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return ActivityFeedRepositoryImpl(apiService: apiService);
});

/// Chat Message Repository Provider
final messageRepositoryProvider = Provider<MessageRepository>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return MessageRepositoryImpl(apiService: apiService);
});

/// Personalization Repository Provider
final personalizationRepositoryProvider =
    Provider<PersonalizationRepository>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return PersonalizationRepositoryImpl(apiService);
});

/// Activity Feed Data Provider
final activityFeedProvider = FutureProvider.family<List<dynamic>, String>(
  (ref, roomId) async {
    final repository = ref.watch(activityFeedRepositoryProvider);
    return repository.getActivityFeed(roomId);
  },
);

/// User Activity Feed Provider
final userActivityFeedProvider = FutureProvider<List<dynamic>>((ref) async {
  final repository = ref.watch(activityFeedRepositoryProvider);
  return repository.getUserActivityFeed();
});

/// Chat Messages Provider
final chatMessagesProvider = FutureProvider.family<List<dynamic>, String>(
  (ref, roomId) async {
    final repository = ref.watch(messageRepositoryProvider);
    return repository.getMessages(roomId);
  },
);

/// Available Avatars Provider
final availableAvatarsProvider = FutureProvider<List<dynamic>>((ref) async {
  final repository = ref.watch(personalizationRepositoryProvider);
  return repository.getAvatarShop();
});

/// User Avatars Provider
final userAvatarsProvider = FutureProvider<List<dynamic>>((ref) async {
  return [];
});

/// Available Items Provider
final availableItemsProvider = FutureProvider<List<dynamic>>((ref) async {
  final repository = ref.watch(personalizationRepositoryProvider);
  return repository.getRoomShop();
});

/// User Owned Items Provider
final userOwnedItemsProvider = FutureProvider<List<dynamic>>((ref) async {
  return [];
});

/// User Coins Provider
final userCoinsProvider = FutureProvider<int>((ref) async {
  return 0;
});
