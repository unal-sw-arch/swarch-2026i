db = db.getSiblingDB('personalization_db');

db.createCollection('shop_avatar_items');
db.createCollection('shop_room_items');
db.createCollection('avatars');
db.createCollection('rooms');
db.createCollection('personalization_logs');

db.shop_avatar_items.createIndex({ category: 1 });
db.shop_room_items.createIndex({ category: 1 });
db.avatars.createIndex({ user_id: 1, room_id: 1 }, { unique: true });
db.rooms.createIndex({ room_id: 1 }, { unique: true });
db.personalization_logs.createIndex({ room_id: 1, created_at: -1 });

db.shop_avatar_items.insertMany([
  // face_color
  { name: "Purple", category: "face_color", price: 0, preview_color: "#7B61FF" },
  { name: "Blue", category: "face_color", price: 0, preview_color: "#3B8BD4" },
  { name: "Green", category: "face_color", price: 0, preview_color: "#4CAF50" },
  { name: "Pink", category: "face_color", price: 20, preview_color: "#FF6B9D" },
  { name: "Orange", category: "face_color", price: 20, preview_color: "#FF8C42" },
  { name: "Red", category: "face_color", price: 20, preview_color: "#E53935" },
  { name: "Yellow", category: "face_color", price: 30, preview_color: "#FDD835" },
  { name: "Teal", category: "face_color", price: 30, preview_color: "#26A69A" },
  { name: "Indigo", category: "face_color", price: 30, preview_color: "#3949AB" },

  // expression
  { name: "Happy", category: "expression", price: 0, preview_emoji: "😊" },
  { name: "Cool", category: "expression", price: 30, preview_emoji: "😎" },
  { name: "Love", category: "expression", price: 40, preview_emoji: "😍" },
  { name: "StarEyes", category: "expression", price: 50, preview_emoji: "🤩" },
  { name: "Laughing", category: "expression", price: 40, preview_emoji: "😂" },
  { name: "Wink", category: "expression", price: 35, preview_emoji: "😉" },

  // hat
  { name: "Cap", category: "hat", price: 50, preview_emoji: "🧢" },
  { name: "TopHat", category: "hat", price: 80, preview_emoji: "🎩" },
  { name: "Crown", category: "hat", price: 150, preview_emoji: "👑" },
  { name: "PartyHat", category: "hat", price: 60, preview_emoji: "🎉" },
  { name: "WizardHat", category: "hat", price: 100, preview_emoji: "🧙" },

  // glasses
  { name: "Glasses", category: "glasses", price: 40, preview_emoji: "👓" },
  { name: "Sunglasses", category: "glasses", price: 60, preview_emoji: "🕶️" },
  { name: "Monocle", category: "glasses", price: 80, preview_emoji: "🧐" },
]);

db.shop_room_items.insertMany([
  // wall
  { name: "White", category: "wall", price: 0, preview_color: "#FFFFFF" },
  { name: "Beige", category: "wall", price: 0, preview_color: "#FEFAE0" },
  { name: "Sky Blue", category: "wall", price: 30, preview_color: "#DBEAFE" },
  { name: "Mint Green", category: "wall", price: 30, preview_color: "#DCFCE7" },
  { name: "Rose Pink", category: "wall", price: 40, preview_color: "#FFE4E6" },
  { name: "Lavender", category: "wall", price: 40, preview_color: "#F3E8FF" },

  // floor
  { name: "Wood", category: "floor", price: 0, preview_color: "#F9E47C" },
  { name: "Dark Wood", category: "floor", price: 50, preview_color: "#C68642" },
  { name: "White Tile", category: "floor", price: 50, preview_color: "#F5F5F5" },
  { name: "Carpet", category: "floor", price: 60, preview_color: "#A07070" },

  // furniture
  { name: "Blue Sofa", category: "furniture", price: 100, preview_emoji: "🛋️" },
  { name: "Red Chair", category: "furniture", price: 100, preview_emoji: "🪑" },
  { name: "Bookshelf", category: "furniture", price: 120, preview_emoji: "📚" },
  { name: "Coffee Table", category: "furniture", price: 80, preview_emoji: "🪵" },

  // decoration
  { name: "Lamp", category: "decoration", price: 60, preview_emoji: "💡" },
  { name: "Plant", category: "decoration", price: 40, preview_emoji: "🪴" },
  { name: "Rug", category: "decoration", price: 70, preview_emoji: "🟫" },
  { name: "PictureFrame", category: "decoration", price: 50, preview_emoji: "🖼️" },
  { name: "WallClock", category: "decoration", price: 45, preview_emoji: "🕐" },
  { name: "Guitar", category: "decoration", price: 150, preview_emoji: "🎸" },

  // electronics
  { name: "TV", category: "electronics", price: 200, preview_emoji: "📺" },
  { name: "Speaker", category: "electronics", price: 90, preview_emoji: "🔊" },
]);

print('Personalization DB initialized successfully');