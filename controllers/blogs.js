const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const middleware = require('../utils/middleware');
require('express-async-errors');


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const user = request.user;
  if (!request.body.url || !request.body.title) {
    return response.status(400).json({
      error: 'required information is missing'
    });
  }
  console.log('user extracted from token:', user);
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

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user;
  const id = request.params.id;
  const blog = await Blog.findById(id);

  if(!blog) {
    return response.status(404).json({
      error: 'the blog does not exist'
    });
  }

  if (blog.user.toString() !== user._id.toString()){
    return response.status(401).json({
      error: 'the user does not have the permission to delete the blog'
    });
  }

  await blog.remove();
  response.status(204).end();
});

blogsRouter.put('/:id', middleware.userExtractor, async (request, response) => {
  // const user = request.user;
  const id = request.params.id;
  const blog = request.body;

  // if (blog.user.toString() !== user._id.toString()){
  //   return response.status(401).json({
  //     error: 'the user does not have the permission to update the blog'
  //   });
  // }

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