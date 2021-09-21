const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('express-async-errors');


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
  const token = request.token;
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return response.status(401).json({
      error: 'token missing or invalid'
    });
  }
  if (!request.body.title || !request.body.url) {
    return response.status(400).json({
      error: 'required information is missing'
    });
  }
  const user = await User.findById(decodedToken.id);
  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes || 0,
    user: user._id
  });
  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  response.status(201).json(savedBlog);
});

blogsRouter.delete('/:id', async (request, response) => {
  if (!request.token) {
    return response.status(401).json({
      error: 'token missing'
    });
  }
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken || !decodedToken.id) {
    return response.status(401).json({
      error: 'token invalid'
    });
  }
  const id = request.params.id;
  const blog = await Blog.findById(id);

  if(!blog) {
    return response.status(404).json({
      error: 'the blog does not exist'
    });
  }

  if (blog.user.toString() !== decodedToken.id.toString()){
    return response.status(401).json({
      error: 'the user does not have the permission to delete the blog'
    });
  }

  await blog.remove();
  response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
  const id = request.params.id;
  const blog = request.body;
  const blogUpdated = await Blog.findByIdAndUpdate(id, blog, { new: true });

  if(blogUpdated){
    response.json(blogUpdated);
  } else {
    response.status(404).json({
      error: 'the blog does not exist'
    });
  }
});

module.exports = blogsRouter;