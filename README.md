# validate

Simple argument validator.

## Usage

Run the specs

```
$ jasmine-node spec/
```

Use in a script

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

Note, this module is best used with a functional library to provide predicates, such as `lodash` or `ramda'.

`validate` currently assumes all arguments are optional.

## TODO

* document additional helper methods (`all`, `any`)
* allow interface for defining required and optional args
* remove dependancy on lodash
* expose common predicates on validator (for more user friendly usages)
