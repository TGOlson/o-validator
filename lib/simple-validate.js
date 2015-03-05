'use strict';

var R = require('ramda');

var Utils = require('./utils');

/**
 * Aliased Helpers
 */
var curry   = R.curry,
    compose = R.compose;


/**
 *
 * Core Library Code
 *
 */


/**
 * Predicate Annotators
 */

var annotatePredicate = curry(function(required, predicate) {
  return {
    required: required,
    predicate: predicate
  };
});

// Defaults to annotating predicate as optional
var maybeAnnotatePredicate = Utils.maybeTransform(R.is(Function), annotatePredicate(false));


/**
 * Annotated Predicate Inspectors
 */
var REQUIRED_PROP_NAME  = 'required',
    PREDICATE_PROP_NAME = 'predicate',
    VALUE_PROP_NAME     = 'value',
    RESULT_PROP_NAME    = 'result';

var isRequiredWithUndefinedValue = Utils.isAll(
  Utils.propIsTrue(REQUIRED_PROP_NAME),
  Utils.propIsUndefined(VALUE_PROP_NAME)
);

var hasUndefinedPredicate = Utils.propIsUndefined(PREDICATE_PROP_NAME);

var hasDefinedValueWithFalseResult = Utils.isAll(
  R.not(Utils.propIsUndefined(VALUE_PROP_NAME)),
  Utils.propIsFalse(RESULT_PROP_NAME)
);

var isInvalidProperty = Utils.isAny(
  isRequiredWithUndefinedValue,
  hasUndefinedPredicate,
  hasDefinedValueWithFalseResult
);


/**
 * Error Utilities
 */
var REQUIRED_ERROR_CODE   = 'Required',
    UNEXPECTED_ERROR_CODE = 'Unexpected',
    TYPE_ERROR_CODE       = 'Type';

var errorMessages = {};

errorMessages[REQUIRED_ERROR_CODE]   = 'Required value missing for property ';
errorMessages[UNEXPECTED_ERROR_CODE] = 'Unexpected value for property ';
errorMessages[TYPE_ERROR_CODE]       = 'Illegal value for property ';

var buildErrorMessage = function(errorType, property) {
  return errorMessages[errorType] + '"' + property + '"';
};

var getErrorType = R.cond(
  [isRequiredWithUndefinedValue,   R.always(REQUIRED_ERROR_CODE)],
  [hasUndefinedPredicate,          R.always(UNEXPECTED_ERROR_CODE)],
  [hasDefinedValueWithFalseResult, R.always(TYPE_ERROR_CODE)]
);

function buildPropertyErrorMessage(annotatedPredicate) {
  var errorCode = getErrorType(annotatedPredicate);

  return {
    property: annotatedPredicate.property,
    errorCode: errorCode,
    message: buildErrorMessage(errorCode, annotatedPredicate.property)
  };
}

var buildErrorMessages = compose(R.map(buildPropertyErrorMessage), R.values);

var getErrors = compose(
  buildErrorMessages,
  Utils.pick(isInvalidProperty),
  mapValuesByPattern
);


/**
 * Validates arguments, mandating each property defined in the pattern is present.
 * Object -> Object -> Boolean
 */
var validate = curry(compose(R.isEmpty, getErrors));


/**
 * Returns list of errors for a validation pattern with values.
 * Object -> Object -> Array
 */
validate.getErrors = curry(getErrors);

var getResult = curry(function(values, predicateObj, key) {
  predicateObj = predicateObj || validate.optional(R.always(false));

  var value = values[key];

  predicateObj.value = value;
  predicateObj.property = key;
  predicateObj.result = predicateObj.predicate(value);

  return predicateObj;
});

function mapValuesByPattern(pattern, values) {

  // Build error message for any additional keys
  var additionalKeys = R.filter(validate.isNot(Utils.hasIn(pattern)), R.keys(values));

  var mappedValues = Utils.mapValues(maybeAnnotatePredicate, pattern);

  mappedValues = Utils.mapValues(getResult(values), mappedValues);

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


/**
 * Throws an error if predicate returns false.
 * Object -> Object -> null | Error
 */
validate.orThrow = curry(orThrow);

function orThrow(pattern, values) {
  var errors = validate.getErrors(pattern, values);

  // throw the first validation error if errors are found
  return R.isEmpty(errors) ? null : throwArgError(R.head(errors));
}

function throwArgError(error) {
  throw new Error(error.message);
}


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
validate.isAll = Utils.isAll;

/**
 * Returns a predicate that is satisfied if any of the
 * supplied predicates are satisfied for the provided value.
 * Predicates -> Predicate
 */
validate.isAny = Utils.isAny;

/**
 * Returns a predicate that is satisfied if the supplied predicate is not satisfied.
 * Predicates -> Predicate
 */
validate.isNot = R.not;


module.exports = validate;
