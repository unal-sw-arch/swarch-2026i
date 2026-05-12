// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'shop_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

ShopItem _$ShopItemFromJson(Map<String, dynamic> json) => ShopItem(
  id: json['id'] as String,
  name: json['name'] as String,
  description: json['description'] as String?,
  price: (json['price'] as num).toInt(),
  category: json['category'] as String,
  imageUrl: json['imageUrl'] as String?,
  isAvailable: json['isAvailable'] as bool? ?? true,
);

Map<String, dynamic> _$ShopItemToJson(ShopItem instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'description': instance.description,
  'price': instance.price,
  'category': instance.category,
  'imageUrl': instance.imageUrl,
  'isAvailable': instance.isAvailable,
};

UserAvatar _$UserAvatarFromJson(Map<String, dynamic> json) => UserAvatar(
  userId: json['userId'] as String,
  ownedItems:
      (json['ownedItems'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ??
      const [],
  equippedHatId: json['equippedHatId'] as String?,
  equippedAccessoryId: json['equippedAccessoryId'] as String?,
);

Map<String, dynamic> _$UserAvatarToJson(UserAvatar instance) =>
    <String, dynamic>{
      'userId': instance.userId,
      'ownedItems': instance.ownedItems,
      'equippedHatId': instance.equippedHatId,
      'equippedAccessoryId': instance.equippedAccessoryId,
    };

RoomDecoration _$RoomDecorationFromJson(Map<String, dynamic> json) =>
    RoomDecoration(
      roomId: json['roomId'] as String,
      ownedItems:
          (json['ownedItems'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
      placedItems:
          (json['placedItems'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
    );

Map<String, dynamic> _$RoomDecorationToJson(RoomDecoration instance) =>
    <String, dynamic>{
      'roomId': instance.roomId,
      'ownedItems': instance.ownedItems,
      'placedItems': instance.placedItems,
    };
