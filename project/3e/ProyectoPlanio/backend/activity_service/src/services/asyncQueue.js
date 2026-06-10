const DEFAULT_WORKERS = 5;
const DEFAULT_QUEUE_MAX = 100;

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const maxWorkers = toPositiveInteger(process.env.ASYNC_WORKERS, DEFAULT_WORKERS);
const maxQueueSize = toPositiveInteger(process.env.ASYNC_QUEUE_MAX, DEFAULT_QUEUE_MAX);

const queue = [];
let activeWorkers = 0;

const runNext = () => {
  while (activeWorkers < maxWorkers && queue.length > 0) {
    const { task, label } = queue.shift();
    activeWorkers += 1;

    Promise.resolve()
      .then(task)
      .catch((err) => {
        console.error(`[asyncQueue] ${label} failed:`, err.message);
      })
      .finally(() => {
        activeWorkers -= 1;
        runNext();
      });
  }
};

const enqueue = (task, label = 'async-task') => {
  if (typeof task !== 'function') {
    throw new TypeError('asyncQueue task must be a function');
  }

  if (queue.length >= maxQueueSize) {
    console.warn(`[asyncQueue] Dropped ${label}: queue is full`);
    return false;
  }

  queue.push({ task, label });
  runNext();
  return true;
};

const getQueueStats = () => ({
  activeWorkers,
  queued: queue.length,
  maxWorkers,
  maxQueueSize,
});

module.exports = {
  enqueue,
  getQueueStats,
};
