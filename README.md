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
  title: validate.required(isString)
  description: validate.isAll(isString, hasLengthGreaterThan(5)),
  isActive: isBoolean,
  tags: isArray
};

validate(pattern, {
  title: 'Hi There',
  description: 'This is a great post.',
  isActive: true
  // tags is undefined, which is ok - properties are assumed to be optional
});
// => true
```

The validator runs each argument against the defined validation pattern, asserting a true outcome for each. Properties defined in the validation pattern are assumed to be optional unless declared otherwise.

Note, this module is best used with a functional library to provide predicates (`isString`, `isNull`, etc.), such as `lodash` or `ramda`.

See more complex usage in the [examples](https://github.com/TGOlson/validate/tree/master/examples).

## Available Methods

#### validate

Object -> Object -> Boolean

Validates arguments against the provided pattern.
```js
// Example:
validate(<pattern>, <args>) -> Boolean
```

### Logical Utilities

#### validate.required

Predicate -> Predicate

Returns a predicate that is satisfied if the supplied predicate is satisfied and the provided value is defined.
```js
// Example:
validate.required(p) -> Function
validate.required(p)(<value>) -> Boolean

// note: validate.required must be called incrementally as shown in the example above
```

#### validate.optional

Object -> Object -> Boolean

Returns a predicate that is satisfied if the supplied predicate is satisfied or the provided value is undefined. Note: by default `validate` assumes all properties are optional. This is the shorthand equivalent to `isAny(isUndefined, p)`.
```js
// Example:
validate.optional(p) -> Function
validate.optional(p)(<value>) -> Boolean

// note: validate.optional must be called incrementally as shown in the example above
```

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

#### validate.isNot

Predicate -> Predicate

Returns a predicate that inverts the supplied predicate.
```js
// Example
validate.isNot(p) -> Function
validate.isNot(p)(<value>) -> Boolean

// note: validate.isNot must be called incrementally as shown in the example above
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
