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
  title: validate.all(isString, isNotNull)
  description: isString,
  isActive: isBoolean
};

validate(pattern, {
  title: 'Hello',
  isActive: true
});
// => true
```

The validater runs each argument against the defined pattern, asserting a true outcome for each. This library currently assumes all arguments are optional.

Note, this module is best used with a functional library to provide predicates (`isString`, `isNotNull`, etc.), such as `lodash` or `ramda`.

## Methods

```
validate
```

```
validate.required
```

```
validate.optional
```

```
validate.all
```

```
validate.any
```

## TODO

* document additional helper methods (`all`, `any`)
* allow interface for defining required and optional args
* remove dependancy on lodash
* expose common predicates on validator (for more user friendly usages)
