var r = require('ramda');

/**
 * Aliased Helpers
 */
var curry         = r.curry,
    compose       = r.compose,
    callWith      = r.flip(call),
    getFrom       = r.flip(r.get),
    hasIn         = r.flip(r.has),
    orAlwaysFalse = or(r.always(false)),
    orAlwaysTrue  = or(r.always(true)),

    // uses lodash.every because of compatibility with object
    // TODO: refactor out dependency on lodash
    every    = r.flip(require('lodash').every);

function call(fn, v) {
  return fn(v);
}

function log(v) {
  console.log(v);
  return v;
}

function or(v2) {
  return function(v1) {
    return v1 || v2;
  };
}

/**
 * Validates a set of arguments against an argument pattern
 * Object -> Object -> Boolean
 */
var validate = curry(function(pattern, args) {
  if(!pattern.required && !pattern.optional) {

    // TODO: refactor to use optional as default
    throw new Error('Must provide at least one required or optional flag');
  }

  var requiredAreValid = true,
      optionalAreValid = true;

  if(pattern.required) {
    var requiredArgs = r.pick(r.keys(pattern.required), args);
    requiredAreValid = validate.required(pattern.required, requiredArgs);
  }

  if(pattern.optional) {
    var optionalArgs = r.pick(r.keys(pattern.optional), args);
    optionalAreValid = validate.optional(pattern.optional, optionalArgs);
  }

  // var hasNoAdditionalProps = every(hasIn(args), r.keys(pattern));

  // console.log(requiredAreValid, optionalAreValid);
  return requiredAreValid && optionalAreValid;
});

function _validate(pattern, args) {
  // console.log(pattern, args);
  var isValid = curry(function(pattern, val, key) {
    return compose(
      callWith(val),
      orAlwaysFalse,
      getFrom(pattern)
    )(key);
  });

  return every(isValid(pattern), args);
}

/**
 * Validates arguments, mandating each one defined in the pattern is present
 * Object -> Object -> Boolean
 */
validate.required = curry(function(pattern, args) {
  var hasAllProps = every(hasIn(args), r.keys(pattern));

  return hasAllProps && _validate(pattern, args);
});

/**
 * Validates arguments, without requirement of all properties being present
 * Object -> Object -> Boolean
 */
validate.optional = curry(function(pattern, args) {
  return _validate(pattern, args);
});

/**
 * Asserts all supplied predicates return true for provided value
 * Predicates -> * -> Boolean
 */
validate.all = function() {
  return r.allPass(arguments);
};

/**
 * Asserts any supplied predicates return true for provided value
 * Predicates -> * -> Boolean
 */
validate.any = function() {
  return r.anyPass(arguments);
};

module.exports = validate;
