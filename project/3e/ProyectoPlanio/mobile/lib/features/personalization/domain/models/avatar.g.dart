// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'avatar.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AvatarImpl _$$AvatarImplFromJson(Map<String, dynamic> json) => _$AvatarImpl(
  id: json['id'] as String,
  userId: json['userId'] as String,
  name: json['name'] as String,
  imageUrl: json['imageUrl'] as String,
  isActive: json['isActive'] as bool,
  createdAt: DateTime.parse(json['createdAt'] as String),
  coinsCost: (json['coinsCost'] as num?)?.toInt(),
);

Map<String, dynamic> _$$AvatarImplToJson(_$AvatarImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'name': instance.name,
      'imageUrl': instance.imageUrl,
      'isActive': instance.isActive,
      'createdAt': instance.createdAt.toIso8601String(),
      'coinsCost': instance.coinsCost,
    };

_$CollectibleItemImpl _$$CollectibleItemImplFromJson(
  Map<String, dynamic> json,
) => _$CollectibleItemImpl(
  id: json['id'] as String,
  name: json['name'] as String,
  description: json['description'] as String,
  imageUrl: json['imageUrl'] as String,
  coinsCost: (json['coinsCost'] as num).toInt(),
  isOwned: json['isOwned'] as bool,
  createdAt: DateTime.parse(json['createdAt'] as String),
  category: json['category'] as String?,
);

Map<String, dynamic> _$$CollectibleItemImplToJson(
  _$CollectibleItemImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'description': instance.description,
  'imageUrl': instance.imageUrl,
  'coinsCost': instance.coinsCost,
  'isOwned': instance.isOwned,
  'createdAt': instance.createdAt.toIso8601String(),
  'category': instance.category,
};

_$UserCollectionImpl _$$UserCollectionImplFromJson(Map<String, dynamic> json) =>
    _$UserCollectionImpl(
      userId: json['userId'] as String,
      totalCoins: (json['totalCoins'] as num).toInt(),
      activeAvatarId: json['activeAvatarId'] as String,
      ownedAvatarIds: (json['ownedAvatarIds'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      ownedItemIds: (json['ownedItemIds'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$UserCollectionImplToJson(
  _$UserCollectionImpl instance,
) => <String, dynamic>{
  'userId': instance.userId,
  'totalCoins': instance.totalCoins,
  'activeAvatarId': instance.activeAvatarId,
  'ownedAvatarIds': instance.ownedAvatarIds,
  'ownedItemIds': instance.ownedItemIds,
  'updatedAt': instance.updatedAt.toIso8601String(),
};
