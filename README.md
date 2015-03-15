# o-validator

Insanely simple and functional object validator.

Validate objects with common predicate functions. No special syntax required.

## Install

```
$ npm install o-validator
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

Note, this module is best used with a functional library to provide predicates (`isString`, `isNull`, etc.), such as `ramda` or `lodash`.

A more advanced example can also be found in the [examples directory](https://github.com/TGOlson/o-validator/tree/master/examples).

#### All function are curried

All methods in this library are [curried](http://en.wikipedia.org/wiki/Currying), which means that if a method is called without all the arguments it requires, the return value will be a function that takes the remaining arguments. This is super helpful in general, and in the case of this library it makes it possible to create validator functions that can be saved and run at a later time.

For example, one could write the previous validation like this:

```js
var Validator = require('o-validator');

var validadeArgs = Validator.validate(<pattern>);

validadeArgs(<args>);
// => Boolean
```

See the difference? In this case `validate` was only supplied one argument, the validation pattern, and it then returned a function with that validation pattern saved, which was ready to take the actual data at a later point.

## Available Methods

As noted previously, all methods in the library are curried. The type signatures are written to reflect that.

#### Validator.validate

{k: (a -> Boolean)} -> {k: a} -> Boolean

Validates arguments against the provided pattern.
```js
Validator.validate(<pattern>, <args>) -> Boolean
```

#### Validator.getErrors

{k: (a -> Boolean)} -> {k: a} -> [Object]

Returns list of errors for a validation pattern with values. Errors are objects with information about the original call. If no errors are found, the method returns an empty array.
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

{k: (a -> Boolean)} -> {k: a} -> IO a | {k: a}

Throws an error if any predicate returns false, otherwise returns the original input arguments.
```js

// Invalid args
Validator.validateOrThrow(<pattern>, <args>) -> Error

// Valid args
Validator.validateOrThrow(<pattern>, <args>) -> <args>
```

### Logical Utilities

Note: Some logical utilities must be called incrementally - `fn(v1)(v2)` - as shown in the examples below.

#### Validator.required

(a -> Boolean) -> {k: (a -> Boolean), required: true}

Returns an object that specifies the predicate and that the value is required. This should be used to denote that a property is required, since otherwise properties as assumed to be optional.
```js
var validateArgs = Validator.validate({
  title       : Validator.required(isString)
  description : isString
});

// when the validator is invoked, a title property must be supplied,
// while the description property is optional
```

#### Validator.isAll

[(a -> Boolean)] -> (a -> Boolean)

Returns a predicate that is satisfied if all supplied predicates are satisfied for the provided value.
```js
Validator.isAll(p1, p2, ...) -> Function
Validator.isAll(p1, p2, ...)(<value>) -> Boolean
```

#### Validator.isAny

[(a -> Boolean)] -> (a -> Boolean)

Returns a predicate that is satisfied if any of the supplied predicates are satisfied for the provided value.
```js
Validator.isAny(p1, p2, ...) -> Function
Validator.isAny(p1, p2, ...)(<value>) -> Boolean
```

#### Validator.isNot

(a -> Boolean) -> (a -> Boolean)

Returns a predicate that inverts the supplied predicate.
```js
Validator.isNot(p) -> Function
Validator.isNot(p)(<value>) -> Boolean
```

## TODO

* Add ability to insert custom error messages, and/or create custom error messages for custom predicates.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
