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

The validater runs each argument against the defined pattern, asserting a true outcome for each. This library currently assumes all arguments are optional.

Note, this module is best used with a functional library to provide predicates (`isString`, `isNotNull`, etc.), such as `lodash` or `ramda'.

## TODO

* document additional helper methods (`all`, `any`)
* allow interface for defining required and optional args
* remove dependancy on lodash
* expose common predicates on validator (for more user friendly usages)
