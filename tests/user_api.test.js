const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
require('express-async-errors');

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});
  console.log('cleared the user collection');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password', salt);
  const firstUser = new User({
    username: 'root',
    name: 'root',
    passwordHash
  });
  await firstUser.save();
  console.log('initialized the user collection');
  console.log('start testing');
}, helper.timeOut);

describe('get all users', () => {
  test('succeeds when users are returned as json with the correct length', async () => {
    const users = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(users.body).toHaveLength(1);
  }, helper.timeOut);
});

describe('add a user', () => {
  test('succeeds when a user can be added', async () => {
    const initialUsers = await helper.usersInDb();
    const newUser = {
      username: 'user',
      name: 'New User',
      password: 'password'
    };
    await api
      .post('/api/users')
      .send(newUser)
      .expect(201);
    const users = await helper.usersInDb();
    expect(users).toHaveLength(initialUsers.length + 1);
    const contents = users.map(user => user.username);
    expect(contents).toContain(newUser.username);
  }, helper.timeOut);

  test('fails with bad request if username is missing', async () => {
    const initialUsers = await helper.usersInDb();
    const newUser = {
      name: 'New User',
      password: 'password'
    };
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400);
    expect(result.body.error).toContain('`username` is required');
    let users = await helper.usersInDb();
    expect(users).toHaveLength(initialUsers.length);
  }, helper.timeOut);

  test('fails with bad request if username is too short', async () => {
    const initialUsers = await helper.usersInDb();
    const newUser = {
      username: 'us',
      name: 'New User',
      password: 'password'
    };
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400);
    expect(result.body.error).toContain('`username`');
    expect(result.body.error).toContain('is shorter');
    let users = await helper.usersInDb();
    expect(users).toHaveLength(initialUsers.length);
  }, helper.timeOut);

  test('fails with bad request if password is missing', async () => {
    const initialUsers = await helper.usersInDb();
    const newUser = {
      username: 'user',
      name: 'New User'
    };
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400);
    expect(result.body.error).toContain('password missing');
    let users = await helper.usersInDb();
    expect(users).toHaveLength(initialUsers.length);
  }, helper.timeOut);

  test('fails with bad request if password is too short', async () => {
    const initialUsers = await helper.usersInDb();
    const newUser = {
      username: 'user',
      name: 'New User',
      password: 'ab'
    };
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400);
    expect(result.body.error).toContain('password length must be greater');
    let users = await helper.usersInDb();
    expect(users).toHaveLength(initialUsers.length);
  }, helper.timeOut);

  test('fails with bad request if username is not unique', async () => {
    const initialUsers = await helper.usersInDb();
    const newUser = {
      username: 'root',
      name: 'New User',
      password: 'password'
    };
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400);
    expect(result.body.error).toContain('`username` to be unique');
    let users = await helper.usersInDb();
    expect(users).toHaveLength(initialUsers.length);
  }, helper.timeOut);
});


afterAll(() => {
  mongoose.connection.close();
});
