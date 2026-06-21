const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://planio_notification:8002';

const ANALYTICS_SERVICE_URL =
  process.env.ANALYTICS_SERVICE_URL || 'http://analytics_service:8004';

const NOTIFIER_TIMEOUT_MS =
  Number.parseInt(process.env.NOTIFIER_TIMEOUT_MS, 10) || 1000;

async function postJson(url, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), NOTIFIER_TIMEOUT_MS);

  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function notifyRoom(roomId, payload) {
  try {
    await postJson(`${NOTIFICATION_SERVICE_URL}/notify`, {
      roomId: String(roomId),
      ...payload,
    });
  } catch (err) {
    console.error('[notifier] notifyRoom failed:', err.message);
  }
}

async function notifyUser(roomId, targetUserId, payload) {
  try {
    await postJson(`${NOTIFICATION_SERVICE_URL}/notify`, {
      roomId: String(roomId),
      targetUserId: String(targetUserId),
      ...payload,
    });
  } catch (err) {
    console.error('[notifier] notifyUser failed:', err.message);
  }
}

// Nueva función: avisar al analytics_service cuando alguien completa algo
async function notifyAnalytics(userId, userName, roomId, type) {
  try {
    const today = new Date().toISOString().split('T')[0];
    await postJson(`${ANALYTICS_SERVICE_URL}/events`, {
      userId,
      userName,
      roomId,
      type,
      date: today,
    });
  } catch (err) {
    console.error('[notifier] notifyAnalytics failed:', err.message);
  }
}

module.exports = { notifyRoom, notifyUser, notifyAnalytics };
