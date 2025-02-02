import { ValidationError } from './errors.js';

export const validateScoreUpdate = (req) => {
    const { eventType, userId, gameId, score, timestamp } = req.body;

    if (!eventType || eventType !== 'scoreUpdate') {
        throw new ValidationError('Invalid event type. Must be "scoreUpdate"');
    }

    if (!userId || typeof userId !== 'string') {
        throw new ValidationError('Invalid or missing userId');
    }

    if (!gameId || typeof gameId !== 'string') {
        throw new ValidationError('Invalid or missing gameId');
    }

    if (!score || typeof score !== 'number' || score < 0) {
        throw new ValidationError('Score must be a positive number');
    }

    // if (!timestamp || isNaN(Date.parse(timestamp))) {
    //     throw new ValidationError('Invalid or missing timestamp');
    // }
};

export const validateLimit = (req) => {
    const limit = parseInt(req.query.limit);
    
    if (limit && (isNaN(limit) || limit < 1 || limit > 100)) {
        throw new ValidationError('Limit must be a number between 1 and 100');
    }
};