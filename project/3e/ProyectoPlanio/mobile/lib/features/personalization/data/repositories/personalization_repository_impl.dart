import 'package:dio/dio.dart';
import 'package:planio_app/core/services/api_client.dart';
import 'package:planio_app/core/services/api_service.dart';
import 'package:planio_app/features/personalization/data/models/shop_models.dart';
import 'package:planio_app/features/personalization/data/repositories/personalization_repository.dart';

class PersonalizationRepositoryImpl implements PersonalizationRepository {
  final ApiService _apiService;
  static final List<ShopItem> _demoAvatarShop = [
    ShopItem(id: 'av-1', name: 'Happy', price: 0, category: 'expression', imageUrl: '😊'),
    ShopItem(id: 'av-2', name: 'Cap', price: 50, category: 'hat', imageUrl: '🧢'),
    ShopItem(id: 'av-3', name: 'Crown', price: 120, category: 'hat', imageUrl: '👑'),
  ];
  static final List<ShopItem> _demoRoomShop = [
    ShopItem(id: 'room-1', name: 'Blue Sofa', price: 100, category: 'furniture', imageUrl: '🛋️'),
    ShopItem(id: 'room-2', name: 'Plant', price: 40, category: 'decoration', imageUrl: '🪴'),
    ShopItem(id: 'room-3', name: 'Lamp', price: 60, category: 'decoration', imageUrl: '💡'),
  ];
  static final Map<String, UserAvatar> _demoAvatarState = {};
  static final Map<String, RoomDecoration> _demoRoomState = {};

  PersonalizationRepositoryImpl(this._apiService);

