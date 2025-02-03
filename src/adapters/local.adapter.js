import { getLeaderboardKey } from '../utils/common.js';
import LeaderboardAdapter from './base.adapter.js';
import LeaderboardModel from '../models/leaderboard.model.js';
/**
 * Manages local leaderboard data storage and retrieval with in-memory Maps.
 * Handles score updates, leaderboard listings, and member count tracking.
 */
export default class LocalAdapter extends LeaderboardAdapter {
	constructor() {
		super();
		this.leaderboards = new Map(); //Stores score-to-users mapping for each game
		this.userScores = new Map(); //Stores user-to-score mapping for each game
	}
	/**
	 * Sets the current game identifier after processing it through getLeaderboardKey
	 * @param {string} gameId - The game identifier to set
	 * @returns {RedisAdapter}
	 */
	setGameId(gameId) {
		this.gameId = getLeaderboardKey(gameId);
		return this;
	}

	/**
	 * Retrieves or initializes the leaderboard data structures for the current game
	 * @returns {{
	 *   scoreMap: Map<number, Set<string>>,
	 *   userMap: Map<string, {score: number, timestamp: string}>
	 * }} 
	 * Object containing score and user mappings
	 */
	getGameLeaderboard() {
		if (!this.leaderboards.has(this.gameId)) {
			this.leaderboards.set(this.gameId, new Map());
			this.userScores.set(this.gameId, new Map());
		}
		return {
			scoreMap: this.leaderboards.get(this.gameId),
			userMap: this.userScores.get(this.gameId)
		};
	}

	/**
	 * Updates a member's score in the leaderboard and maintains data structure integrity
	 * @param {Object} params - The score update parameters
	 * @param {string} params.userId - The user identifier
	 * @param {number} params.score - The new score value
	 * @param {string|number|Date} params.timestamp - The timestamp of the score update
	 * @returns {void}
	 */
	updateMemberScore({
		userId,
		score,
		timestamp
	}) {
		const { scoreMap, userMap } = this.getGameLeaderboard();

		const scoreData = {
			score,
			timestamp: new Date(timestamp).toISOString()
		};

		const oldScoreData = userMap.get(userId);

		if (oldScoreData !== undefined) {
			const usersAtOldScore = scoreMap.get(oldScoreData.score);
			usersAtOldScore.delete(userId);
			if (usersAtOldScore.size === 0) {
				scoreMap.delete(oldScoreData.score);
			}
		}

		if (!scoreMap.has(score)) {
			scoreMap.set(score, new Set());
		}

		scoreMap.get(score).add(userId);
		userMap.set(userId, scoreData);
	}

	/**
	 * Retrieves a sorted list of top scores for the current game
	 * @param {number} [limit=10] - Maximum number of scores to return
	 * @returns {Array<{
	 *   userId: string,
	 *   score: number,
	 *   timestamp: string
	 * }>} Array of score entries sorted by score in descending order
	 */
	async getMembers(limit = 10) {
		const { scoreMap, userMap } = this.getGameLeaderboard(this.gameId);
		const result = [];

		const sortedScores = Array.from(scoreMap.keys())
			.sort((a, b) => b - a)
			.slice(0, limit);

		for (const score of sortedScores) {
			const usersAtScore = scoreMap.get(score);
			for (const userId of usersAtScore) {
				const userData = userMap.get(userId);
				result.push({
					userId,
					score,
					timestamp: userData.timestamp
				});
			}
		}

		return result;
	}

	/**
	 * Gets the total number of members in the current game's leaderboard
	 * @returns {Promise<number>} The number of members in the leaderboard
	 */
	async getMemberCount() {
		return this.userScores.get(this.gameId)?.size || 0;
	}

	async exportDataToDB() {
		const gameIds = Array.from(this.dirty);
		this.resetDirty();

		for (const gameId of gameIds) {
			this.setGameId(gameId);
			const gameSize = await this.getMemberCount(); 
			const scores = await this.getMembers(gameSize);

			await LeaderboardModel.findOneAndUpdate(
				{ gameId: this.gameId },
				{ $set: { scores } },
				{ upsert: true }
			);
		}
	}

	async importDataFromDB(gameId){

	}
}
