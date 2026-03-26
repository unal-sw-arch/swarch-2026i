const express = require('express');
const router = express.Router();
const { loginOrRegister, getUserById } = require('../controllers/users.controller');
const authMiddleware = require('../middleware/auth.middleware');

// POST /users/login — login o registro con Firebase
// no requiere auth porque es el primer endpoint que se llama
router.post('/login', loginOrRegister);

// GET /users/:id — obtener usuario por id
// requiere auth porque ya debe estar logueado
router.get('/:id', authMiddleware, getUserById);

module.exports = router;