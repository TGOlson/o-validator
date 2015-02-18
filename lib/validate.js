var r = require('ramda');

/**
 * Aliased Helpers
 */
var curry   = r.curry,
    hasIn   = r.flip(r.has),
    getFrom = r.flip(r.prop),

    // uses lodash.mapValues because of compatibility with objects
    // TODO: refactor out dependency on lodash
    mapValues = r.flip(require('lodash/object/mapValues'));

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

/**
 * Validates arguments, mandating each property defined in the pattern is present.
 * Object -> Object -> Boolean
 */
var validate = curry(function(pattern, args) {
  return hasAllKeysIn(args, pattern) && _validate(pattern, args);
});

function _validate(pattern, args) {
  return hasAllKeysIn(pattern, args) && everyKey(isValidArg(pattern, args), args);
}

var isValidArg = curry(function(pattern, args, key) {
  return r.compose(r.prop(key, pattern), r.prop(key))(args);
});

/**
 * Validates arguments, mandating each property defined in the pattern is present.
 * Object -> Object -> Boolean
 */
validate.required = validate;

/**
 * Validates arguments, without requirement of all properties being present.
 * Object -> Object -> Boolean
 */
validate.optional = curry(function(pattern, args) {
  optionalPattern = mapValues(validate.isOptional, pattern);

  return _validate(optionalPattern, args);
});

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
 * Returns a predicate that is satisfied if the supplied predicate
 * is satisfied or the provided value is undefined.
 * Predicate -> Predicate
 */
validate.isOptional = function(p) {
  return validate.isAny(isUndefined, p);
};

/**
 * Returns a predicate that is satisfied if the supplied predicate is not satisfied.
 * Predicates -> Predicate
 */
validate.isNot = curry(function(p, v) {
  return !p(v);
});

module.exports = validate;
