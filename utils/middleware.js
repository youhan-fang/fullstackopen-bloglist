const logger = require('./logger');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

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

const userExtractor = async (request, response, next) => {
  const authorization = request.get('authorization');
  if(!authorization) {
    return response.status(401).json({
      error: 'token missing'
    });
  }
  const token = authorization.toLowerCase().startsWith('bearer ')
    ? authorization.substring(7)
    : null;
  if(!token) {
    return response.status(401).json({
      error: 'token invalid'
    });
  }
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if(!decodedToken || !decodedToken.id) {
    return response.status(401).json({
      error: 'token invalid'
    });
  }
  const user = await User.findById(decodedToken.id);
  if(!user) {
    return response.status(404).json({
      error: 'user does not exist'
    });
  }
  request.user = user;
  next();
};

module.exports = {
  unknownEndpoint,
  errorHandler,
  userExtractor
};