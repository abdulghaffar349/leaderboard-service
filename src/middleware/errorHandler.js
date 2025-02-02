import logger from '../utils/logger.js';
/**
 * Global error handling middleware for Express applications.
 * Handles both operational and unexpected errors, providing appropriate responses based on the environment.
 * Logs unexpected errors for debugging purposes.
 * 
 * @param {Error} err - The error object.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The Express next middleware function.
 * @returns {void}
 */
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }

    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    // Log unexpected errors
    logger.error('Unexpected error:', err);

    res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
    });
};