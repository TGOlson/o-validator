'use strict';

var r = require('ramda');

/**
 * Aliased Helpers
 */
var curry   = r.curry,
    compose = r.compose,
    hasIn   = r.flip(r.has),

    // use below lodash functions for object support
    // TODO: remove dependency on lodash
    mapValues = r.flip(require('lodash/object/mapValues')),
    pick = r.flip(require('lodash/object/pick'));

/**
 * Functional Helpers
 */
function everyKey(p, o) {
  return r.all(p, r.keys(o));
}

function hasAllKeysIn(o1, o2) {
  return everyKey(hasIn(o1), o2);
}

var is = curry(function(v1, v2) {
  return v1 === v2;
});

var isUndefined = is(undefined);

function toArray(o) {
  return Array.prototype.slice.call(o);
}

function not(v) {
  return !v;
}

function wrapFunction(fn, name) {
  fn.fname = name;
  return fn;
}

/**
 * Constants
 */
var REQUIRED_FNAME = 'required',
    OPTIONAL_FNAME = 'optional';

var getErrors = compose(buildErrorMessages, pick(is(false)), mapValuesByPattern);
var hasErrors = compose(not, r.isEmpty, getErrors);

/**
 * Validates arguments, mandating each property defined in the pattern is present.
 * Object -> Object -> Boolean
 */
var validate = curry(compose(not, hasErrors));


/**
 * Returns list of errors for a validation pattern with values.
 * Object -> Object -> Array
 */
validate.getErrors = curry(getErrors);

function mapValuesByPattern(pattern, values) {
  var additionalKeys = r.filter(validate.isNot(hasIn(pattern)), r.keys(values));

  var mappedValues = mapValues(isValidValue(values), pattern);

  additionalKeys.forEach(function(val) {
    mappedValues[val] = false;
  });

  return mappedValues;
}

var isValidValue = curry(function(values, predicate, key) {
  predicate = predicate || r.always(false);

  return compose(wrapPredicate(predicate), r.prop(key))(values);
});

function wrapPredicate(p) {
  return p.fname === REQUIRED_FNAME ? p : validate.optional(p);
}

function buildErrorMessages(failures) {
  return r.map(buildPropertyErrorMessage, r.keys(failures));
}

function buildPropertyErrorMessage(property) {
  return {
    property: property,
    message: 'Illegal or missing value for property: ' + property
  };
}

/**
 * Throws an error if predicate returns false.
 * Object -> Object -> null | Error
 */
validate.orThrow = curry(orThrow);

function orThrow(pattern, values) {
  var errors = validate.getErrors(pattern, values);

  // throw the first validation error - errors[0] - if errors are found
  return r.isEmpty(errors) ? null : throwArgError(errors[0]);
}

function throwArgError(error) {
  throw new Error(error.message);
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
validate.isNot = r.not;

module.exports = validate;
