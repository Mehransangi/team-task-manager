import express from 'express'
import requireAuth from '../middleware/requireAuth.js'
import { createTask } from '../controllers/taskController.js'

const router = express.Router()
router.use(requireAuth)

router.post('/', createTask)

export default router