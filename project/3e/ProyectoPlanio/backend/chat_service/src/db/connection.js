const mongoose = require('mongoose');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/chat_db';

mongoose.connect(MONGO_URL)
  .then(() => console.log('[Chat Service] Connected to MongoDB (chat_db)'))
  .catch((err) => {
    console.error('[Chat Service] MongoDB connection error:', err.message);
    process.exit(1);
  });

module.exports = mongoose;