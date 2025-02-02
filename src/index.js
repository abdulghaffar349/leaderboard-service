import express from 'express';
import mongoose from 'mongoose';
import { config } from './config/config.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { CacheService } from './services/cache.service.js';
import logger from './utils/logger.js';
import { initSchedular } from './cron/index.js';

config.CLEAR_CACHE_ON_START && CacheService.invalidateCache();

initSchedular();

const app = express();

app.use(express.json());

mongoose.connect(config.MONGODB_URI)
    .then(() => logger.info('Connected to MongoDB'))
    .catch(err => logger.error('MongoDB connection error:', err));

app.use('/api', leaderboardRoutes);
app.all('*', (req, res, next) => {
    const err = new Error(`Cannot find ${req.originalUrl} on this server!`);
    err.status = 'fail';
    err.statusCode = 404;
    next(err);
});

app.use(errorHandler);

app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`);
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    mongoose.connection.close();
    process.exit(0);
});