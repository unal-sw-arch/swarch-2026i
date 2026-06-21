const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  senderUid:   { type: String, required: true },
  reactionKey: { type: String, enum: ['love', 'clap', 'fire', 'encourage'], required: true },
}, { _id: false });

const chatMessageSchema = new mongoose.Schema({
  roomId:     { type: Number, required: true, index: true },
  senderUid:  { type: String, required: true },
  senderName: { type: String, required: true },
  text:       { type: String, required: true, maxlength: 2000 },
  reactions:  { type: [reactionSchema], default: [] },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false },
});

chatMessageSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);