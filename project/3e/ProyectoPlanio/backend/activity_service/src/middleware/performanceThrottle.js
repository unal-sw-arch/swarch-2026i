const DEFAULT_MAX_CONCURRENT = 25;
const DEFAULT_QUEUE_MAX = 50;
const DEFAULT_QUEUE_TIMEOUT_MS = 300;

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const createPerformanceThrottle = ({
  maxConcurrent = DEFAULT_MAX_CONCURRENT,
  queueMax = DEFAULT_QUEUE_MAX,
  queueTimeoutMs = DEFAULT_QUEUE_TIMEOUT_MS,
} = {}) => {
  let activeRequests = 0;
  const waitingRequests = [];

  const rejectBusy = (res) => {
    res.set('Retry-After', '1');
    return res.status(503).json({
      error: 'Server busy',
      message: 'Please retry shortly',
    });
  };

  const runNext = () => {
    if (activeRequests >= maxConcurrent || waitingRequests.length === 0) {
      return;
    }

    const nextRequest = waitingRequests.shift();
    clearTimeout(nextRequest.timer);
    nextRequest.start();
  };

  return (req, res, next) => {
    const start = () => {
      activeRequests += 1;
      let released = false;

      const release = () => {
        if (released) return;
        released = true;
        activeRequests -= 1;
        runNext();
      };

      res.once('finish', release);
      res.once('close', release);
      next();
    };

    if (activeRequests < maxConcurrent) {
      start();
      return;
    }

    if (waitingRequests.length >= queueMax) {
      rejectBusy(res);
      return;
    }

    const entry = { start, timer: null };
    entry.timer = setTimeout(() => {
      const index = waitingRequests.indexOf(entry);
      if (index !== -1) {
        waitingRequests.splice(index, 1);
      }
      rejectBusy(res);
    }, queueTimeoutMs);

    waitingRequests.push(entry);
  };
};

const taskStatusThrottle = createPerformanceThrottle({
  maxConcurrent: toPositiveInteger(
    process.env.TASK_STATUS_MAX_CONCURRENT,
    DEFAULT_MAX_CONCURRENT
  ),
  queueMax: toPositiveInteger(process.env.TASK_STATUS_QUEUE_MAX, DEFAULT_QUEUE_MAX),
  queueTimeoutMs: toPositiveInteger(
    process.env.TASK_STATUS_QUEUE_TIMEOUT_MS,
    DEFAULT_QUEUE_TIMEOUT_MS
  ),
});

module.exports = {
  createPerformanceThrottle,
  taskStatusThrottle,
};
