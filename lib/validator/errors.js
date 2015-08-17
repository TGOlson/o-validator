'use strict';

var R = require('ramda');

var Constants = require('./constants');
var Result    = require('./result');


var errorCodes    = Constants.errorCodes,
    errorMessages = Constants.errorMessages;


// AnnotatedPredicateWithResults -> String
var getErrorType = R.cond([
  [Result.isRequiredWithUndefinedValue,   R.always(errorCodes.REQUIRED)],
  [Result.hasUndefinedPredicate,          R.always(errorCodes.UNSUPPORTED)],
  [Result.hasDefinedValueWithFalseResult, R.always(errorCodes.VALUE)],
  [R.T,                                   R.always(errorCodes.UNKNOWN)]
]);


// String -> String
var getDefaultErrorMessage = R.cond([
  [R.equals(errorCodes.REQUIRED),    R.always(errorMessages.REQUIRED)],
  [R.equals(errorCodes.UNSUPPORTED), R.always(errorMessages.UNSUPPORTED)],
  [R.equals(errorCodes.VALUE),       R.always(errorMessages.VALUE)],
  [R.equals(errorCodes.UNKNOWN),     R.always(errorMessages.UNKNOWN)]
]);


// AnnotatedPredicateWithResults -> String
var defaultErrorMessageBuilder = function(annotatedPredicate) {
  return getDefaultErrorMessage(annotatedPredicate.errorCode) + annotatedPredicate.property;
};


// AnnotatedPredicateWithResults -> AnnotatedPredicateWithResults
function annotateErrorCode(annotatedPredicate) {
  return {
    property  : annotatedPredicate.property,
    errorCode : getErrorType(annotatedPredicate),
  };
}


// [AnnotatedPredicateWithResults] -> [AnnotatedPredicateWithResults]
var getErrors = R.compose(
  R.map(annotateErrorCode),
  R.reject(Result.isPassingResult)
);


module.exports = {
  getErrors                  : getErrors,
  defaultErrorMessageBuilder : defaultErrorMessageBuilder
};
