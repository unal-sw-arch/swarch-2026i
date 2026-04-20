import 'package:planio_app/features/personalization/domain/models/avatar.dart';

/// Repository interface para operaciones de Personalización
abstract class PersonalizationRepository {
  /// Get user's avatars
  Future<List<Avatar>> getUserAvatars();

  /// Get available avatars to purchase
  Future<List<Avatar>> getAvailableAvatars();

  /// Set active avatar
  Future<void> setActiveAvatar(String avatarId);

  /// Get available items to purchase
  Future<List<CollectibleItem>> getAvailableItems();

  /// Get user's owned items
  Future<List<CollectibleItem>> getUserOwnedItems();

  /// Purchase an item with coins
  Future<void> purchaseItem(String itemId);

  /// Get user's coin balance
  Future<int> getUserCoins();

  /// Update user coins
  Future<void> updateCoins(int amount);

  /// Get user collection
  Future<UserCollection> getUserCollection();
}
