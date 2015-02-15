var r = require('ramda'),
    curry = r.curry,
    compose = r.compose;

var validate = curry(function(pattern, args) {
  return every(isValid(pattern), args);
});

var isValid = curry(function(pattern, val, key) {
  return compose(callWith(val), r.or(r.always(false)), getFrom(pattern))(key);
});

function every(callback, args) {
  // TODO: refactor to remove lodash
  return require('lodash').every(args, callback);
}

var call = curry(function(fn, v) {
  return fn(v);
});

var callWith = r.flip(call);

var getFrom = r.flip(r.get);

validate.all = function() {
  return r.allPass(arguments);
};

validate.any = function() {
  return r.anyPass(arguments);
};

module.exports = validate;
