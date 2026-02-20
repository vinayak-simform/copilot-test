import { Router } from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';
import {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
} from '../middleware/validation';

const router = Router();

// GET /tasks - Get all tasks (with optional status filter)
router.get('/tasks', getAllTasks);

// GET /tasks/:id - Get a single task by ID
router.get('/tasks/:id', validateTaskId, getTaskById);

// POST /tasks - Create a new task
router.post('/tasks', validateCreateTask, createTask);

// PATCH /tasks/:id - Update a task
router.patch('/tasks/:id', validateTaskId, validateUpdateTask, updateTask);

// DELETE /tasks/:id - Delete a task
router.delete('/tasks/:id', validateTaskId, deleteTask);

export default router;
