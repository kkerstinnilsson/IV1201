const logger = require('./logger');
const { AppError } = require('../../business/errors/AppError');

/**
 * Global error handling middleware
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // console.log("GLOBAL ERROR HANDLER TRIGGERED");

  logger.error({
    message: err.message,
    stack: err.stack,
    cause: err.cause ? err.cause.message : undefined,
    path: req.originalUrl,
    method: req.method,
  });

  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // Unknown / programmer error
  return res.status(500).json({
    error: 'Internal Server Error',
  });
}

module.exports = errorHandler;
