const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://planio_notification:8002';

async function notifyRoom(roomId, payload) {
  try {
    await fetch(`${NOTIFICATION_SERVICE_URL}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: String(roomId), ...payload }),
    });
  } catch (err) {
    console.error('[Chat Service] notifyRoom failed:', err.message);
  }
}

module.exports = { notifyRoom };