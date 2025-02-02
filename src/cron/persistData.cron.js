import { LeaderboardService } from "../services/leaderboard.service.js";
import logger from "../utils/logger.js"

export const persistData = async () => {
	try {
		const leaderboardService = LeaderboardService.getInstance();
		await leaderboardService.exportDataToDB();
		logger.info("data is synced.");
	} catch (error) {
		logger.error(error)
	}
}