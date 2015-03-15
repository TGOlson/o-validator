# Validation Examples

This directory shows an example of how validations can be run in a more complex scenario.

Check out `create-post.js` to see how the validator is constructing and some of the advanced methods that are used.

To view the output, run

```
$ node create-post.js
```

Try changing the validator or the data in `data.js` to see how validation results change.

Validation example from `create-post.js`:

```js
var Validator = require('o-validator'),
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

// invoke the validator against arbitrary provided arguments
validatePost({<PostArgs>}); // -> Boolean
```
