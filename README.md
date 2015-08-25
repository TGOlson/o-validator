# o-validator

[![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url]

Flexible and lightweight object validation library.

Build validators from a generic low-level API, or use helpful pre-built validators. This library makes no assumptions about the structure of the provided data, and instead lets the consumer define how their data should be inspected by validating properties with common predicate functions. No special syntax required.

## Install

```
$ npm install o-validator --save
```

## Usage

```js
var V = require('o-validator');
var R = require('ramda');

var hasLengthGreaterThan = R.curry(function(n, x) {
  return R.propSatisfies(R.lt(n), 'length');
});

var schema = {
  title       : V.required(R.is(String)),
  description : R.allPass([R.is(String), hasLengthGreaterThan(5)]),
  isActive    : R.is(Boolean),
  tags        : R.is(Array)
};

var r = V.validate(schema, {
  title       : 'Hi There',
  description : 'This is a great post.',
  isActive    : true
  // tags are not defined - but that is OK, validator treats them as optional
});
// => true
```

The validator runs each argument against the defined validation schema, asserting a true outcome for each. Properties defined in the validation schema are assumed to be optional unless declared otherwise using `Validator.required`.

Note: this module is best used with a functional library to provide predicates (isString, isNull, etc.), such as [ramda](https://github.com/ramda/ramda).

#### Functions are curried by default

All methods in this library are [curried](http://en.wikipedia.org/wiki/Currying), which means that if a method is called without all the arguments it requires, the return value will be a function that takes the remaining arguments. This is very helpful in general, and in the case of this library it makes it possible to create validator functions that can be saved and used at a later time.

For example, one could write the previous validation like this:

```js
var V = require('o-validator');

// construct validation function and save it for later
var validateArgs = V.validate(<schema>);

// use (and re-use) previously constructed validation function
validadeArgs(<object>); // => Boolean
```

## Types

Type definitions used in this module:

```hs
-- Function that takes a value and produces a boolean
Predicate :: a -> Boolean
```

```hs
-- An object with Predicates as values. These are provided to validation
-- functions, and are used to define how input data will be validated
Schema :: {k: Predicate}
```

```hs
-- An object that contains information about a validation failure
ErrorObject :: {property: String, errorCode: String}
```

```hs
-- An ErrorObject that also includes a message property
ErrorObjectWithMessage :: {property: String, errorCode: String, message: String}
```

## Docs

As noted previously, all provided methods in this library are curried. The type signatures are written to reflect that. *Note: function definitions are written in the form: `<function name> :: <type signature>`.*

#### `Validator.validate :: Schema -> Object -> Boolean`

Validates a data object against the provided schema, returning a boolean value to indicate if the supplied data object is valid.

*Note: when partially applied with a schema, this function produces a `Predicate`. As such, it can be used to recursively validate objects with nested properties.*

```js
Validator.validate(<schema>, <object>) -> Boolean
```

#### `Validator.getErrors :: Schema -> Object -> [ErrorObjectWithMessage]`

Returns a list of validation errors produced from validating the data object against the provided schema. Error objects contain information about the validation error, including the offending property, and what sort of validation error occurred (see `Validator.errorCodes`). If no errors are found, the method returns an empty array.

*Note: this method attaches default error messages to the error objects.*

```js
Validator.getErrors(<schema>, <object>) -> [ErrorObjectWithMessage]
```

#### `Validator.validateOrThrow :: Schema -> Object -> Error or Object`

Throws an error containing information about any validation errors, if found. Otherwise returns the original input arguments.

*Note: the final error message is built using the default error messages.*

```js
// Invalid args
Validator.validateOrThrow(<schema>, <object>) -> Error

// Valid args
Validator.validateOrThrow(<schema>, <object>) -> <object>
```

#### `Validator.validateWithErrorHandler :: ([ErrorObject] -> a) -> Schema -> Object -> a or Object`

Low level function for creating a validation with a custom error handler. Invokes the supplied error handler if any validation errors are found, otherwise returns the original arguments. Error handling function will be passed an array of `ErrorObject`s.

*Note: error handler should be a function that takes an array of errors, and does something with them `[ErrorObject] -> a`.*

```js
// Invalid args
Validator.validateWithErrorHandler(<error-handler>, <schema>, <object>) -> <error-handler-result>

// Valid args
Validator.validateWithErrorHandler(<error-handler>, <schema>, <object>) -> <object>
```

#### `Validator.addDefaultErrorMessages :: [ErrorObject] -> [ErrorObjectWithMessage]`

Utility function that adds default error messages to a list of errors. Useful when building a custom validation using `validateWithErrorHandler`.

#### `Validator.errorCodes :: {k: String}`

Error codes that define the type of validation error that was found. Used to populate `ErrorObject.errorCode`. Useful when building a custom validation using `validateWithErrorHandler`.

```js
{
  REQUIRED    : 'Required',
  UNSUPPORTED : 'Unsupported',
  VALUE       : 'Value',
  UNKNOWN     : 'Unknown'
}
```

#### Validator.required

(type not exposed, implementation details are internal to this library)

Specifies that a property in the schema is required. Note: by default properties as assumed to be optional.

```js
var validateArgs = Validator.validate({
  title       : Validator.required(isString)
  description : isString
});

// when the validator is invoked, a title property must be supplied,
// while the description property is optional
```

## In depth example

As noted above, this library aims to provide a generic low-level API so that almost any use case can be accommodated. For example, we could easily build a validation function that throws errors using the default error message library, but also includes information about the original top level object in its error response.

```js
// custom-validator.js
var V = require('o-validator');
var R = require('ramda');

var getDefaultErrorMessages = R.compose(R.pluck('message'), V.addDefaultErrorMessages);

// custom validation error handler
// prefixes error messages with a provided top level identifier
var customErrorHandler = R.curry(function(identifier, errors) {
  var errorMessages = getDefaultErrorMessages(errors);

  var message = 'Could not validate "' + identifier + '" - ' + R.join('; ', errorMessages);
  throw new Error(message);
});

// custom validation function
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
// => Error: Could not validate "userProfile" - Illegal value for parameter "age"
```

## TODO

* Property catch-alls: `{'*': <predicte>`
* Schema validation: `V.testSchema(<schema>) -> null or Error` (could use catch-alls)
* Validate args (`simple contracts`)

## Contributing

Install dependencies

```
$ npm install
```

Run the specs

```
$ npm test
```

[travis-image]: https://travis-ci.org/TGOlson/o-validator.svg?branch=master
[travis-url]: https://travis-ci.org/TGOlson/o-validator

[coveralls-image]: https://coveralls.io/repos/TGOlson/o-validator/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/r/TGOlson/o-validator?branch=master
