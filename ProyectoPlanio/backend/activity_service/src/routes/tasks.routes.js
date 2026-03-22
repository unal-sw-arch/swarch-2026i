const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getTasksByRoom,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/tasks.controller');
const authMiddleware = require('../middleware/auth.middleware.dev');

// todos los endpoints requieren autenticación
router.use(authMiddleware);

// GET /rooms/:roomId/tasks — obtener tareas de una sala
router.get('/', getTasksByRoom);

// POST /rooms/:roomId/tasks — crear tarea
router.post('/', createTask);

// PATCH /rooms/:roomId/tasks/:taskId — actualizar título, descripción o asignado
router.patch('/:taskId', updateTask);

// PATCH /rooms/:roomId/tasks/:taskId/status — cambiar estado
router.patch('/:taskId/status', updateTaskStatus);

// DELETE /rooms/:roomId/tasks/:taskId — eliminar tarea
router.delete('/:taskId', deleteTask);

module.exports = router;