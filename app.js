const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger');
const express = require('express');
const cors = require('cors');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const middleware = require('./utils/middleware');
const morgan = require('morgan');


logger.info('connecting to MongoDB', config.MONGODB_URI);
mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to the database');
  })
  .catch(error => {
    logger.error('error connecting to the database', error.message);
  });

const app = express();
app.use(cors());
app.use(express.json());
morgan.token('body', (request) => {
  return JSON.stringify(request.body);
});
app.use(morgan(
  ':method :url :status :res[content-length] - :response-time ms :body'));
app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
if (process.env.NODE_ENV === 'test') {
  const testsRouter = require('./controllers/tests');
  app.use('/api/testing', testsRouter);
}
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;