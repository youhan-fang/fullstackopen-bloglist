const jwt = require('jsonwebtoken');
const loginRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

loginRouter.post('/', async (request, response) => {
  const body = request.body;
  const user = await User.findOne({ username: body.username });
  const passwordCorrect = user === null ? false
    : await bcrypt.compare(body.password, user.passwordHash);
  if (!user || !passwordCorrect) {
    return response.status(401).json({
      error: 'invalid username or password'
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id
  };
  const token = jwt.sign(userForToken, process.env.SECRET);
  const returnedUser = {
    username: user.username,
    name: user.name,
    token
  };
  response.status(200).json(returnedUser);
});

module.exports = loginRouter;