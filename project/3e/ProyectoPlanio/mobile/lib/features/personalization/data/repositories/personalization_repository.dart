import 'package:planio_app/features/personalization/data/models/shop_models.dart';

abstract class PersonalizationRepository {
  /// Obtiene los items de avatar disponibles en la tienda
  Future<List<ShopItem>> getAvatarShop({String? category});

  /// Obtiene los items de sala disponibles en la tienda
  Future<List<ShopItem>> getRoomShop({String? category});

  /// Obtiene un item específico
  Future<ShopItem> getShopItem(String itemId);

  /// Obtiene el avatar del usuario actual
  Future<UserAvatar> getUserAvatar(String roomId);

  /// Obtiene las decoraciones de una sala
  Future<RoomDecoration> getRoomDecorations(String roomId);

  /// Compra un item (se usa desde CoinRepository para gastar monedas)
  Future<void> buyItem({
    required String roomId,
    required String itemId,
    required bool isRoomItem,
  });

  /// Equipa un item de avatar
  Future<UserAvatar> equipAvatarItem({
    required String roomId,
    required String avatarItemId,
    required bool isEquipped,
  });
}
