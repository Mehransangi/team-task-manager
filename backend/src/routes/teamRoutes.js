import express from 'express'
import requireAuth from '../middleware/requireAuth.js'
import { addTeamMember, createTeam, deleteTeam, getMyTeams, getTeamById, updateTeam } from '../controllers/teamController.js'

const router = express.Router()

router.use(requireAuth)

router.post('/', createTeam)
router.get('/', getMyTeams)
router.get('/:id', getTeamById)
router.put('/:id', updateTeam)
router.delete('/:id', deleteTeam)
router.post('/:id/members', addTeamMember)

export default router