  @override
  Future<List<ShopItem>> getAvatarShop({String? category}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (category != null) {
        queryParams['category'] = category;
      }

      final response = await _apiService.dio.get(
        ApiClient.buildUrl(
          '${ApiClient.personalizationEndpoint}/shop/avatar',
          queryParams: queryParams.isEmpty ? null : queryParams,
        ),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List<dynamic>;
        return data
            .map((i) => _mapShopItem(i as Map<String, dynamic>))
            .toList();
      }
      throw Exception('Failed to fetch avatar shop');
    } on DioException {
      final filtered = category == null
          ? _demoAvatarShop
          : _demoAvatarShop.where((item) => item.category == category).toList();
      return List<ShopItem>.from(filtered);
    }
  }

  @override
  Future<List<ShopItem>> getRoomShop({String? category}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (category != null) {
        queryParams['category'] = category;
      }

      final response = await _apiService.dio.get(
        ApiClient.buildUrl(
          '${ApiClient.personalizationEndpoint}/shop/room',
          queryParams: queryParams.isEmpty ? null : queryParams,
        ),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data as List<dynamic>;
        return data
            .map((i) => _mapShopItem(i as Map<String, dynamic>))
            .toList();
      }
      throw Exception('Failed to fetch room shop');
    } on DioException {
      final filtered = category == null
          ? _demoRoomShop
          : _demoRoomShop.where((item) => item.category == category).toList();
      return List<ShopItem>.from(filtered);
    }
  }

  @override
  Future<ShopItem> getShopItem(String itemId) async {
    try {
      final avatarResponse = await _apiService.dio.get(
        ApiClient.buildUrl('${ApiClient.personalizationEndpoint}/shop/avatar/$itemId'),
      );

      if (avatarResponse.statusCode == 200) {
        return _mapShopItem(avatarResponse.data as Map<String, dynamic>);
      }

      throw Exception('Item not found');
    } on DioException catch (e) {
      if (e.response?.statusCode != 404) {
        final merged = [..._demoAvatarShop, ..._demoRoomShop];
        final item = merged.firstWhere(
          (shopItem) => shopItem.id == itemId,
          orElse: () => merged.first,
        );
        return item;
      }

      try {
        final roomResponse = await _apiService.dio.get(
          ApiClient.buildUrl('${ApiClient.personalizationEndpoint}/shop/room/$itemId'),
        );

        if (roomResponse.statusCode == 200) {
          return _mapShopItem(roomResponse.data as Map<String, dynamic>);
        }
      } on DioException catch (roomError) {
        throw Exception('Failed to fetch shop item: ${roomError.message}');
      }

      throw Exception('Failed to fetch shop item');
    }
  }

  @override
  Future<UserAvatar> getUserAvatar(String roomId) async {
    try {
      final response = await _apiService.dio.get(
        ApiClient.buildUrl('${ApiClient.personalizationEndpoint}/avatars/$roomId'),
      );

      if (response.statusCode == 200) {
        return _mapUserAvatar(response.data as Map<String, dynamic>);
      }
      throw Exception('Failed to fetch user avatar');
    } on DioException {
      return _demoAvatarState.putIfAbsent(
        roomId,
        () => UserAvatar(
          userId: '1',
          ownedItems: const ['av-1'],
          equippedHatId: 'av-1',
        ),
      );
    }
  }

  @override
  Future<RoomDecoration> getRoomDecorations(String roomId) async {
    try {
      final response = await _apiService.dio.get(
        ApiClient.buildUrl('${ApiClient.personalizationEndpoint}/rooms/$roomId'),
      );

      if (response.statusCode == 200) {
        return _mapRoomDecoration(response.data as Map<String, dynamic>);
      }
      throw Exception('Failed to fetch room decorations');
    } on DioException {
      return _demoRoomState.putIfAbsent(
        roomId,
        () => RoomDecoration(
          roomId: roomId,
          ownedItems: ['room-2'],
          placedItems: ['room-2'],
        ),
      );
    }
  }

  @override
  Future<void> buyItem({
    required String roomId,
    required String itemId,
    required bool isRoomItem,
  }) async {
    try {
      final endpoint = isRoomItem
          ? '${ApiClient.personalizationEndpoint}/rooms/$roomId/items'
          : '${ApiClient.personalizationEndpoint}/avatars/$roomId/items';

      final response = await _apiService.dio.post(
        ApiClient.buildUrl(endpoint),
        data: {'item_id': itemId},
      );

      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception('Failed to buy item');
      }
    } on DioException {
      if (isRoomItem) {
        final room = _demoRoomState.putIfAbsent(
          roomId,
          () => RoomDecoration(roomId: roomId),
        );
        final owned = List<String>.from(room.ownedItems);
        if (!owned.contains(itemId)) {
          owned.add(itemId);
        }
        _demoRoomState[roomId] = RoomDecoration(
          roomId: roomId,
          ownedItems: owned,
          placedItems: room.placedItems,
        );
      } else {
        final avatar = _demoAvatarState.putIfAbsent(
          roomId,
          () => UserAvatar(userId: '1'),
        );
        final owned = List<String>.from(avatar.ownedItems);
        if (!owned.contains(itemId)) {
          owned.add(itemId);
        }
        _demoAvatarState[roomId] = UserAvatar(
          userId: avatar.userId,
          ownedItems: owned,
          equippedHatId: avatar.equippedHatId,
          equippedAccessoryId: avatar.equippedAccessoryId,
        );
      }
    }
  }

  @override
  Future<UserAvatar> equipAvatarItem({
    required String roomId,
    required String avatarItemId,
    required bool isEquipped,
  }) async {
    try {
      final response = await _apiService.dio.patch(
        ApiClient.buildUrl(
          '${ApiClient.personalizationEndpoint}/avatars/$roomId/items/$avatarItemId',
        ),
        data: {'is_equipped': isEquipped},
      );

      if (response.statusCode == 200) {
        final avatarData = response.data['avatar'] as Map<String, dynamic>;
        return _mapUserAvatar(avatarData);
      }
      throw Exception('Failed to equip avatar item');
    } on DioException {
      final avatar = _demoAvatarState.putIfAbsent(
        roomId,
        () => UserAvatar(userId: '1'),
      );
      return UserAvatar(
        userId: avatar.userId,
        ownedItems: avatar.ownedItems,
        equippedHatId: isEquipped ? avatarItemId : null,
        equippedAccessoryId: avatar.equippedAccessoryId,
      );
    }
  }

  ShopItem _mapShopItem(Map<String, dynamic> data) {
    final id = data['_id'] ?? data['id'];
    final previewEmoji = data['preview_emoji'];
    final previewColor = data['preview_color'];
    final description = previewEmoji != null
        ? 'Vista previa: $previewEmoji'
        : (previewColor != null ? 'Color: $previewColor' : null);

    return ShopItem(
      id: '$id',
      name: '${data['name'] ?? 'Item'}',
      description: description,
      price: (data['price'] as num?)?.toInt() ?? 0,
      category: '${data['category'] ?? 'general'}',
      imageUrl: previewEmoji?.toString() ?? previewColor?.toString(),
      isAvailable: true,
    );
  }

  UserAvatar _mapUserAvatar(Map<String, dynamic> data) {
    final items = data['items'] as List<dynamic>? ?? [];
    final owned = <String>[];
    String? equipped1;
    String? equipped2;

    for (final rawItem in items) {
      final item = rawItem as Map<String, dynamic>;
      final shopItem = item['shop_item_id'];
      final shopItemId = shopItem is Map<String, dynamic>
          ? '${shopItem['_id']}'
          : '${item['shop_item_id']}';
      owned.add(shopItemId);

      if (item['is_equipped'] == true) {
        if (equipped1 == null) {
          equipped1 = '${item['_id']}';
        } else {
          equipped2 = '${item['_id']}';
        }
      }
    }

    return UserAvatar(
      userId: '${data['user_id'] ?? ''}',
      ownedItems: owned,
      equippedHatId: equipped1,
      equippedAccessoryId: equipped2,
    );
  }

  RoomDecoration _mapRoomDecoration(Map<String, dynamic> data) {
    final items = data['items'] as List<dynamic>? ?? [];
    final owned = <String>[];
    final placed = <String>[];

    for (final rawItem in items) {
      final item = rawItem as Map<String, dynamic>;
      final shopItem = item['shop_item_id'];
      final shopItemId = shopItem is Map<String, dynamic>
          ? '${shopItem['_id']}'
          : '${item['shop_item_id']}';
      owned.add(shopItemId);
      if (item['is_placed'] == true) {
        placed.add('${item['_id']}');
      }
    }

    return RoomDecoration(
      roomId: '${data['room_id'] ?? ''}',
      ownedItems: owned,
      placedItems: placed,
    );
  }
}
