const usersRouter = require('express').Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');


usersRouter.get('/', async (request, response) => {
  const users = await User.find({});
  response.status(200).json(users);
});

usersRouter.post('/', async (request, response) => {
  const body = request.body;

  if (!body.password) {
    return response.status(400).json({
      error: 'password missing'
    });
  } else if (body.password.length < 3) {
    return response.status(400).json({
      error: 'password length must be greater or equal to 3'
    });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(body.password, salt);

  const newUser = new User({
    username: body.username,
    name: body.name,
    passwordHash
  });

  const savedUser = await newUser.save();
  response.status(201).json(savedUser);
});

module.exports = usersRouter;