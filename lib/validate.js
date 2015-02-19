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

function nameFunction(name, fn) {
  fn.fname = name;
  return fn;
}

/**
 * Constants
 */
var REQUIRED_FNAME = 'required',
    OPTIONAL_FNAME = 'optional';

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
 * Returns a predicate that is satisfied if the supplied predicate
 * is satisfied and the provided value is defined.
 * Predicate -> Predicate
 */
validate.required = function(p) {
  return nameFunction(REQUIRED_FNAME, validate.isAll(p));
};

/**
 * Returns a predicate that is satisfied if the supplied predicate
 * is satisfied or the provided value is undefined.
 * Predicate -> Predicate
 */
validate.optional = function(p) {
  return nameFunction(OPTIONAL_FNAME, validate.isAny(isUndefined, p));
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
