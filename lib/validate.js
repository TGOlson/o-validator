'use strict';

var r = require('ramda');

/**
 * Aliased Helpers
 */
var curry   = r.curry,
    hasIn   = r.flip(r.has);

/**
 * Functional Helpers
 */
function everyKey(p, o) {
  return r.all(p, r.keys(o));
}

function hasAllKeysIn(o1, o2) {
  return everyKey(hasIn(o1), o2);
}

function isUndefined(v) {
  return v === undefined;
}

function toArray(o) {
  return Array.prototype.slice.call(o);
}

function wrapFunction(fn, name) {
  fn.fname = name;
  return fn;
}

/**
 * Constants
 */
var REQUIRED_FNAME = 'required',
    OPTIONAL_FNAME = 'optional',
    DEFAULT_ERROR_MESSAGE = 'Input arguments include illegal values or properties.';

/**
 * Validates arguments, mandating each property defined in the pattern is present.
 * Object -> Object -> Boolean
 */
var validate = curry(function(pattern, args) {
  return hasAllKeysIn(pattern, args) && everyKey(isValidArg(pattern, args), pattern);
});

var isValidArg = curry(function(pattern, args, key) {
  var getKey = r.prop(key),
      predicate = getKey(pattern) || r.always(false);

  return r.compose(wrapPredicate(predicate), getKey)(args);
});

function wrapPredicate(p) {
  return p.fname === REQUIRED_FNAME ? p : validate.optional(p);
}

/**
 * Throws an error if predicate returns false.
 * Predicate -> Object -> Boolean | Error
 */
validate.orThrow = curry(function(predicate, values) {
  return predicate(values) || throwDefaultError();
});

function throwDefaultError() {
  throw new Error(DEFAULT_ERROR_MESSAGE);
}

/**
 * Returns a predicate that is satisfied if the supplied predicate
 * is satisfied and the provided value is defined.
 * Predicate -> Predicate
 */
validate.required = function(p) {
  return wrapFunction(validate.isAll(p), REQUIRED_FNAME);
};

/**
 * Returns a predicate that is satisfied if the supplied predicate
 * is satisfied or the provided value is undefined.
 * Predicate -> Predicate
 */
validate.optional = function(p) {
  return wrapFunction(validate.isAny(isUndefined, p), OPTIONAL_FNAME);
};

/**
 * Returns a predicate that is satisfied if all
 * supplied predicates are satisfied for the provided value.
 * Predicates -> Predicate
 */
validate.isAll = function() {
  return r.allPass(toArray(arguments));
};

/**
 * Returns a predicate that is satisfied if any of the
 * supplied predicates are satisfied for the provided value.
 * Predicates -> Predicate
 */
validate.isAny = function() {
  return r.anyPass(toArray(arguments));
};

/**
 * Returns a predicate that is satisfied if the supplied predicate is not satisfied.
 * Predicates -> Predicate
 */
validate.isNot = curry(function(p, v) {
  return !p(v);
});

module.exports = validate;
