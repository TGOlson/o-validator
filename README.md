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
validate(<pattern>, <args>) -> Boolean
```

### Logical Utilities

Note: all logical utilities must be called incrementally (`fn(v1)(v2)`) as shown in the examples below.

#### validate.required

Predicate -> Predicate

Returns a predicate that is satisfied if the supplied predicate is satisfied and the provided value is not undefined. This should be used to denote that a property is required, since otherwise properties as assumed to be optional.
```js
validate.required(p) -> Function
validate.required(p)(<value>) -> Boolean
```

#### validate.optional

Predicate -> Predicate

Returns a predicate that is satisfied if the supplied predicate is satisfied or the provided value is undefined. Note: using this utility is probably not necessary to use often, since `validate` assumes all properties are optional by default. This is the shorthand equivalent to `isAny(isUndefined, p)`.
```js
validate.optional(p) -> Function
validate.optional(p)(<value>) -> Boolean

// note: validate.optional must be called incrementally as shown in the example above
```

#### validate.isAll

Predicates -> Predicate

Returns a predicate that is satisfied if all supplied predicates are satisfied for the provided value.
```js
validate.isAll(p1, p2, ...) -> Function
validate.isAll(p1, p2, ...)(<value>) -> Boolean
```

#### validate.isAny

Predicates -> Predicate

Returns a predicate that is satisfied if any of the supplied predicates are satisfied for the provided value.
```js
validate.isAny(p1, p2, ...) -> Function
validate.isAny(p1, p2, ...)(<value>) -> Boolean
```

#### validate.isNot

Predicate -> Predicate

Returns a predicate that inverts the supplied predicate.
```js
validate.isNot(p) -> Function
validate.isNot(p)(<value>) -> Boolean
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
