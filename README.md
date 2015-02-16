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
  required: {
    title: validate.all(isString, isNotNull)
  },
  optional: {
    description: isString,
    isActive: isBoolean
  }
};

validate(pattern, {
  title: 'Hello',
  isActive: true
});
// => true
```

The validator runs each argument against the defined pattern, asserting a true outcome for each. Properties defined as required in the pattern must exist in the provided arguments and must return true for the provided predicate. Properties defined as optional will only be asserted against the predicate if present in the arguments.

Note, this module is best used with a functional library to provide predicates (`isString`, `isNotNull`, etc.), such as `lodash` or `ramda`.

See more complex usage in the [examples](https://github.com/TGOlson/validate/tree/master/examples).

## Available Methods

```js
/**
 * Validates a set of arguments against an argument pattern
 * Object -> Object -> Boolean
 */
validate

// Example:
validate(<pattern>, <args>) -> Boolean

// note: pattern must contain either or both a 'required' or 'optional' property,
// and must be an object in the form of:
// {
//   required: {<required-props>},
//   optional: {<optional-props>}
// }
```

```js
/**
 * Validates arguments, mandating each one defined in the pattern is present
 * Object -> Object -> Boolean
 */
validate.required

// Example:
validate.required(<pattern>, <args>) -> Boolean
```

```js
/**
 * Validates arguments, without requirement of all properties being present
 * Object -> Object -> Boolean
 */
validate.optional

// Example:
validate.optional(<pattern>, <args>) -> Boolean
```

```js
/**
 * Creates a pattern with required properties for the validator.
 * Object -> Object -> Object
 */
validate.createPattern

// Example:
validate.createPattern(<required-props>, <optional-props>) -> Object

// note: returned object will be a valid pattern for validation in the form of:
// {
//   required: {<required-props>},
//   optional: {<optional-props>}
// }
```

```js
/**
 * Asserts all supplied predicates return true for provided value
 * Predicates -> * -> Boolean
 */
validate.all

// Example
validate.all(p1, p2, ...) -> Function

var isValid = validate.all(p1, p2, ...);
isValid(<value>) -> Boolean

// note: validate.all must be called incrementally
// first, be passing in any list of predicates to match
// and then secondly, passing in a value to assert against the predicates
```

```js
/**
 * Asserts any supplied predicates return true for provided value
 * Predicates -> * -> Boolean
 */
validate.any

// Example
validate.any(p1, p2, ...) -> Function

var isValid = validate.any(p1, p2, ...);
isValid(<value>) -> Boolean

// note: validate.any must be called incrementally
// first, be passing in any list of predicates to match
// and then secondly, passing in a value to assert against the predicates
```

## TODO

* Remove dependency on lodash
* Expose common predicates on validator (for more user friendly usages)
