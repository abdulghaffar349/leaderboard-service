import express from 'express';
import { LeaderboardController } from '../controllers/leaderboard.controller.js';

const router = express.Router();
const controller = new LeaderboardController();

router.get('/leaderboard/:gameId', controller.getLeaderboard);

router.post('/update-score', controller.updateScore);

export default router;