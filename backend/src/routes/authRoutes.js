import express from 'express'
import { loginRules, registerRules } from '../validators/authValidator.js'
import validate from '../middleware/validate.js'
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../controllers/authController.js'
import requireAuth from '../middleware/requireAuth.js'

const router = express.Router()

router.post('/register', registerRules, validate, registerUser)
router.post('/login', loginRules, validate, loginUser)
router.post('/logout', requireAuth, logoutUser)
router.get('/me', requireAuth, getCurrentUser)

export default router