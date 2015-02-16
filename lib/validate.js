var r = require('ramda');

/**
 * Aliased Helpers
 */
var curry         = r.curry,
    compose       = r.compose,
    callWith      = r.flip(call),
    getFrom       = r.flip(r.get),
    hasIn         = r.flip(r.has),
    orAlwaysFalse = r.or(r.always(false)),
    orAlwaysTrue  = r.or(r.always(true)),

    // uses lodash.every because of compatibility with objects
    // TODO: refactor out dependency on lodash
    every = r.flip(require('lodash/collection/every'));

function call(fn, v) {
  return fn(v);
}

function log(v) {
  console.log(v);
  return v;
}

function hasAllPropsIn(o1, o2) {
  return every(hasIn(o1), r.keys(o2));
}

function pickFromKeys(o1, o2) {
  return r.pick(r.keys(o1) || [], o2);
}

/**
 * Validates a set of arguments against an argument pattern
 * Object -> Object -> Boolean
 */
var validate = curry(function(pattern, args) {
  if(!pattern.required && !pattern.optional) {

    // TODO: refactor to use optional as default
    throw new Error('Must provide at least one required or optional pattern.');
  }

  var parsedArgs = parseArgs(pattern, args);

  return hasAllArgsDeclaredInPattern(pattern, args) &&
         validate.required(pattern.required || {}, parsedArgs.required) &&
         validate.optional(pattern.optional || {}, parsedArgs.optional);
});

function _validate(pattern, args) {
  var isValid = curry(function(pattern, val, key) {
    return compose(callWith(val), orAlwaysFalse, getFrom(pattern))(key);
  });

  return every(isValid(pattern), args);
}

function parseArgs(pattern, args) {
  return {
    required: pickFromKeys(pattern.required, args),
    optional: pickFromKeys(pattern.optional, args)
  };
}

function hasAllArgsDeclaredInPattern(pattern, args) {
  var allPatterns = r.merge(pattern.required, pattern.optional);

  return hasAllPropsIn(allPatterns, args);
}

/**
 * Validates arguments, mandating each one defined in the pattern is present
 * Object -> Object -> Boolean
 */
validate.required = curry(function(pattern, args) {
  var hasAllProps = hasAllPropsIn(args, pattern);

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
