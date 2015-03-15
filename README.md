# o-validator

Insanely simple and functional object validator.

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
  // tags are undefined - but that is ok, validator treats them as optional
});
// => true
```

The validator runs each argument against the defined validation pattern, asserting a true outcome for each. Properties defined in the validation pattern are assumed to be optional unless declared otherwise using `Validator.required`.

Note, this module is best used with a functional library to provide predicates (`isString`, `isNull`, etc.), such as `ramda` or `lodash`.

A more advanced example can also be found in the [examples directory](https://github.com/TGOlson/o-validator/tree/master/examples).

## Available Methods

* TODO: this is outdated - need to add new error handling methods

#### validate

Object -> Object -> Boolean

Validates arguments against the provided pattern.
```js
Validator.validate(<pattern>, <args>) -> Boolean
```

### Logical Utilities

Note: all logical utilities must be called incrementally (`fn(v1)(v2)`) as shown in the examples below.

#### required

Predicate -> Predicate

Returns a predicate that is satisfied if the supplied predicate is satisfied and the provided value is not undefined. This should be used to denote that a property is required, since otherwise properties as assumed to be optional.
```js
Validator.required(p) -> Function
Validator.required(p)(<value>) -> Boolean
```

#### optional

Predicate -> Predicate

Returns a predicate that is satisfied if the supplied predicate is satisfied or the provided value is undefined. Note: using this utility is probably not necessary to use often, since `validate` assumes all properties are optional by default. This is the shorthand equivalent to `isAny(isUndefined, p)`.
```js
Validator.optional(p) -> Function
Validator.optional(p)(<value>) -> Boolean
```

#### isAll

Predicates -> Predicate

Returns a predicate that is satisfied if all supplied predicates are satisfied for the provided value.
```js
Validator.isAll(p1, p2, ...) -> Function
Validator.isAll(p1, p2, ...)(<value>) -> Boolean
```

#### isAny

Predicates -> Predicate

Returns a predicate that is satisfied if any of the supplied predicates are satisfied for the provided value.
```js
Validator.isAny(p1, p2, ...) -> Function
Validator.isAny(p1, p2, ...)(<value>) -> Boolean
```

#### isNot

Predicate -> Predicate

Returns a predicate that inverts the supplied predicate.
```js
Validator.isNot(p) -> Function
Validator.isNot(p)(<value>) -> Boolean
```

## TODO

* Document new error handling methods.
* Add ability to insert custom error messages, and/or create custom error messages for custom predicates.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
