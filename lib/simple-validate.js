'use strict';

var R = require('ramda');

var Utils   = require('./utils');

/**
 * Predicate Annotators
 * These functions take in a predicate and annotate it with it's required value.
 * Annotated predicate in the form of:
 * {
 *   required: Boolean,
 *   predicate: Function
 * }
 */

// Boolean -> (a -> Boolean) -> AnnotatedPredicate {k: (a -> Boolean)}
var annotatePredicate = R.curry(function(required, predicate) {
  return {
    required  : required,
    predicate : predicate
  };
});

// (a -> Boolean) | AnnotatedPredicate -> AnnotatedPredicate {k: (a -> Boolean)}
// This function assumes the predicate will be annotated as optional.
var maybeAnnotatePredicate = Utils.maybeTransform(R.is(Function), annotatePredicate(false));


/**
 * Annotated Predicate Inspectors
 * All of these functions take in an annotated predicate with results.
 * An annotated predicate with results should be in the form of:
 * {
 *   required: Boolean,
 *   predicate: Function,
 *   value: *,
 *   property: String,
 *   result: Boolean | Nil
 * }
 */
var REQUIRED_PROPERTY  = 'required',
    PREDICATE_PROPERTY = 'predicate',
    VALUE_PROPERTY     = 'value',
    RESULT_PROPERTY    = 'result';

// AnnotatedPredicateWithResults -> Boolean
var isRequiredWithUndefinedValue = Utils.isAll(
  Utils.propIsTrue(REQUIRED_PROPERTY),
  Utils.propIsUndefined(VALUE_PROPERTY)
);

// AnnotatedPredicateWithResults -> Boolean
var hasUndefinedPredicate = Utils.propIsUndefined(PREDICATE_PROPERTY);

// AnnotatedPredicateWithResults -> Boolean
var hasDefinedValueWithFalseResult = Utils.isAll(
  R.not(Utils.propIsUndefined(VALUE_PROPERTY)),
  Utils.propIsFalse(RESULT_PROPERTY)
);

// AnnotatedPredicateWithResults -> Boolean
var isInvalidResult = Utils.isAny(
  isRequiredWithUndefinedValue,
  hasUndefinedPredicate,
  hasDefinedValueWithFalseResult
);


/**
 * Error Utilities
 */
var ERROR_CODE_REQUIRED   = 'Required',
    ERROR_CODE_UNEXPECTED = 'Unsupported',
    ERROR_CODE_TYPE       = 'Value';

var getErrorMessage = R.cond(
  [R.eq(ERROR_CODE_REQUIRED),   R.always('Missing required parameter: ')],
  [R.eq(ERROR_CODE_UNEXPECTED), R.always('Unsupported parameter: ')],
  [R.eq(ERROR_CODE_TYPE),       R.always('Illegal value for parameter: ')]
);

// String -> String -> String
// R.useWith(R.concat, getErrorMessage, R.I);
var buildErrorMessage = function(errorType, property) {
  return getErrorMessage(errorType) + property;
};

// AnnotatedPredicateWithResults -> String
var getErrorType = R.cond(
  [isRequiredWithUndefinedValue,   R.always(ERROR_CODE_REQUIRED)],
  [hasUndefinedPredicate,          R.always(ERROR_CODE_UNEXPECTED)],
  [hasDefinedValueWithFalseResult, R.always(ERROR_CODE_TYPE)]
);

// AnnotatedPredicateWithResults -> Object
function buildPropertyErrorMessage(annotatedPredicate) {
  var errorCode = getErrorType(annotatedPredicate);

  return {
    property: annotatedPredicate.property,
    errorCode: errorCode,
    message: buildErrorMessage(errorCode, annotatedPredicate.property)
  };
}

// [AnnotatedPredicateWithResults] -> [Object]
var buildErrorMessages = R.compose(R.map(buildPropertyErrorMessage), R.values);

