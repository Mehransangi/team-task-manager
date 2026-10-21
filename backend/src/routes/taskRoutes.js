import express from 'express'
import requireAuth from '../middleware/requireAuth.js'
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from '../controllers/taskController.js'

const router = express.Router()
router.use(requireAuth)

router.post('/', createTask)
router.get('/', getTasks)
router.get('/:id', getTaskById)
router.put('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router