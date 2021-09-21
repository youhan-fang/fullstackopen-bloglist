const logger = require('./logger');

const unknownEndpoint = (request, response) => {
  response.status(404).json({
    error: 'unknown endpoint'
  });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error);

  if (error.name === 'CastError') {
    return response.status(400).json({
      error: 'malformatted id'
    });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({
      error: error.message
    });
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    });
  }

  next(error);
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization');
  if (authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7);
  } else {
    request.token = null;
  }

  next();
};

module.exports = {
  unknownEndpoint,
  errorHandler,
  tokenExtractor
};