import 'package:freezed_annotation/freezed_annotation.dart';

part 'avatar.freezed.dart';
part 'avatar.g.dart';

/// Avatar model
@freezed
class Avatar with _$Avatar {
  const factory Avatar({
    required String id,
    required String userId,
    required String name,
    required String imageUrl,
    required bool isActive,
    required DateTime createdAt,
    int? coinsCost, // costo para desbloquear
  }) = _Avatar;

  factory Avatar.fromJson(Map<String, dynamic> json) => _$AvatarFromJson(json);
}

/// Collectible item model (cosmetic items for room decoration, etc.)
@freezed
class CollectibleItem with _$CollectibleItem {
  const factory CollectibleItem({
    required String id,
    required String name,
    required String description,
    required String imageUrl,
    required int coinsCost,
    required bool isOwned,
    required DateTime createdAt,
    String? category, // 'decoration', 'room', 'avatar', etc.
  }) = _CollectibleItem;

  factory CollectibleItem.fromJson(Map<String, dynamic> json) =>
      _$CollectibleItemFromJson(json);
}

/// User collection (avatars and items owned by user)
@freezed
class UserCollection with _$UserCollection {
  const factory UserCollection({
    required String userId,
    required int totalCoins,
    required String activeAvatarId,
    required List<String> ownedAvatarIds,
    required List<String> ownedItemIds,
    required DateTime updatedAt,
  }) = _UserCollection;

  factory UserCollection.fromJson(Map<String, dynamic> json) =>
      _$UserCollectionFromJson(json);
}
