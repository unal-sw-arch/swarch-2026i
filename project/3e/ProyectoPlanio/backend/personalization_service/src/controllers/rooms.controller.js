const axios = require('axios');
const { Room, ShopRoomItem, PersonalizationLog } = require('../db/connection');

const ACTIVITY_SERVICE_URL = process.env.ACTIVITY_SERVICE_URL || 'http://activity_service:8001';

// Obtener estado actual de la sala virtual
// si no existe la crea vacía
const getRoom = async (req, res, next) => {
  const { roomId } = req.params;

  try {
    let room = await Room.findOne({ room_id: parseInt(roomId) });

    // si no existe la sala virtual, crearla vacía
    if (!room) {
      room = await Room.create({
        room_id: parseInt(roomId),
        items: [],
      });
    }

    // popular los datos del shop para cada item
    const populatedRoom = await Room.findById(room._id).populate(
      'items.shop_item_id'
    );

    res.status(200).json(populatedRoom);
  } catch (err) {
    next(err);
  }
};

// Comprar un item para la sala virtual
// descuenta coins de la sala llamando al Activity Service
const purchaseRoomItem = async (req, res, next) => {
  const { roomId } = req.params;
  const { item_id } = req.body;
  const userId = req.user.db_id;

  try {
    // verificar que el item existe en el catálogo
    const shopItem = await ShopRoomItem.findById(item_id);
    if (!shopItem) {
      return res.status(404).json({ error: 'Item not found in shop' });
    }

    // obtener o crear sala virtual
    let room = await Room.findOne({ room_id: parseInt(roomId) });
    if (!room) {
      room = await Room.create({
        room_id: parseInt(roomId),
        items: [],
      });
    }

    // verificar que la sala no tiene ya ese item
    const alreadyOwned = room.items.some(
      (i) => i.shop_item_id.toString() === item_id
    );

    if (alreadyOwned) {
      return res.status(400).json({ error: 'Item already owned by this room' });
    }

    // si el item tiene precio descontar coins de la sala
    if (shopItem.price > 0) {
      try {
        await axios.post(`${ACTIVITY_SERVICE_URL}/coins/spend/room`, {
          roomId: parseInt(roomId),
          amount: shopItem.price,
          reason: 'ROOM_PURCHASE',
          sourceUserId: userId,
        });
      } catch (err) {
        if (err.response?.status === 400) {
          return res.status(400).json({ error: 'Insufficient room coins' });
        }
        throw err;
      }
    }

    // agregar item a la sala sin colocar
    room.items.push({
      shop_item_id: item_id,
      is_placed: false,
      position_x: 0,
      position_y: 0,
      purchased_by: userId,
    });

    await room.save();

    // registrar en personalization_logs
    await PersonalizationLog.create({
      room_id: parseInt(roomId),
      actor_id: userId,
      action_type: 'ROOM_ITEM_PURCHASED',
      description: `Room purchased ${shopItem.name}`,
      metadata: {
        shop_item_id: item_id,
        item_name: shopItem.name,
        price: shopItem.price,
      },
    });

    res.status(201).json({ message: 'Item purchased successfully', room });
  } catch (err) {
    next(err);
  }
};

// Colocar o mover un item en la sala virtual
// actualiza is_placed y la posición x, y
const placeOrMoveItem = async (req, res, next) => {
  const { roomId, itemId } = req.params;
  const { is_placed, position_x, position_y } = req.body;
  const userId = req.user.db_id;

  try {
    const room = await Room.findOne({ room_id: parseInt(roomId) });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // buscar el item dentro de la sala
    const roomItem = room.items.find(
      (i) => i._id.toString() === itemId
    );

    if (!roomItem) {
      return res.status(404).json({ error: 'Item not found in room' });
    }

    const oldPosition = {
      position_x: roomItem.position_x,
      position_y: roomItem.position_y,
    };

    // actualizar posición e is_placed
    roomItem.is_placed = is_placed !== undefined ? is_placed : roomItem.is_placed;
    roomItem.position_x = position_x !== undefined ? position_x : roomItem.position_x;
    roomItem.position_y = position_y !== undefined ? position_y : roomItem.position_y;

    await room.save();

    // obtener nombre del item para el log
    const shopItem = await ShopRoomItem.findById(roomItem.shop_item_id);

    // registrar en personalization_logs
    const isMoving = oldPosition.position_x !== position_x || oldPosition.position_y !== position_y;

    await PersonalizationLog.create({
      room_id: parseInt(roomId),
      actor_id: userId,
      action_type: isMoving ? 'ROOM_ITEM_MOVED' : 'ROOM_ITEM_PLACED',
      description: isMoving
        ? `${shopItem?.name} was moved in the room`
        : `${shopItem?.name} was placed in the room`,
      metadata: isMoving
        ? {
            shop_item_id: roomItem.shop_item_id,
            item_name: shopItem?.name,
            old_position_x: oldPosition.position_x,
            old_position_y: oldPosition.position_y,
            new_position_x: position_x,
            new_position_y: position_y,
          }
        : {
            shop_item_id: roomItem.shop_item_id,
            item_name: shopItem?.name,
            position_x,
            position_y,
          },
    });

    res.status(200).json({ message: 'Item updated successfully', room });
  } catch (err) {
    next(err);
  }
};

// Eliminar un item de la sala virtual
const removeRoomItem = async (req, res, next) => {
  const { roomId, itemId } = req.params;
  const userId = req.user.db_id;

  try {
    const room = await Room.findOne({ room_id: parseInt(roomId) });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // buscar el item
    const roomItem = room.items.find(
      (i) => i._id.toString() === itemId
    );

    if (!roomItem) {
      return res.status(404).json({ error: 'Item not found in room' });
    }

    const shopItem = await ShopRoomItem.findById(roomItem.shop_item_id);

    // eliminar el item del array
    room.items = room.items.filter(
      (i) => i._id.toString() !== itemId
    );

    await room.save();

    // registrar en personalization_logs
    await PersonalizationLog.create({
      room_id: parseInt(roomId),
      actor_id: userId,
      action_type: 'ROOM_ITEM_REMOVED',
      description: `${shopItem?.name} was removed from the room`,
      metadata: {
        shop_item_id: roomItem.shop_item_id,
        item_name: shopItem?.name,
      },
    });

    res.status(200).json({ message: 'Item removed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRoom,
  purchaseRoomItem,
  placeOrMoveItem,
  removeRoomItem,
};