// [AnnotatedPredicate] -> [Object]
var getErrors = R.compose(
  buildErrorMessages,
  R.pickBy(isInvalidResult),
  annotatePredicatesWithResults
);

// {k: (a -> Boolean)} -> a -> Boolean
function maybeInvokePredicate(annotatedPredicate, value) {
  return annotatedPredicate.predicate ? annotatedPredicate.predicate(value) : false;
}

// AnnotatedPredicate -> String -> a -> AnnotatedPredicateWithResults
var annotateWithResult = R.curry(function(annotatedPredicate, property, value) {
  return R.merge(annotatedPredicate, {
    value    : value,
    property : property,
    result   : maybeInvokePredicate(annotatedPredicate, value)
  });
});

// [a] -> (a -> Boolean) -> String -> AnnotatedPredicate
var annotatePredicateWithResult = R.curry(function(values, predicate, property) {
  var annotatedPredicate = maybeAnnotatePredicate(predicate);

  return annotateWithResult(annotatedPredicate, property, values[property]);
});

// [(a -> Boolean)] -> [a] -> [AnnotatedPredicateWithResults]
function annotatePredicatesWithResults(predicates, values) {
  var unsupportedParameters = getUnsupportedParameters(predicates, values),
      allPredicates = R.merge(predicates, unsupportedParameters);

  return R.mapObjIndexed(annotatePredicateWithResult(values), allPredicates);
}

// [(a -> Boolean)] -> [a] -> [String]
function getUnsupportedParameters(predicates, values) {

  // find all the parameters that are defined in the value set, but not in the predicates
  // these will be the unsupported parameters
  var unSupportedParameters = R.filter(R.not(Utils.hasPropIn(predicates)), R.keys(values));

  return R.zipObj(unSupportedParameters, R.map(makeEmptyAnnotatedPredicate, unSupportedParameters));
}

// () -> AnnotatedPredicate
function makeEmptyAnnotatedPredicate() {
  return annotatePredicate(false, undefined);
}


/**
 * Validates arguments, mandating each property defined in the pattern is present.
 * {k: (a -> Boolean)} -> {k: a} -> Boolean
 */
var validate = R.curry(R.compose(R.isEmpty, getErrors));


/**
 * Returns list of errors for a validation pattern with values.
 * {k: (a -> Boolean)} -> {k: a} -> Array
 */
validate.getErrors = R.curry(getErrors);


/**
 * Throws an error if predicate returns false.
 * Otherwise returns the original arguments.
 * {k: (a -> Boolean)} -> {k: a} -> IO a
 */
validate.orThrow = R.curry(orThrow);

function orThrow(predicates, values) {
  var errors = validate.getErrors(predicates, values);
  return R.isEmpty(errors) ? values : throwError(R.head(errors));
}

function throwError(error) {
  throw new Error(error.message);
}

/**
 * Returns an object that specifies the predicate and that it is required.
 * Predicate -> Object
 * (a -> Boolean) -> {k: (a -> Boolean), required: true}
 */
validate.required = annotatePredicate(true);


/**
 * Returns an object that specifies the predicate and that it is not required.
 * (a -> Boolean) -> {k: (a -> Boolean), required: false}
 */
validate.optional = annotatePredicate(false);


/**
 * Returns a predicate that is satisfied if all
 * supplied predicates are satisfied for the provided value.
 * [(a -> Boolean)] -> (a -> Boolean)
 */
validate.isAll = Utils.isAll;


/**
 * Returns a predicate that is satisfied if any of the
 * supplied predicates are satisfied for the provided value.
 * [(a -> Boolean)] -> (a -> Boolean)
 */
validate.isAny = Utils.isAny;


/**
 * Returns a predicate that is satisfied if the supplied predicate is not satisfied.
 * (a -> Boolean) -> (a -> Boolean)
 */
validate.isNot = R.not;


module.exports = validate;
