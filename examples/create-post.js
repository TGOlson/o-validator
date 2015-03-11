'use strict';

var validate = require('../lib/simple-validate'),
    p        = require('./predicates');

// composing a complex validation predicate and saving it for later
var isValidBodyText = validate.isAll(
  validate.isAny(p.isString, p.isMarkdown, p.isMarkup),
  p.hasLengthBetween(20, 100)
);

// save the newly created validator
var validatePost = validate.orThrow({

  // required arguments
  title  : validate.required(validate.isAll(p.isString, p.hasLengthBetween(5, 30))),
  author : validate.required(p.isString),
  body   : validate.required(isValidBodyText),

  // optional arguments
  description : validate.isAll(p.isString, p.hasLengthBetween(10, 100)),
  date        : validate.isAny(p.isDate, p.isDateString),
  category    : p.isString,
  tags        : p.isArray,

  // recursively validating - the validate method is a predicate itself
  metadata : validate({
      wordCount : validate.required(p.isNumber),
      related   : validate.isAny(p.isArray, p.isNull)
    })
});

function createPost(args) {

  // invoke the validator against arbitrary provided arguments
  // throw an error if arguments are invalid
  validatePost(args);

  // else create post ...
  console.log('Post arguments are valid! Creating a new post...');
}

createPost(require('./data').post);
