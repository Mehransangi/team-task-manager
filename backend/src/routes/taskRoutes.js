import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import validate from '../middleware/validate.js';
import {
  createTaskRules,
  listTaskRules,
  taskIdRule,
  updateTaskRules,
} from '../validators/taskValidator.js';
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
} from '../controllers/taskController.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', createTaskRules, validate, createTask);
router.get('/', listTaskRules, validate, getTasks);
router.get('/:id', taskIdRule, validate, getTaskById);
router.put('/:id', updateTaskRules, validate, updateTask);
router.delete('/:id', taskIdRule, validate, deleteTask);

export default router;
