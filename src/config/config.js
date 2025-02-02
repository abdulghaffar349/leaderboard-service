import { REDIS_ADAPTER } from "../utils/constants.js";
/**
 * Configuration object for the application.
 * @typedef {Object} Config
 * @property {string} NODE_ENV - The environment in which the application is running (e.g., 'development', 'production'). Defaults to 'development'.
 * @property {number} PORT - The port on which the application will listen. Defaults to 3000.
 * @property {string} REDIS_URL - The URL for connecting to the Redis server. Defaults to 'redis://redis:6379'.
 * @property {string} MONGODB_URI - The URI for connecting to the MongoDB database. Defaults to 'mongodb://mongodb:27017/leaderboard'.
 * @property {number} POPULAR_GAME_RESPONSE_TTL - Time-to-live (in seconds) for caching the response of popular games. Defaults to 3600 (1 hour).
 * @property {number} POPULAR_GAME_TTL - Time-to-live (in seconds) for caching the popular games data. Defaults to 86400 (1 day).
 * @property {number} POPULAR_THRESHOLD - The threshold of user count in a game to consider it as popular. Defaults to 100.
 * @property {string} MEMORY_ADAPTER - The adapter to use for in-memory data storage (e.g., 'redis' or 'local'). Defaults to the value of `REDIS_ADAPTER`.
 * @property {boolean} CLEAR_CACHE_ON_START - Whether to clear the application cache on start. Defaults to `false`.
 */
/**
 * Application configuration object.
 * @type {Config}
 */
export const config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    REDIS_URL: process.env.REDIS_URL || 'redis://redis:6379',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://mongodb:27017/leaderboard',
    POPULAR_GAME_RESPONSE_TTL: parseInt(process.env.POPULAR_GAME_TTL) || 3600,
    POPULAR_GAME_TTL: parseInt(process.env.POPULAR_GAME_TTL) || 86400,
    POPULAR_THRESHOLD: parseInt(process.env.POPULAR_THRESHOLD) || 100,
    MEMORY_ADAPTER: process.env.MEMORY_ADAPTER || REDIS_ADAPTER, 
    CLEAR_CACHE_ON_START: process.env.CLEAR_CACHE_ON_START === "true"
};
