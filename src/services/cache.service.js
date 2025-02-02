import { config } from '../config/config.js';
import { getCachedPopularGameKey, getPopularGameIdentifierKey } from '../utils/common.js';
import { RedisClient } from "../services/redis.service.js";
import logger from '../utils/logger.js';

export class CacheService {
    constructor() {
        this.redis = RedisClient.getInstance();
    }
    /**
     * Caches leaderboard scores for a popular game
     * @param {Object} params - The parameters object
     * @param {string} params.gameId - Unique identifier for the game
     * @param {Array} params.scores - Array of leaderboard scores to cache
     * @param {number} params.limit - Maximum number of scores to cache
     * @returns {Promise<void>} Resolves when caching is complete
     */
    async cacheLeaderboard({
        gameId,
        scores,
        limit,
    }) {
        const key = getCachedPopularGameKey(`${gameId}:${limit}`);
        const isPopular = await this.isPopularGame(gameId);
        if (!isPopular) {
            return;
        }
        await this.redis.setex(
            key,
            config.POPULAR_GAME_RESPONSE_TTL,
            JSON.stringify(scores)
        );
    }
    /**
     * Retrieves cached leaderboard scores for a game
     * @param {string} gameId - Unique identifier for the game
     * @param {number} limit - Maximum number of scores to retrieve
     * @returns {Promise<Array|null>} Array of cached scores or null if not found
     */
    async getCachedLeaderboard(gameId, limit) {
        const key = getCachedPopularGameKey(`${gameId}:${limit}`);
        const cached = await this.redis.get(key);
        return cached ? JSON.parse(cached) : null;
    }
    /**
     * Updates game popularity tracking based on user count
     * @param {Object} params - The parameters object
     * @param {string} params.gameId - Unique identifier for the game
     * @param {number} params.userCount - Current number of users for the game
     * @returns {Promise<void>} Resolves when tracking is complete
     */
    async trackGamePopularity({
        gameId,
        userCount
    }) {
        if (userCount >= config.POPULAR_THRESHOLD) {
            const key = getPopularGameIdentifierKey(gameId);
            await this.redis.setex(
                key,
                config.POPULAR_GAME_TTL,
                'true'
            );
        }
    }
    /**
     * Checks if a game is currently marked as popular
     * @param {string} gameId - Unique identifier for the game
     * @returns {Promise<boolean>} True if the game is popular, false otherwise
     */
    async isPopularGame(gameId) {
        const key = getPopularGameIdentifierKey(gameId);
        return await this.redis.exists(key) === 1;
    }
    /**
     * Invalidates cache entries, either all or by specific key pattern
     * @param {string|null} [key=null] - Optional key pattern to invalidate (supports wildcards) e.g gameId:limit:*
     * @returns {Promise<void>} Resolves when invalidation is complete
     * @static
     * @throws {Error} If there's an error during cache invalidation
     */
    static async invalidateCache(key = null) {
        try {
            if (!key) {
                return await RedisClient.getInstance().flushall();
            }
            const keys = await RedisClient.getInstance().keys(key);
            if (keys.length > 0) {
                await RedisClient.getInstance().del(...keys);
            }
        } catch (error) {
            logger.error(error);
        }
    }
}