const mongoose = require('mongoose');

// conexión a MongoDB usando mongoose
// mongoose maneja el pool de conexiones automáticamente
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// modelos — cada colección tiene su esquema
// shop_avatar_items
const shopAvatarItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  preview_emoji: String,
  preview_color: String,
});

// shop_room_items
const shopRoomItemSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  preview_emoji: String,
  preview_color: String,
});

// avatars
const avatarSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  room_id: { type: Number, required: true },
  items: [
    {
      shop_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopAvatarItem' },
      is_equipped: { type: Boolean, default: false },
      purchased_at: { type: Date, default: Date.now },
    },
  ],
});

// rooms (sala virtual)
const roomSchema = new mongoose.Schema({
  room_id: { type: Number, required: true, unique: true },
  items: [
    {
      shop_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopRoomItem' },
      is_placed: { type: Boolean, default: false },
      position_x: { type: Number, default: 0 },
      position_y: { type: Number, default: 0 },
      purchased_by: Number,
    },
  ],
});

// personalization_logs
const personalizationLogSchema = new mongoose.Schema({
  room_id: Number,
  actor_id: Number,
  action_type: String,
  description: String,
  metadata: mongoose.Schema.Types.Mixed,
  created_at: { type: Date, default: Date.now },
});

// exportar modelos y conexión
const ShopAvatarItem = mongoose.model('ShopAvatarItem', shopAvatarItemSchema, 'shop_avatar_items');
const ShopRoomItem = mongoose.model('ShopRoomItem', shopRoomItemSchema, 'shop_room_items');
const Avatar = mongoose.model('Avatar', avatarSchema, 'avatars');
const Room = mongoose.model('Room', roomSchema, 'rooms');
const PersonalizationLog = mongoose.model('PersonalizationLog', personalizationLogSchema, 'personalization_logs');

module.exports = {
  connectDB,
  ShopAvatarItem,
  ShopRoomItem,
  Avatar,
  Room,
  PersonalizationLog,
};