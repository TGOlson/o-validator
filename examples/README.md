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
var validate = require('validate'),
    p        = require('./predicates');

// compose a complex validation predicate and saving it for later
var isValidBodyText = validate.isAll(
  validate.isAny(p.isString, p.isMarkdown, p.isMarkup),
  p.hasLengthBetween(20, 100)
);

// save the newly created validator
var validatePost = validate({

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

// invoke the validator against arbitrary provided arguments
validatePost({<PostArgs>}); // -> Boolean
```
