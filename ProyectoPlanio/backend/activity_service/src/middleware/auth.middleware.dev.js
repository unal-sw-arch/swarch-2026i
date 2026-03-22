// SOLO PARA DESARROLLO — no usar en producción
// simula que el usuario con id 1 (Laura) está autenticado
const authMiddlewareDev = (req, res, next) => {
  req.user = { db_id: 2 }; // Juan
  next();
};

module.exports = authMiddlewareDev;