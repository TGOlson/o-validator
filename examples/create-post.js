'use strict';

var Validator = require('../lib/validator'),
    p         = require('./predicates');

// compose a complex validation predicate and save it for later
var isValidBodyText = Validator.isAll(
  Validator.isAny(p.isString, p.isMarkdown, p.isMarkup),
  p.hasLengthBetween(20, 100)
);

// save the newly created validator
var validatePost = Validator.validateOrThrow({

  // required arguments
  title  : Validator.required(Validator.isAll(p.isString, p.hasLengthBetween(5, 30))),
  author : Validator.required(p.isString),
  body   : Validator.required(isValidBodyText),

  // optional arguments
  description : Validator.isAll(p.isString, p.hasLengthBetween(10, 100)),
  date        : Validator.isAny(p.isDate, p.isDateString),
  category    : p.isString,
  tags        : p.isArray,

  // recursively validate - the validate method is a predicate itself
  // note: this will only work with the Validator.validate predicate
  // using Validator.required on a nested object is not yet supported
  metadata : Validator.validate({
      wordCount : Validator.required(p.isNumber),
      related   : Validator.isAny(p.isArray, p.isNull)
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
