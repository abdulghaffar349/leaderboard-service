import { RedisClient } from '../services/redis.service.js';
import { getLeaderboardKey } from '../utils/common.js';
import LeaderboardAdapter from './base.adapter.js';
import LeaderboardModel from '../models/leaderboard.model.js';

const multiplier = 1e13;

export default class RedisAdapter extends LeaderboardAdapter {
	constructor() {
		super()
		this.redis = RedisClient.getInstance();
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
	 * Updates the score of a member to a specific value.
	 * @param {String} member - The member to update.
	 * @param {Number} score - The new score.
	 * @returns {Promise<void>}
	 * */
	async updateMemberScore({
		userId: member,
		score,
		timestamp
	}) {
		/**
		 * 1e13 is used as a multiplier to ensure that the score and timestamp values don't overlap when combined into a single number.
		 * Suppose A score of 100. A timestamp of 1698765432100 (milliseconds since the Unix epoch, often it is 13 digit long).
		 * compositeScore = (100 * 1e13) + 1698765432100;
		 * compositeScore = 1,000,000,000,000,000 + 1,698,765,432,100;
		 * compositeScore = 1,001,698,765,432,100;
		 * When decoding: 
		 * score = Math.floor(compositeScore / 1e13); // 100
		 * timestamp = compositeScore % 1e13; // 1698765432100
		 */
		const compositeScore = (score * multiplier) + timestamp;
		await this.redis.zadd(this.gameId, compositeScore, member); //redis.zadd("sortedSet", 1, "one", 2, "two", 4, "four", 3, "three");
	}
	/**
	 * Retrieves a limited of members from the leaderboard.
	 * @param {Number} limit - The number to retrieve.
	 * @returns {Promise<Array<{ member: String, score: Number, timestamp: Date.ISOString }>>} - The list of members and their scores.
	 */
	async getMembers(limit = 10) {
		const stop = limit - 1;

		const range = await this.redis.zrevrange(this.gameId, 0, stop, 'WITHSCORES');
		const members = [];
		for (let i = 0; i < range.length; i += 2) {
			const userId = range[i];
			const compositeScore = +range[i + 1];
			const score = Math.floor(compositeScore / multiplier);
			const timestamp = new Date(compositeScore % multiplier).toISOString();
			members.push({ userId, score, timestamp });
		}

		return members;
	}
	/**
	 * Retrieves the total number of members in the leaderboard.
	 * @returns {Promise<Number>} - The total number of members.
	 */

	async getMemberCount() {
		return await this.redis.zcard(this.gameId);
	}

	async exportDataToDB() {
		const gameIds = Array.from(this.dirty);
		this.resetDirty();
		for (const gameId of gameIds) {
			const scores = await this.setGameId(gameId).getMembers(0); //stop will be 0-1 = -1 mean all entries

			await LeaderboardModel.findOneAndUpdate(
				{ gameId: this.gameId },
				{ $set: { scores } },
				{ upsert: true }
			);
		}
	}
}