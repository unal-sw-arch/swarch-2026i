import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:planio_app/features/personalization/data/models/shop_models.dart';
import 'package:planio_app/features/personalization/data/repositories/personalization_repository.dart';
import 'package:planio_app/features/personalization/data/repositories/personalization_repository_impl.dart';
import 'package:planio_app/providers/core_providers.dart';

// Personalization Repository Provider
final personalizationRepositoryProvider =
    Provider<PersonalizationRepository>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return PersonalizationRepositoryImpl(apiService);
});

// Avatar shop provider
final avatarShopProvider =
    FutureProvider.family<List<ShopItem>, String?>((ref, category) async {
  final repository = ref.watch(personalizationRepositoryProvider);
  return repository.getAvatarShop(category: category);
});

// Room shop provider
final roomShopProvider =
    FutureProvider.family<List<ShopItem>, String?>((ref, category) async {
  final repository = ref.watch(personalizationRepositoryProvider);
  return repository.getRoomShop(category: category);
});

// Shop item provider
final shopItemProvider =
    FutureProvider.family<ShopItem, String>((ref, itemId) async {
  final repository = ref.watch(personalizationRepositoryProvider);
  return repository.getShopItem(itemId);
});

// User avatar provider
final userAvatarProvider =
    FutureProvider.family<UserAvatar, String>((ref, roomId) async {
  final repository = ref.watch(personalizationRepositoryProvider);
  return repository.getUserAvatar(roomId);
});

// Room decorations provider
final roomDecorationsProvider =
    FutureProvider.family<RoomDecoration, String>((ref, roomId) async {
  final repository = ref.watch(personalizationRepositoryProvider);
  return repository.getRoomDecorations(roomId);
});

// Buy item provider
final buyItemProvider = FutureProvider.family<
    void,
    ({String roomId, String itemId, bool isRoomItem})>((ref, params) async {
  final repository = ref.watch(personalizationRepositoryProvider);
  await repository.buyItem(
    roomId: params.roomId,
    itemId: params.itemId,
    isRoomItem: params.isRoomItem,
  );
  ref.invalidate(userAvatarProvider(params.roomId));
  ref.invalidate(roomDecorationsProvider(params.roomId));
});

// Equip avatar item provider
final equipAvatarItemProvider = FutureProvider.family<
    UserAvatar,
    ({String roomId, String avatarItemId, bool isEquipped})>(
  (ref, params) async {
    final repository = ref.watch(personalizationRepositoryProvider);
    final avatar = await repository.equipAvatarItem(
      roomId: params.roomId,
      avatarItemId: params.avatarItemId,
      isEquipped: params.isEquipped,
    );
    ref.invalidate(userAvatarProvider(params.roomId));
    return avatar;
  },
);

// Active category filter for shops
final avatarCategoryFilterProvider = StateProvider<String?>((ref) => null);
final roomCategoryFilterProvider = StateProvider<String?>((ref) => null);

/// Loading state for personalization operations
final personalizationLoadingProvider = StateProvider<bool>((ref) {
  return false;
});

/// Error message for personalization operations
final personalizationErrorProvider = StateProvider<String?>((ref) {
  return null;
});
