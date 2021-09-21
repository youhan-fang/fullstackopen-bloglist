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
  }

  next(error);
};


module.exports = {
  unknownEndpoint,
  errorHandler
};