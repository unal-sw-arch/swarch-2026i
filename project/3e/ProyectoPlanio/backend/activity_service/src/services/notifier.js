const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://planio_notification:8002';

const ANALYTICS_SERVICE_URL =
  process.env.ANALYTICS_SERVICE_URL || 'http://analytics_service:8004';

async function notifyRoom(roomId, payload) {
  try {
    await fetch(`${NOTIFICATION_SERVICE_URL}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: String(roomId), ...payload }),
    });
  } catch (err) {
    console.error('[notifier] notifyRoom failed:', err.message);
  }
}

async function notifyUser(roomId, targetUserId, payload) {
  try {
    await fetch(`${NOTIFICATION_SERVICE_URL}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: String(roomId),
        targetUserId: String(targetUserId),
        ...payload,
      }),
    });
  } catch (err) {
    console.error('[notifier] notifyUser failed:', err.message);
  }
}

// Nueva función: avisar al analytics_service cuando alguien completa algo
async function notifyAnalytics(userId, userName, roomId, type) {
  try {
    const today = new Date().toISOString().split('T')[0];
    await fetch(`${ANALYTICS_SERVICE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userName, roomId, type, date: today }),
    });
  } catch (err) {
    console.error('[notifier] notifyAnalytics failed:', err.message);
  }
}

module.exports = { notifyRoom, notifyUser, notifyAnalytics };