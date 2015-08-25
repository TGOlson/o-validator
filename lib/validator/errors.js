'use strict';

var R = require('ramda');

var Constant = require('./constants');
var Result   = require('./results');


var errorCodes    = Constant.errorCodes;
var errorMessages = Constant.errorMessages;


var getErrorType = R.cond([
  [Result.isRequiredWithUndefinedValue,   R.always(errorCodes.REQUIRED)],
  [Result.hasUndefinedPredicate,          R.always(errorCodes.UNSUPPORTED)],
  [Result.hasDefinedValueWithFalseResult, R.always(errorCodes.VALUE)],
  [R.T,                                   R.always(errorCodes.UNKNOWN)]
]);


var annotateErrorCode = function(annotatedPredicate) {
  return {
    property  : annotatedPredicate.property,
    errorCode : getErrorType(annotatedPredicate),
  };
};


var getErrors = R.compose(
  R.map(annotateErrorCode),
  R.reject(Result.isPassingResult)
);


var getDefaultErrorPrefix = R.cond([
  [R.equals(errorCodes.REQUIRED),    R.always(errorMessages.REQUIRED)],
  [R.equals(errorCodes.UNSUPPORTED), R.always(errorMessages.UNSUPPORTED)],
  [R.equals(errorCodes.VALUE),       R.always(errorMessages.VALUE)],
  [R.equals(errorCodes.UNKNOWN),     R.always(errorMessages.UNKNOWN)]
]);


var getDefaultErrorMessage = function(annotatedPredicate) {
  return getDefaultErrorPrefix(annotatedPredicate.errorCode) + ' "' + annotatedPredicate.property + '"';
};


var throwError = function(msg) {
  throw new Error('Validation Error: ' + msg);
};


var throwValidationErrors = R.compose(throwError, R.join(', '), R.pluck('message'));


module.exports = {
  getErrors              : getErrors,
  throwValidationErrors  : throwValidationErrors,
  getDefaultErrorMessage : getDefaultErrorMessage
};
