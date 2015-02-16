var isValidPost = require('./validators').post;

function createPost(args) {
  if(!isValidPost(args)) {
    throw new Error('Invalid post arguments.');
  }

  // else create post ...
  console.log('A new post has been created.');
}

createPost(require('./data').post);
