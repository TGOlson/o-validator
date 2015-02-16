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

#### validate

Object -> Object -> Boolean

Validates a set of arguments against a defined argument pattern.
```js
// Example:
validate(<pattern>, <args>) -> Boolean

// note: pattern must contain either or both a 'required' or 'optional' property,
// and must be an object in the form of:
// {
//   required: {<required-props>},
//   optional: {<optional-props>}
// }
```

#### validate.required

Object -> Object -> Boolean

Validates arguments, mandating each one defined in the pattern is present. This method assume all properties are required, and therefore a `required` property is not necessary in the pattern.
```js
// Example:
validate.required(<pattern>, <args>) -> Boolean
```

#### validate.optional

Object -> Object -> Boolean

Validates arguments, without requirement of all properties being present. This method assume all properties are optional, and therefore an `optional` property is not necessary in the pattern.
```js
// Example:
validate.optional(<pattern>, <args>) -> Boolean
```

#### validate.createPattern

Object -> Object -> Object

Creates a pattern with provided properties for the validator.
```js
// Example:
validate.createPattern(<required-props>, <optional-props>) -> Object

// note: returned object will be a valid pattern for validation in the form of:
// {
//   required: {<required-props>},
//   optional: {<optional-props>}
// }
```

#### validate.all

Asserts all supplied predicates return true for provided value.

Predicates -> * -> Boolean
```js
// Example
validate.all(p1, p2, ...) -> Function

var isValid = validate.all(p1, p2, ...);
isValid(<value>) -> Boolean

// note: validate.all must be called incrementally
// first, be passing in any list of predicates to match
// and then secondly, passing in a value to assert against the predicates
```

#### validate.any

Asserts any supplied predicate will return true for provided value.

Predicates -> * -> Boolean
```js
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

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
