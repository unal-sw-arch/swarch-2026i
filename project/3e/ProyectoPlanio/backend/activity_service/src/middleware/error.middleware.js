// Middleware global de manejo de errores
// Captura cualquier error que ocurra en los controllers
// y devuelve una respuesta consistente sin crashear el servidor
const errorMiddleware = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);

  // error de base de datos
  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({
      error: 'Database constraint error',
      detail: err.detail,
    });
  }

  // error genérico
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
};

module.exports = errorMiddleware;