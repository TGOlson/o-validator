'use strict';

var R = require('ramda');
var Constants = require('./constants');
var AnnotatedPredicate = require('./annotated-predicate');

var errorCodes    = Constants.errorCodes,
    errorMessages = Constants.errorMessages;


// AnnotatedPredicateWithResults -> String
var getErrorType = R.cond([
  [AnnotatedPredicate.isRequiredWithUndefinedValue,   R.always(errorCodes.REQUIRED)],
  [AnnotatedPredicate.hasUndefinedPredicate,          R.always(errorCodes.UNSUPPORTED)],
  [AnnotatedPredicate.hasDefinedValueWithFalseResult, R.always(errorCodes.VALUE)],
  [R.T,                                               R.always(errorCodes.UNKNOWN)]
]);

var getErrorMessage = R.cond([
  [R.equals(errorCodes.REQUIRED),    R.always(errorMessages.REQUIRED)],
  [R.equals(errorCodes.UNSUPPORTED), R.always(errorMessages.UNSUPPORTED)],
  [R.equals(errorCodes.VALUE),       R.always(errorMessages.VALUE)]
]);


// AnnotatedPredicateWithResults -> String
var defaultErrorMessageBuilder = function(annotatedPredicate) {
  return getErrorMessage(annotatedPredicate.errorCode) + annotatedPredicate.property;
};

// // String -> String -> String
// var buildErrorMessage = function(errorType, property) {
//   return getErrorMessage(errorType) + property;
// };

// AnnotatedPredicateWithResults -> Object
function annotateErrorCode(annotatedPredicate) {
  // var errorCode = getErrorType(annotatedPredicate);
  // var message = annotatedPredicate.message || buildErrorMessage(errorCode, annotatedPredicate.property);

  return {
    property  : annotatedPredicate.property,
    errorCode : getErrorType(annotatedPredicate),
    // message   : message
  };
}

// [AnnotatedPredicateWithResults] -> [Object]
// var annotateErrorCodes = R.compose(R.map(annotateErrorCode), R.values);

// [AnnotatedPredicateWithResults] -> [Object]
var getErrors = R.compose(
  R.map(annotateErrorCode),
  R.filter(AnnotatedPredicate.hasInvalidResult)
);

  // annotatePredicatesWithResults

module.exports = {
  getErrors                  : getErrors,
  defaultErrorMessageBuilder : defaultErrorMessageBuilder
};
