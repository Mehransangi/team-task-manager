import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import validate from '../middleware/validate.js';
import {
  addMemberRules,
  createTeamRules,
  teamIdRule,
  updateTeamRules,
} from '../validators/teamValidator.js';
import {
  addTeamMember,
  createTeam,
  deleteTeam,
  getMyTeams,
  getTeamById,
  updateTeam,
} from '../controllers/teamController.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', createTeamRules, validate, createTeam);
router.get('/', getMyTeams);
router.get('/:id', teamIdRule, validate, getTeamById);
router.put('/:id', updateTeamRules, validate, updateTeam);
router.delete('/:id', teamIdRule, validate, deleteTeam);
router.post('/:id/members', addMemberRules, validate, addTeamMember);

export default router;
