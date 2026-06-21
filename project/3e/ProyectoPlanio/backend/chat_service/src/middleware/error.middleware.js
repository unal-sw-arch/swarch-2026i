const errorMiddleware = (err, req, res, next) => {
  console.error('[Chat Service] Error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
};

module.exports = errorMiddleware;