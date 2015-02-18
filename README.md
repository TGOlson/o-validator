# validate

Simple argument validator.

## Install

```
$ npm install validate
```
(note: node module not yet published)


Run the specs

```
$ jasmine-node spec/
```

## Usage


```js
var validate = require('validate');

var pattern = {
  title: validate.isAll(isString, isNotNull)
  description: validate.isOptional(isString),
  isActive: isBoolean
};

validate(pattern, {
  title: 'Hello',
  isActive: true
});
// => true
```

The validator runs each argument against the defined pattern, asserting a true outcome for each. Properties defined pattern are required to exist in the provided arguments and must return true for the provided predicate.

Note, this module is best used with a functional library to provide predicates (`isString`, `isNotNull`, etc.), such as `lodash` or `ramda`.

See more complex usage in the [examples](https://github.com/TGOlson/validate/tree/master/examples).

## Available Methods

### Core Validators

#### validate

Object -> Object -> Boolean

Validates arguments, mandating each property defined in the pattern is present.
```js
// Example:
validate(<pattern>, <args>) -> Boolean
```

#### validate.required

Object -> Object -> Boolean

Validates arguments, mandating each property defined in the pattern is present. Note: this is an alias for the `validate` method.
```js
// Example:
validate.required(<pattern>, <args>) -> Boolean
```

#### validate.optional

Object -> Object -> Boolean

Validates arguments, without requirement of all properties being present.
```js
// Example:
validate.optional(<pattern>, <args>) -> Boolean
```

### Logical Utilities

#### validate.isAll

Predicates -> Predicate

Returns a predicate that is satisfied if all supplied predicates are satisfied for the provided value.
```js
// Example
validate.isAll(p1, p2, ...) -> Function
validate.isAll(p1, p2, ...)(<value>) -> Boolean

// note: validate.isAll must be called incrementally as shown in the example above
```

#### validate.isAny

Predicates -> Predicate

Returns a predicate that is satisfied if any of the supplied predicates are satisfied for the provided value.
```js
// Example
validate.isAny(p1, p2, ...) -> Function
validate.isAny(p1, p2, ...)(<value>) -> Boolean

// note: validate.isAny must be called incrementally as shown in the example above
```

#### validate.isOptional

Predicate -> Predicate

Returns a predicate that is satisfied if the supplied predicate is satisfied or the provided value is undefined. Note: `isOptional(p)` is the shorthand equivalent to `isAny(isUndefined, p)`.
```js
// Example
validate.isOptional(p) -> Function
validate.isOptional(p)(<value>) -> Boolean

// note: validate.isOptional must be called incrementally as shown in the example above
```

#### validate.isNot

Predicate -> Predicate

Returns a predicate that inverts the supplied predicate.
```js
// Example
validate.isNot(p) -> Function
validate.isNot(p)(<value>) -> Boolean

// note: validate.isNot must be called incrementally as shown in the example above
```

## TODO

* Remove dependency on lodash
* Expose common predicates on validator (for more user friendly usages)

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
