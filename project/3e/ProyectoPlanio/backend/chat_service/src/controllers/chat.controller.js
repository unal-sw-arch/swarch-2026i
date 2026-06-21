const ChatMessage = require('../models/ChatMessage');
const { notifyRoom } = require('../services/notifier');

const VALID_KEYS = ['love', 'clap', 'fire', 'encourage'];

function toFrontendMessage(doc) {
  const reactionCounts  = { love: 0, clap: 0, fire: 0, encourage: 0 };
  const reactionUserIds = {};

  for (const r of doc.reactions) {
    reactionCounts[r.reactionKey] = (reactionCounts[r.reactionKey] || 0) + 1;
    if (!reactionUserIds[r.reactionKey]) reactionUserIds[r.reactionKey] = [];
    reactionUserIds[r.reactionKey].push(r.senderUid);
  }

  return {
    id:                doc._id.toString(),
    memberId:          doc.senderUid,   // uid string en lugar de db_id
    memberName:        doc.senderName,
    text:              doc.text,
    createdAt:         doc.createdAt,
    reactions:         reactionCounts,
    reaction_user_ids: reactionUserIds,
  };
}

// GET /rooms/:roomId/chat
const getMessages = async (req, res, next) => {
  const roomId = Number(req.params.roomId);
  const limit  = Math.min(Number(req.query.limit) || 50, 100);
  const before = req.query.before || null;

  try {
    const query = { roomId };
    if (before) query._id = { $lt: before };

    const docs = await ChatMessage.find(query).sort({ createdAt: -1 }).limit(limit);
    res.json({ messages: docs.reverse().map(toFrontendMessage) });
  } catch (err) {
    next(err);
  }
};

// POST /rooms/:roomId/chat
const createMessage = async (req, res, next) => {
  const roomId     = Number(req.params.roomId);
  const senderUid  = req.user.uid;
  const senderName = req.user.name;
  const { text }   = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0)
    return res.status(400).json({ error: 'text is required' });
  if (text.trim().length > 2000)
    return res.status(400).json({ error: 'text too long (max 2000 chars)' });

  try {
    const doc     = await ChatMessage.create({ roomId, senderUid, senderName, text: text.trim(), reactions: [] });
    const message = toFrontendMessage(doc);

    await notifyRoom(roomId, { type: 'CHAT_MESSAGE_CREATED', payload: { message } });
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};

// POST /rooms/:roomId/chat/:messageId/reactions
const toggleReaction = async (req, res, next) => {
  const { messageId }    = req.params;
  const roomId           = Number(req.params.roomId);
  const userUid          = req.user.uid;
  const { reaction_key } = req.body;

  if (!VALID_KEYS.includes(reaction_key))
    return res.status(400).json({ error: 'Invalid reaction_key' });

  try {
    const doc = await ChatMessage.findOne({ _id: messageId, roomId });
    if (!doc) return res.status(404).json({ error: 'Message not found' });

    const idx = doc.reactions.findIndex(r => r.senderUid === userUid && r.reactionKey === reaction_key);
    if (idx >= 0) doc.reactions.splice(idx, 1);
    else doc.reactions.push({ senderUid: userUid, reactionKey: reaction_key });

    await doc.save();

    const updated        = toFrontendMessage(doc);
    const count          = updated.reactions[reaction_key];
    const reactorUserIds = updated.reaction_user_ids[reaction_key] || [];

    await notifyRoom(roomId, { type: 'CHAT_MESSAGE_REACTION', payload: { messageId, reactionKey: reaction_key, count, reactorUserIds } });
    res.json({ messageId, reactionKey: reaction_key, count, reactorUserIds });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMessages, createMessage, toggleReaction };