import { getCachedPopularGameKey } from '../utils/common.js';
import { CacheService } from './cache.service.js';
import { config } from '../config/config.js';
import { REDIS_ADAPTER } from "../utils/constants.js";
import RedisAdapter from "../adapters/redis.adapter.js";
import LocalAdapter from "../adapters/local.adapter.js";

export class LeaderboardService {
	static #instance = null;
	adapter = null;

	constructor() {
		if (LeaderboardService.#instance) {
			throw new Error("Use LeaderboardService.getInstance() to get the singleton instance.");
		}
		this.cache = new CacheService();
		this.adapter = new (config.MEMORY_ADAPTER === REDIS_ADAPTER ? RedisAdapter : LocalAdapter)();
		LeaderboardService.#instance = this;
	}
	/**
	 * Returns the singleton instance of the LeaderboardService.
	 * If an instance does not exist, it creates one.
	 * @static
	 * @returns {LeaderboardService} The singleton instance of LeaderboardService.
	 */
	static getInstance() {
		if (!LeaderboardService.#instance) {
			LeaderboardService.#instance = new LeaderboardService();
		}
		return LeaderboardService.#instance;
	}
	/**
	 * Updates the score for a user in a specific game and tracks the game's popularity.
	 * Invalidates the cache for the game's leaderboard.
	 * @async
	 * @param {Object} eventData - The event data containing gameId, userId, and score.
	 * @param {string} eventData.gameId - The ID of the game.
	 * @param {string} eventData.userId - The ID of the user.
	 * @param {number} eventData.score - The score to update.
	 * @returns {Promise<Object>} A promise that resolves to an object containing the gameId, userId, and score.
	 */
	async updateScore(eventData) {
		const { gameId, userId, score } = eventData;
		const timestamp = Date.now();
		this.adapter.setGameId(gameId);
		this.adapter.markDirty(gameId);
		await this.adapter.updateMemberScore({
			gameId,
			userId,
			score,
			timestamp
		});
		const gameSize = await this.adapter.getMemberCount();
		await this.cache.trackGamePopularity({
			gameId,
			userCount: gameSize
		});
		const popularity = getCachedPopularGameKey(`${gameId}:*`)
		await CacheService.invalidateCache(popularity);
		return { gameId, userId, score };
	}
	/**
	 * Retrieves the top scores for a specific game. If the game is popular, it checks the cache first.
	 * If the data is not cached, it fetches from the adapter and caches the result.
	 * @async
	 * @param {string} gameId - The ID of the game.
	 * @param {number} [limit=10] - The maximum number of top scores to retrieve.
	 * @returns {Promise<Array>} A promise that resolves to an array of top scores.
	 */
	async getMembers(gameId, limit = 10) {
		const isPopularGame = await this.cache.isPopularGame(gameId);

		if (!isPopularGame) {
			return await this.adapter.setGameId(gameId).getMembers(limit);
		};
		//Game is popular
		const cached = await this.cache.getCachedLeaderboard(gameId, limit);
		if (cached) {
			return cached;
		};
		const scores = await this.adapter.setGameId(gameId).getMembers(limit);
		await this.cache.cacheLeaderboard({
			gameId,
			limit,
			scores
		});
		return scores;
	}
	/**
	 * Retrieves the number of users (size) for a specific game.
	 * @async
	 * @param {string} gameId - The ID of the game.
	 * @returns {Promise<number>}
	 */
	async getGameSize(gameId) {
		return (await this.adapter.setGameId(gameId).getMemberCount());
	}
	/**
	 * Export data to mongoDB 
	 * @async
	 * @returns {Promise<void>}
	 */
	async exportDataToDB(){
		await this.adapter.exportDataToDB();
	}
}