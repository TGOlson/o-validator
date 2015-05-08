'use strict';

var R = require('ramda');

var Utils     = require('./utils'),
    Constants = require('./constants');

var Validator = {};

/**
 * Predicate Annotators
 * These functions take in a predicate and annotate it with it's required value.
 * Annotated predicate in the form of:
 * {
 *   required: Boolean,
 *   predicate: Function
 * }
 */

// {k: a} -> Predicate -> AnnotatedPredicate {k: Predicate, k: a}
var annotatePredicate = R.curry(function(annotation, predicate) {
  return R.merge(annotation, {predicate : predicate});
});

var annotatePredicateAsRequired = annotatePredicate({required: true});
var annotatePredicateAsOptional = annotatePredicate({required: false});

// Predicate | AnnotatedPredicate -> AnnotatedPredicate {k: Predicate}
// This function assumes the predicate will be annotated as optional.
var maybeAnnotatePredicate = Utils.maybeTransform(R.is(Function), annotatePredicateAsOptional);


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

// AnnotatedPredicateWithResults -> Boolean
var isRequiredWithUndefinedValue = R.allPass([
  Utils.propIsTrue('required'),
  Utils.propIsUndefined('value')
]);

// AnnotatedPredicateWithResults -> Boolean
var hasUndefinedPredicate = Utils.propIsUndefined('predicate');

// AnnotatedPredicateWithResults -> Boolean
var hasDefinedValue = R.complement(Utils.propIsUndefined('value'));

var hasDefinedValueWithFalseResult = R.allPass([
  hasDefinedValue,
  Utils.propIsFalse('result')
]);

// AnnotatedPredicateWithResults -> Boolean
var hasInvalidResult = R.anyPass([
  isRequiredWithUndefinedValue,
  hasUndefinedPredicate,
  hasDefinedValueWithFalseResult
]);


/**
 * Error Utilities
 */

var errorCodes    = Constants.errorCodes,
    errorMessages = Constants.errorMessages;

// AnnotatedPredicateWithResults -> String
var getErrorType = R.cond(
  [isRequiredWithUndefinedValue,   R.always(errorCodes.REQUIRED)],
  [hasUndefinedPredicate,          R.always(errorCodes.UNSUPPORTED)],
  [hasDefinedValueWithFalseResult, R.always(errorCodes.VALUE)],
  [R.T,                            R.always(errorCodes.UNKNOWN)]
);

var getErrorMessage = R.cond(
  [R.eq(errorCodes.REQUIRED),    R.always(errorMessages.REQUIRED)],
  [R.eq(errorCodes.UNSUPPORTED), R.always(errorMessages.UNSUPPORTED)],
  [R.eq(errorCodes.VALUE),       R.always(errorMessages.VALUE)]
);

// String -> String -> String
var buildErrorMessage = function(errorType, property) {
  return getErrorMessage(errorType) + property;
};

// AnnotatedPredicateWithResults -> Object
function buildPropertyErrorMessage(annotatedPredicate) {
  var errorCode = getErrorType(annotatedPredicate);

  return {
    property  : annotatedPredicate.property,
    errorCode : errorCode,
    message   : buildErrorMessage(errorCode, annotatedPredicate.property)
  };
}

// [AnnotatedPredicateWithResults] -> [Object]
var buildErrorMessages = R.compose(R.map(buildPropertyErrorMessage), R.values);

// [AnnotatedPredicate] -> [Object]
var getErrors = R.compose(
  buildErrorMessages,
  R.pickBy(hasInvalidResult),
  annotatePredicatesWithResults
);

function throwError(error) {
  throw new Error(error.message);
}

function validateOrThrow(predicates, values) {
  var errors = getErrors(predicates, values);
  return R.isEmpty(errors) ? values : throwError(R.head(errors));
}

// {k: Predicate} -> a -> Boolean
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

// [a] -> Predicate -> String -> AnnotatedPredicate
var annotatePredicateWithResult = R.curry(function(values, predicate, property) {
  var annotatedPredicate = maybeAnnotatePredicate(predicate);

  return annotateWithResult(annotatedPredicate, property, values[property]);
});

// [Predicate] -> [a] -> [AnnotatedPredicateWithResults]
function annotatePredicatesWithResults(predicates, values) {
  var unsupportedParameters = getUnsupportedParameters(predicates, values),
      allPredicates = R.merge(predicates, unsupportedParameters);

  return R.mapObjIndexed(annotatePredicateWithResult(values), allPredicates);
}

// [Predicate] -> [a] -> [String]
function getUnsupportedParameters(predicates, values) {

  // Find all the parameters that are defined in the value set, but not in the predicates
  // these will be the unsupported parameters
  var unSupportedParameters = R.filter(R.complement(Utils.hasPropIn(predicates)), R.keys(values));

  return R.zipObj(unSupportedParameters, R.map(makeEmptyAnnotatedPredicate, unSupportedParameters));
}

// () -> AnnotatedPredicate
function makeEmptyAnnotatedPredicate() {
  return annotatePredicateAsOptional(undefined);
}


/**
 * Validates arguments against the provided pattern.
 * {k: Predicate} -> {k: a} -> Boolean
 */
Validator.validate = R.curry(R.compose(R.isEmpty, getErrors));


/**
 * Returns list of errors for a validation pattern with values.
 * {k: Predicate} -> {k: a} -> [Object]
 *
 * Error object is in the form of:
 * {
 *   property  : String,
 *   errorCode : String,
 *   message   : String
 * }
 */
Validator.getErrors = R.curry(getErrors);


/**
 * Throws an error if predicate returns false.
 * Otherwise returns the original arguments.
 * {k: Predicate} -> {k: a} -> Error a | {k: a}
 */
Validator.validateOrThrow = R.curry(validateOrThrow);


/**
 * Returns an object that specifies the predicate and that it is required.
 * Predicate -> {predicate: Predicate, required: true}
 */
Validator.required = annotatePredicateAsRequired;


/**
 * Returns an object that specifies the predicate and that it is not required.
 * Predicate -> {predicate: Predicate, required: false}
 */
// Note: this method is currently undocumented, as there is no real reason to
// explicitly declare a property as optional. By default all properties are assumed
// to be optional unless declared otherwise.
Validator.optional = annotatePredicateAsOptional;


module.exports = Validator;
