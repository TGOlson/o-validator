# o-validator

[![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url]

Simple and functional object validator.

Validate objects with common predicate functions. No special syntax required.

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
var Validator = require('o-validator');

var pattern = {
  title       : Validator.required(isString)
  description : Validator.isAll(isString, hasLengthGreaterThan(5)),
  isActive    : isBoolean,
  tags        : isArray
};

Validator.validate(pattern, {
  title       : 'Hi There',
  description : 'This is a great post.',
  isActive    : true
  // tags are not defined - but that is valid, validator treats them as optional
});
// => true
```

The validator runs each argument against the defined validation pattern, asserting a true outcome for each. Properties defined in the validation pattern are assumed to be optional unless declared otherwise using `Validator.required`.

Note: this module is best used with a functional library to provide predicates (isString, isNull, etc.), such as ramda or lodash.


#### All function are curried

All methods in this library are [curried](http://en.wikipedia.org/wiki/Currying), which means that if a method is called without all the arguments it requires, the return value will be a function that takes the remaining arguments. This is super helpful in general, and in the case of this library it makes it possible to create validator functions that can be saved and run at a later time.

For example, one could write the previous validation like this:

```js
var Validator = require('o-validator');

var validadeArgs = Validator.validate(<pattern>);

validadeArgs(<args>);
// => Boolean
```

## Available Methods

As noted previously, all methods in the library are curried. The type signatures are written to reflect that.

Note: the type `Predicate` is defined as a function that takes any value and returns a boolean (`(a -> Boolean)`).


#### Validator.validate

{k: Predicate} -> {k: a} -> Boolean

Validates arguments against the provided pattern.
```js
Validator.validate(<pattern>, <args>) -> Boolean
```


#### Validator.getErrors

{k: Predicate} -> {k: a} -> [Object]

Returns a list of errors for a validation pattern with values. Errors are objects with information about the original call. If no errors are found, the method returns an empty array.
```js
Validator.getErrors(<pattern>, <args>) -> [Object]

// Error object is in the form of:
// {
//   property  : String,
//   errorCode : String,
//   message   : String
// }
```


#### Validator.validateOrThrow

{k: Predicate} -> {k: a} -> Error or {k: a}

Throws an error if any predicate returns false, otherwise returns the original input arguments.
```js
// Invalid args
Validator.validateOrThrow(<pattern>, <args>) -> Error

// Valid args
Validator.validateOrThrow(<pattern>, <args>) -> <args>
```


#### Validator.required

Predicate -> {k: Predicate, required: true}

Returns an object that specifies the predicate and that the value is required. This should be used to denote that a property is required, since otherwise properties as assumed to be optional.
```js
var validateArgs = Validator.validate({
  title       : Validator.required(isString)
  description : isString
});

// when the validator is invoked, a title property must be supplied,
// while the description property is optional
```


## TODO

* Add ability to insert custom error messages, and/or create custom error messages for custom predicates.

[travis-image]: https://travis-ci.org/MindjetLLC/o-validator.svg?branch=master
[travis-url]: https://travis-ci.org/MindjetLLC/o-validator

[coveralls-image]: https://coveralls.io/repos/MindjetLLC/o-validator/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/r/MindjetLLC/o-validator?branch=master
