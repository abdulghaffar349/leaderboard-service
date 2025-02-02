import Redis from 'ioredis';
import { config } from '../config/config.js';
import logger from '../utils/logger.js';

export class RedisClient {
	static #instance;

	constructor() {
		RedisClient.#instance = new Redis(config.REDIS_URL);
		RedisClient.#instance.on("error", (err) => {
			logger.error(err);
		});
		RedisClient.#instance.on("connect", () => {
			logger.info("Redis client connected!");
		})
	}
	/**
	 * Returns the singleton instance of the RedisClient.
	 * If an instance does not exist, it creates one.
	 * @static
	 * @returns {Redis} The singleton instance of the Redis client.
	 */
	static getInstance() {
		if (!RedisClient.#instance) {
			new RedisClient();
		}
		return RedisClient.#instance;
	}

}