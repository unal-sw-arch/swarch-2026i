const { ShopAvatarItem, ShopRoomItem } = require('../db/connection');

// Obtener catálogo completo de items para avatar
// opcionalmente filtrar por categoría con ?category=hat
const getAvatarShop = async (req, res, next) => {
  const { category } = req.query;

  try {
    const filter = category ? { category } : {};
    const items = await ShopAvatarItem.find(filter).sort({ category: 1, price: 1 });
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
};

// Obtener catálogo completo de items para sala
// opcionalmente filtrar por categoría con ?category=furniture
const getRoomShop = async (req, res, next) => {
  const { category } = req.query;

  try {
    const filter = category ? { category } : {};
    const items = await ShopRoomItem.find(filter).sort({ category: 1, price: 1 });
    res.status(200).json(items);
  } catch (err) {
    next(err);
  }
};

// Obtener un item específico del catálogo de avatar por id
const getAvatarItemById = async (req, res, next) => {
  const { itemId } = req.params;

  try {
    const item = await ShopAvatarItem.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json(item);
  } catch (err) {
    next(err);
  }
};

// Obtener un item específico del catálogo de sala por id
const getRoomItemById = async (req, res, next) => {
  const { itemId } = req.params;

  try {
    const item = await ShopRoomItem.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json(item);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAvatarShop,
  getRoomShop,
  getAvatarItemById,
  getRoomItemById,
};