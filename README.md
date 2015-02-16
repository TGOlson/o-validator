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

The validator runs each argument against the defined pattern, asserting a true outcome for each.

Note, this module is best used with a functional library to provide predicates (`isString`, `isNotNull`, etc.), such as `lodash` or `ramda`.

## Methods

```js
/**
 * Validates a set of arguments against an argument pattern
 * Object -> Object -> Boolean
 */
validate
```

```js
/**
 * Validates arguments, mandating each one defined in the pattern is present
 * Object -> Object -> Boolean
 */
validate.required
```

```js
/**
 * Validates arguments, without requirement of all properties being present
 * Object -> Object -> Boolean
 */
validate.optional
```

```js
/**
 * Creates a pattern with required properties for the validator.
 * Object -> Object -> Object
 */
validate.createPattern
```

```js
/**
 * Asserts all supplied predicates return true for provided value
 * Predicates -> * -> Boolean
 */
validate.all
```

```js
/**
 * Asserts any supplied predicates return true for provided value
 * Predicates -> * -> Boolean
 */
validate.any
```

## TODO

* Remove dependency on lodash
* Expose common predicates on validator (for more user friendly usages)
