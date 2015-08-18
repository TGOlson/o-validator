# o-validator

[![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url]

Flexible and lightweight object validation library.

Build validators from a generic low-level API, or use helpful pre-built validators. This library makes no assumptions about the structure of the provided data, and instead lets the consumer define how their data should be inspected by validating properties with common predicate functions. No special syntax required.

## Install

```
$ npm install o-validator --save
```

Run the specs

```
$ npm test
```

## Usage

```js

var V = require('o-validator');
var R = require('ramda');

var schema = {
  title       : V.required(R.is(String))
  description : R.allPass([R.is(String), R.propSatisfies(R.gt(5), 'length')]),
  isActive    : R.is(Boolean),
  tags        : R.is(Array)
};

V.validate(schema, {
  title       : 'Hi There',
  description : 'This is a great post.',
  isActive    : true
  // tags are not defined - but that is valid, validator treats them as optional
});
// => true
```

The validator runs each argument against the defined validation schema, asserting a true outcome for each. Properties defined in the validation schema are assumed to be optional unless declared otherwise using `Validator.required`.

Note: this module is best used with a functional library to provide predicates (isString, isNull, etc.), such as [ramda](https://github.com/ramda/ramda).


#### Functions are curried by default

All methods in this library are [curried](http://en.wikipedia.org/wiki/Currying), which means that if a method is called without all the arguments it requires, the return value will be a function that takes the remaining arguments. This is very helpful in general, and in the case of this library it makes it possible to create validator functions that can be saved and run at a later time.

For example, one could write the previous validation like this:

```js
var V = require('o-validator');

// construct validation function and save it for later
var validateArgs = V.validate(<schema>);

// use (and re-use) previously constructed validation function
validadeArgs(<args>); // => Boolean
```

## Available Methods

As noted previously, all provided methods in this library are curried. The type signatures are written to reflect that.

Note: the type `Predicate` is defined as a function that takes any value and returns a boolean (`(a -> Boolean)`).


#### Validator.validate

{k: Predicate} -> {k: a} -> Boolean

Validates arguments against the provided schema, returning a boolean value to indicate if the arguments satisfied the defined schema.

Note: when partially applied with a schema, this function produces a `Predicate`. As such, it can be used to recursively validate objects with nested properties.

```js
Validator.validate(<schema>, <args>) -> Boolean
```


#### Validator.getErrors

{k: Predicate} -> {k: a} -> [Object]

Returns a list of errors for a validation schema with values. Errors are objects with information about the original call. If no errors are found, the method returns an empty array.
```js
Validator.getErrors(<schema>, <args>) -> [Object]

// Error object is in the form of:
// {
//   property  : String,
//   errorCode : String,
//   message   : String
// }
```


#### Validator.validateOrThrow

{k: Predicate} -> {k: a} -> Error or {k: a}

Throws an error containing information about any invalid inputs, if found, otherwise returns the original input arguments.
```js
// Invalid args
Validator.validateOrThrow(<schema>, <args>) -> Error

// Valid args
Validator.validateOrThrow(<schema>, <args>) -> <args>
```


#### Validator.required

Predicate -> {predicate: Predicate, required: true}

Returns an object that specifies the predicate and that the value is required. This should be used to denote that a property is required, since otherwise properties as assumed to be optional.
```js
var validateArgs = Validator.validate({
  title       : Validator.required(isString)
  description : isString
});

// when the validator is invoked, a title property must be supplied,
// while the description property is optional
```


## In depth example

As noted above, this library aims to provide a generic low-level API so that almost any use case can be accommodated. For example, we could easily build a validation function that returns errors using the default error message library, but also includes information about the original top level object in its error response.

```js
// custom-validator.js
var V = require('o-validator');
var R = require('ramda');

var getDefaultErrorMessages = R.compose(R.pluck('message'), V.addDefaultErrorMessages);

var customErrorHandler = R.curry(function(identifier, errors) {
  var errorMessages = getDefaultErrorMessages(errors);

  var message = 'Could not validate ' + identifier + ' - ' + R.join('; ', errorMessages);
  throw new Error(message);
});

var validateWithIdentifier = R.curry(function(identifier, schema, props) {
  return V.validateWithErrorHandler(customErrorHandler(identifier), schema, props);
});

module.exports = validateWithIdentifier;
```

By simply glueing together a few functions, we now have a customized validation function ready to be re-used in our project.

```js
// user-profile.js
var R = require('ramda');

var validateWithIdentifier = require('./custom-validator');

var validateUserProfile = validateWithIdentifier('userProfile', {
  name : R.is(String),
  age  : R.is(Number)
});

validateUserProfile({name: 'Tyler', age: 'seventy-million'});
// => Error: Could not validate userProfile - Illegal value for parameter "age"
```

[travis-image]: https://travis-ci.org/TGOlson/o-validator.svg?branch=master
[travis-url]: https://travis-ci.org/TGOlson/o-validator

[coveralls-image]: https://coveralls.io/repos/TGOlson/o-validator/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/r/TGOlson/o-validator?branch=master
