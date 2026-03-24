// Middleware global de manejo de errores
const errorMiddleware = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);

  // error de mongoose — documento duplicado
  if (err.code === 11000) {
    return res.status(400).json({
      error: 'Duplicate entry',
      detail: err.message,
    });
  }

  // error de validación de mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      detail: err.message,
    });
  }

  // error genérico
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};

module.exports = errorMiddleware;