const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');
const Blog = require('../models/blog');
require('express-async-errors');

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  console.log('cleared the database');
  const blogsArray = helper.initialBlogs.map(blog => new Blog(blog));
  const promiseArray = blogsArray.map(blog => blog.save());
  await Promise.all(promiseArray);
  console.log('initialized the database');
  console.log('start testing');
}, helper.timeOut);

describe('get all blogs', () => {
  test('succeeds when blogs are returned as json with the correct length', async () => {
    const blogs = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(blogs.body).toHaveLength(helper.initialBlogs.length);
  }, helper.timeOut);

  test('succeeds when unique identifier property of blog is named id', async () => {
    const blogs = await api.get('/api/blogs');
    expect(blogs.body[0].id).toBeDefined();
    expect(blogs.body[0]._id).not.toBeDefined();
  }, helper.timeOut);
});

describe('add a blog', () => {
  test('succeeds when a blog can be added', async () => {
    const newBlog = {
      'title': 'Spice and More Spice Makes Everything Nice',
      'author': 'Ashley Benhayoun',
      'url': 'https://www.hyperflyer.com/explore-sf/spice-and-more-spice-makes-everything-nice/',
      'likes': 0
    };
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201);
    const blogs = await helper.blogsInDb();
    expect(blogs).toHaveLength(helper.initialBlogs.length + 1);
    const contents = blogs.map(blog => blog.title);
    expect(contents).toContain(newBlog.title);
  }, helper.timeOut);

  test('succeeds when likes is default to 0 if it is not sent from the request', async () => {
    const newBlog = {
      'title': 'Spice and More Spice Makes Everything Nice',
      'author': 'Ashley Benhayoun',
      'url': 'https://www.hyperflyer.com/explore-sf/spice-and-more-spice-makes-everything-nice/'
    };
    const savedBlog = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201);
    const blogs = await helper.blogsInDb();
    const addedBlog = blogs.find(blog => blog.id === savedBlog.body.id);
    expect(addedBlog.likes).toBeDefined();
    expect(addedBlog.likes).toBe(0);
  }, helper.timeOut);

  test('fails with bad request if title or url is missing', async () => {
    const newBlog1 = {
      'author': 'Ashley Benhayoun',
      'url': 'https://www.hyperflyer.com/explore-sf/spice-and-more-spice-makes-everything-nice/'
    };
    await api
      .post('/api/blogs')
      .send(newBlog1)
      .expect(400);
    let blogs = await helper.blogsInDb();
    expect(blogs).toHaveLength(helper.initialBlogs.length);

    const newBlog2 = {
      'title': 'Spice and More Spice Makes Everything Nice',
      'author': 'Ashley Benhayoun'
    };
    await api
      .post('/api/blogs')
      .send(newBlog2)
      .expect(400);
    blogs = await helper.blogsInDb();
    expect(blogs).toHaveLength(helper.initialBlogs.length);
  }, helper.timeOut);
});

describe('delete a blog', () => {
  test('succeeds when a blog with valid id is deleted', async () => {
    const blogRaw = await Blog.findOne({});
    const blog = blogRaw.toJSON();
    await api
      .delete(`/api/blogs/${blog.id}`)
      .expect(204);

    const blogs = await helper.blogsInDb();
    expect(blogs).toHaveLength(helper.initialBlogs.length - 1);
    const contents = blogs.map(blog => blog.title);
    expect(contents).not.toContain(blog.title);
  }, helper.timeOut);

  test('fails when the blog does not exist', async () => {
    const id = await helper.nonExistingId();
    await api
      .delete(`/api/blogs/${id}`)
      .expect(404);

    const blogs = await helper.blogsInDb();
    expect(blogs).toHaveLength(helper.initialBlogs.length);
  }, helper.timeOut);

  test('fails when id is invalid', async () => {
    const id = '123';
    await api
      .delete(`/api/blogs/${id}`)
      .expect(400);

    const blogs = await helper.blogsInDb();
    expect(blogs).toHaveLength(helper.initialBlogs.length);
  }, helper.timeOut);
});

describe('update a blog', () => {
  test('succeeds when a blog with valid id is updated', async () => {
    const blogRaw = await Blog.findOne({});
    const blog = blogRaw.toJSON();
    const payload = {
      title: 'updated title'
    };
    await api
      .put(`/api/blogs/${blog.id}`)
      .send(payload)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogs = await helper.blogsInDb();
    const contents = blogs.map(blog => {
      return {
        title: blog.title,
        id: blog.id
      };
    });
    expect(contents).toContainEqual({
      title: payload.title,
      id: blog.id
    });
  }, helper.timeOut);

  test('fails when the blog does not exist', async () => {
    const id = await helper.nonExistingId();
    const payload = {
      title: 'updated title'
    };
    await api
      .put(`/api/blogs/${id}`)
      .send(payload)
      .expect(404);

    const blogs = await helper.blogsInDb();
    const contents = blogs.map(blog => blog.title);
    expect(contents).not.toContain(payload.title);
  }, helper.timeOut);

  test('fails when id is invalid', async () => {
    const id = '123';
    const payload = {
      title: 'updated title'
    };
    await api
      .put(`/api/blogs/${id}`)
      .send(payload)
      .expect(400);

    const blogs = await helper.blogsInDb();
    const contents = blogs.map(blog => blog.title);
    expect(contents).not.toContain(payload.title);
  }, helper.timeOut);
});

afterAll(() => {
  mongoose.connection.close();
});
