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
var is = curry(function(v1, v2) {
  return v1 === v2;
});

var isTypeOf = curry(function(v1, v2) {
  return typeof v2 === v1;
});

var isUndefined = is(undefined);

function toArray(o) {
  return Array.prototype.slice.call(o);
}

/**
 * Core Library Code
 */
var resultIsFalse = isAny(isRequiredWithMissingValue, hasUndefinedPredicate, hasValueAndFalseResult);

var getErrors = compose(buildErrorMessages, pick(resultIsFalse), mapValuesByPattern);


function isRequiredWithMissingValue(o) {
  return o.required && !o.value;
}

function hasUndefinedPredicate(o) {
  return isUndefined(o.predicate);
}

function hasValueAndFalseResult(o) {
  return !isUndefined(o.value) && o.result === false;
}

/**
 * Validates arguments, mandating each property defined in the pattern is present.
 * Object -> Object -> Boolean
 */
var validate = curry(compose(r.isEmpty, getErrors));


/**
 * Returns list of errors for a validation pattern with values.
 * Object -> Object -> Array
 */
validate.getErrors = curry(getErrors);

function mapValuesByPattern(pattern, values) {

  // Build error message for any additional keys
  var additionalKeys = r.filter(validate.isNot(hasIn(pattern)), r.keys(values));

  var mappedValues = mapValues(maybeAnnotatePredicate, pattern);

  mappedValues = mapValues(getResult(values), mappedValues);

  additionalKeys.forEach(function(val) {
    mappedValues[val] = {
      required: false,
      property: val,

      // set predicate to undefined for undeclared keys
      predicate: undefined,
      value: values[val],
      result: false
    };
  });

  return mappedValues;
}

var getResult = curry(function(values, predicateObj, key) {
  predicateObj = predicateObj || validate.optional(r.always(false));

  var value = values[key];

  predicateObj.value = value;
  predicateObj.property = key;
  predicateObj.result = predicateObj.predicate(value);

  return predicateObj;
});

function buildErrorMessages(failures) {
  return r.map(buildPropertyErrorMessage, r.values(failures));
}

function buildPropertyErrorMessage(annotatedPredicate) {
  var errorType = getErrorType(annotatedPredicate);

  return {
    property: annotatedPredicate.property,
    errorType: errorType,
    message: buildErrorMessage(errorType) + '"' + annotatedPredicate.property + '"'
  };
}

var getErrorType = r.cond(
  [isRequiredWithMissingValue, r.always('Required')],
  [hasUndefinedPredicate,      r.always('Unexpected')],
  [hasValueAndFalseResult,     r.always('Type')]
);

var buildErrorMessage = r.cond(
  [is('Required'),   r.always('Required value missing for property ')],
  [is('Unexpected'), r.always('Unexpected value for property ')],
  [is('Type'),       r.always('Illegal value for property ')]
);

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

var annotatePredicate = curry(function(required, predicate) {
  return {
    required: required,
    predicate: predicate
  };
});

/**
 * Returns an object that specifies the predicate and that it is required.
 * Predicate -> Object
 */
validate.required = annotatePredicate(true);

/**
 * Returns an object that specifies the predicate and that it is not required.
 * Predicate -> Object
 */
validate.optional = annotatePredicate(false);

/**
 * Returns a predicate that is satisfied if all
 * supplied predicates are satisfied for the provided value.
 * Predicates -> Predicate
 */
validate.isAll = isAll;

function isAll() {
  return r.allPass(toArray(arguments));
}

/**
 * Returns a predicate that is satisfied if any of the
 * supplied predicates are satisfied for the provided value.
 * Predicates -> Predicate
 */
validate.isAny = isAny;

function isAny() {
  return r.anyPass(toArray(arguments));
}

/**
 * Returns a predicate that is satisfied if the supplied predicate is not satisfied.
 * Predicates -> Predicate
 */
validate.isNot = r.not;

var maybeAnnotatePredicate = r.cond(
  [isTypeOf('object'), r.I],
  [r.T,                validate.optional]
);


module.exports = validate;
