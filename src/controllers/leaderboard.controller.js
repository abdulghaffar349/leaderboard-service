import { LeaderboardService } from '../services/leaderboard.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateScoreUpdate, validateLimit } from '../utils/validations.js';

export class LeaderboardController {
	constructor() {
		this.service = new LeaderboardService();
	}

	getLeaderboard = asyncHandler(async (req, res) => {
		validateLimit(req);

		const { gameId } = req.params;
		const limit = parseInt(req.query.limit) ?? 10;

		const leaderboard = await this.service.getMembers(gameId, limit);
		const count = await this.service.getGameSize(gameId);
		res.json({
			status: 'success',
			data: {
				count,
				leaderboard,
			}
		});

	});

	updateScore = asyncHandler(async (req, res) => {
		validateScoreUpdate(req);

		const result = await this.service.updateScore(req.body);
		res.status(200).json({
			status: 'success',
			data: result
		});
	});
}