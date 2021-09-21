const _ = require('lodash');


const dummy = () => {
  return 1;
};

const totalLikes = (blogs) => {
  if (blogs.length){
    const reducer = (sum, likes) => {
      return sum + likes;
    };

    return blogs.map(blog => blog.likes).reduce(reducer, 0);
  }
  return 0;
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0){
    return null;
  }
  const favoriteBlog = _.maxBy(blogs, 'likes');
  return {
    author: favoriteBlog.author,
    title: favoriteBlog.title,
    likes: favoriteBlog.likes
  };
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0){
    return null;
  }
  const blogsNumberByAuthorObject = _.countBy(blogs, 'author');
  const blogsNumberByAuthor =
    Object
      .keys(blogsNumberByAuthorObject)
      .map(key => {
        return {
          author: key,
          blogs: blogsNumberByAuthorObject[key]
        };
      });
  return _.maxBy(blogsNumberByAuthor, 'blogs');
};

const mostLikes = (blogs) => {
  if (blogs.length === 0){
    return null;
  }
  const listGroupByAuthor = _.groupBy(blogs, 'author');
  const listAuthorLikes = _.map(listGroupByAuthor, (value, key) => {
    const likes = _.sumBy(value, 'likes');
    return {
      author: key,
      likes: likes
    };
  });
  return _.maxBy(listAuthorLikes, 'likes');
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
};