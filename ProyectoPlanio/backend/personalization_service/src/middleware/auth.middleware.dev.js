// SOLO PARA DESARROLLO — no usar en producción
const authMiddlewareDev = (req, res, next) => {
  req.user = { db_id: 1 }; // Laura
  next();
};

module.exports = authMiddlewareDev;