import 'package:json_annotation/json_annotation.dart';

part 'shop_models.g.dart';

/// Modelo de un item en la tienda
@JsonSerializable()
class ShopItem {
  final String id;
  final String name;
  final String? description;
  final int price;
  final String category;
  final String? imageUrl;
  final bool isAvailable;

  ShopItem({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.category,
    this.imageUrl,
    this.isAvailable = true,
  });

  factory ShopItem.fromJson(Map<String, dynamic> json) =>
      _$ShopItemFromJson(json);
  Map<String, dynamic> toJson() => _$ShopItemToJson(this);
}

/// Modelo de avatar del usuario
@JsonSerializable()
class UserAvatar {
  final String userId;
  final List<String> ownedItems;
  final String? equippedHatId;
  final String? equippedAccessoryId;

  UserAvatar({
    required this.userId,
    this.ownedItems = const [],
    this.equippedHatId,
    this.equippedAccessoryId,
  });

  factory UserAvatar.fromJson(Map<String, dynamic> json) =>
      _$UserAvatarFromJson(json);
  Map<String, dynamic> toJson() => _$UserAvatarToJson(this);
}

/// Modelo de decoración de sala
@JsonSerializable()
class RoomDecoration {
  final String roomId;
  final List<String> ownedItems;
  final List<String> placedItems;

  RoomDecoration({
    required this.roomId,
    this.ownedItems = const [],
    this.placedItems = const [],
  });

  factory RoomDecoration.fromJson(Map<String, dynamic> json) =>
      _$RoomDecorationFromJson(json);
  Map<String, dynamic> toJson() => _$RoomDecorationToJson(this);
}
