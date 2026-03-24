const axios = require('axios');
const { Avatar, ShopAvatarItem, PersonalizationLog } = require('../db/connection');

const ACTIVITY_SERVICE_URL = process.env.ACTIVITY_SERVICE_URL || 'http://activity_service:8001';

// Obtener avatar del usuario en una sala específica
// si no existe lo crea con items predeterminados (precio 0)
const getAvatar = async (req, res, next) => {
  const { roomId } = req.params;
  const userId = req.user.db_id;

  try {
    let avatar = await Avatar.findOne({ user_id: userId, room_id: parseInt(roomId) });

    // si no existe el avatar, crearlo con items predeterminados
    if (!avatar) {
      const defaultItems = await ShopAvatarItem.find({ price: 0 });

    // después — solo equipa el primero de cada categoría
      const categorySeen = new Set();
      const items = defaultItems.map((item) => {
      const isFirst = !categorySeen.has(item.category);
      categorySeen.add(item.category);
      return {
          shop_item_id: item._id,
          is_equipped: isFirst,
      };
      });

        avatar = await Avatar.create({
        user_id: userId,
        room_id: parseInt(roomId),
        items,
        });
    }

    // popular los datos del shop para cada item
    const populatedAvatar = await Avatar.findById(avatar._id).populate(
      'items.shop_item_id'
    );

    res.status(200).json(populatedAvatar);
  } catch (err) {
    next(err);
  }
};

// Comprar un item para el avatar
// descuenta coins del usuario llamando al Activity Service
const purchaseAvatarItem = async (req, res, next) => {
  const { roomId } = req.params;
  const { item_id } = req.body;
  const userId = req.user.db_id;

  try {
    // verificar que el item existe en el catálogo
    const shopItem = await ShopAvatarItem.findById(item_id);
    if (!shopItem) {
      return res.status(404).json({ error: 'Item not found in shop' });
    }

    // obtener o crear avatar del usuario
    let avatar = await Avatar.findOne({
      user_id: userId,
      room_id: parseInt(roomId),
    });

    if (!avatar) {
      avatar = await Avatar.create({
        user_id: userId,
        room_id: parseInt(roomId),
        items: [],
      });
    }

    // verificar que el usuario no tiene ya ese item
    const alreadyOwned = avatar.items.some(
      (i) => i.shop_item_id.toString() === item_id
    );

    if (alreadyOwned) {
      return res.status(400).json({ error: 'Item already owned' });
    }

    // si el item tiene precio descontar coins llamando al Activity Service
    if (shopItem.price > 0) {
      try {
        await axios.post(`${ACTIVITY_SERVICE_URL}/coins/spend/user`, {
          userId,
          amount: shopItem.price,
          reason: 'AVATAR_PURCHASE',
          roomId: parseInt(roomId),
        });
      } catch (err) {
        // si no tiene suficientes coins el Activity Service devuelve 400
        if (err.response?.status === 400) {
          return res.status(400).json({ error: 'Insufficient coins' });
        }
        throw err;
      }
    }

    // agregar item al avatar
    avatar.items.push({
      shop_item_id: item_id,
      is_equipped: false,
    });

    await avatar.save();

    // registrar en personalization_logs
    await PersonalizationLog.create({
      room_id: parseInt(roomId),
      actor_id: userId,
      action_type: 'AVATAR_ITEM_PURCHASED',
      description: `User purchased ${shopItem.name} for avatar`,
      metadata: {
        shop_item_id: item_id,
        item_name: shopItem.name,
        price: shopItem.price,
      },
    });

    res.status(201).json({ message: 'Item purchased successfully', avatar });
  } catch (err) {
    next(err);
  }
};

// Equipar o desequipar un item del avatar
// solo puede haber un item equipado por categoría
const toggleEquipItem = async (req, res, next) => {
  const { roomId, itemId } = req.params;
  const { is_equipped } = req.body;
  const userId = req.user.db_id;

  try {
    const avatar = await Avatar.findOne({
      user_id: userId,
      room_id: parseInt(roomId),
    });

    if (!avatar) {
      return res.status(404).json({ error: 'Avatar not found' });
    }

    // verificar que el usuario tiene ese item
    const avatarItem = avatar.items.find(
      (i) => i._id.toString() === itemId
    );

    if (!avatarItem) {
      return res.status(404).json({ error: 'Item not found in avatar' });
    }

    // obtener la categoría del item del catálogo
    const shopItem = await ShopAvatarItem.findById(avatarItem.shop_item_id);

    // si se va a equipar, desequipar el item actual de esa categoría
    if (is_equipped) {
      const itemsOfSameCategory = await ShopAvatarItem.find({
        _id: { $in: avatar.items.map((i) => i.shop_item_id) },
        category: shopItem.category,
      });

      const sameCategoyIds = itemsOfSameCategory.map((i) => i._id.toString());

      // desequipar todos los de la misma categoría
      avatar.items.forEach((i) => {
        if (sameCategoyIds.includes(i.shop_item_id.toString())) {
          i.is_equipped = false;
        }
      });
    }

    // equipar o desequipar el item seleccionado
    avatarItem.is_equipped = is_equipped;

    await avatar.save();

    // registrar en personalization_logs
    await PersonalizationLog.create({
      room_id: parseInt(roomId),
      actor_id: userId,
      action_type: is_equipped ? 'AVATAR_ITEM_EQUIPPED' : 'AVATAR_ITEM_UNEQUIPPED',
      description: `User ${is_equipped ? 'equipped' : 'unequipped'} ${shopItem.name}`,
      metadata: {
        shop_item_id: avatarItem.shop_item_id,
        item_name: shopItem.name,
        category: shopItem.category,
      },
    });

    res.status(200).json({ message: `Item ${is_equipped ? 'equipped' : 'unequipped'} successfully`, avatar });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAvatar,
  purchaseAvatarItem,
  toggleEquipItem,
};