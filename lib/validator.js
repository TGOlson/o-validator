'use strict';

var R = require('ramda');

// var Utils = require('./utils');
    // Constants = require('./constants');

// var Validator = {};

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
// var annotatePredicate = R.curry(function(annotation, predicate) {
//   return R.merge(annotation, {predicate : predicate});
// });
//
// var annotatePredicateAsRequired = annotatePredicate({required: true});
// var annotatePredicateAsOptional = annotatePredicate({required: false});
//
// // Predicate | AnnotatedPredicate -> AnnotatedPredicate {k: Predicate}
// // This function assumes the predicate will be annotated as optional.
// var maybeAnnotatePredicate = Utils.maybeTransform(R.is(Function), annotatePredicateAsOptional);


// /**
//  * Annotated Predicate Inspectors
//  * All of these functions take in an annotated predicate with results.
//  * An annotated predicate with results should be in the form of:
//  * {
//  *   required: Boolean,
//  *   predicate: Function,
//  *   value: *,
//  *   property: String,
//  *   result: Boolean | Nil
//  * }
//  */
//
// // AnnotatedPredicateWithResults -> Boolean
// var isRequiredWithUndefinedValue = R.allPass([
//   Utils.propIsTrue('required'),
//   Utils.propIsUndefined('value')
// ]);
//
// // AnnotatedPredicateWithResults -> Boolean
// var hasUndefinedPredicate = Utils.propIsUndefined('predicate');
//
// // AnnotatedPredicateWithResults -> Boolean
// var hasDefinedValue = R.complement(Utils.propIsUndefined('value'));
//
// var hasDefinedValueWithFalseResult = R.allPass([
//   hasDefinedValue,
//   Utils.propIsFalse('result')
// ]);

// AnnotatedPredicateWithResults -> Boolean
// var hasInvalidResult = R.anyPass([
//   isRequiredWithUndefinedValue,
//   hasUndefinedPredicate,
//   hasDefinedValueWithFalseResult
// ]);


/**
 * Error Utilities
 */

// var errorCodes    = Constants.errorCodes,
//     errorMessages = Constants.errorMessages;
//
// // AnnotatedPredicateWithResults -> String
// var getErrorType = R.cond([
//   [isRequiredWithUndefinedValue,   R.always(errorCodes.REQUIRED)],
//   [hasUndefinedPredicate,          R.always(errorCodes.UNSUPPORTED)],
//   [hasDefinedValueWithFalseResult, R.always(errorCodes.VALUE)],
//   [R.T,                            R.always(errorCodes.UNKNOWN)]
// ]);
//
// var getErrorMessage = R.cond([
//   [R.equals(errorCodes.REQUIRED),    R.always(errorMessages.REQUIRED)],
//   [R.equals(errorCodes.UNSUPPORTED), R.always(errorMessages.UNSUPPORTED)],
//   [R.equals(errorCodes.VALUE),       R.always(errorMessages.VALUE)]
// ]);

// // String -> String -> String
// var buildErrorMessage = function(errorType, property) {
//   return getErrorMessage(errorType) + property;
// };
//
// // AnnotatedPredicateWithResults -> Object
// function annotateErrorCode(annotatedPredicate) {
//   // var errorCode = getErrorType(annotatedPredicate);
//   // var message = annotatedPredicate.message || buildErrorMessage(errorCode, annotatedPredicate.property);
//
//   return {
//     property  : annotatedPredicate.property,
//     errorCode : getErrorType(annotatedPredicate),
//     // message   : message
//   };
// }
//
// // [AnnotatedPredicateWithResults] -> [Object]
// var annotateErrorCodes = R.compose(R.map(annotateErrorCode), R.values);
//
// // [AnnotatedPredicate], [Values] -> [Object]
// var getErrors = R.compose(
//   annotateErrorCodes,
//   R.filter(hasInvalidResult),
//   annotatePredicatesWithResults
// );

// var getMessage = R.prop('message');
//
// function throwErrorMsg(msg) {
//   throw new Error(msg);
// }
//
// var throwError = R.compose(throwErrorMsg, getMessage);
//
// var throwErrors = R.compose(throwErrorMsg, R.join('; '), R.map(getMessage));
//
// function valuesOrInvokeWithErrors(predicates, values, f) {
//   var errors = getErrors(predicates, values);
//   return R.isEmpty(errors) ? values : f(errors);
// }
//
// function validateOrThrow(predicates, values) {
//   return valuesOrInvokeWithErrors(predicates, values, R.compose(throwError, R.head));
// }
//
// function validateOrThrowAll(predicates, values) {
//   return valuesOrInvokeWithErrors(predicates, values, throwErrors);
// }

// // {k: Predicate} -> a -> Boolean
// function maybeInvokePredicate(annotatedPredicate, value) {
//   return annotatedPredicate.predicate ? annotatedPredicate.predicate(value) : false;
// }

// AnnotatedPredicate -> String -> a -> AnnotatedPredicateWithResults
// var annotateWithResult = R.curry(function(annotatedPredicate, property, value) {
//   return R.merge(annotatedPredicate, {
//     value    : value,
//     property : property,
//     result   : maybeInvokePredicate(annotatedPredicate, value)
//   });
// });

// {k: a} -> Predicate -> String -> AnnotatedPredicate
// var annotatePredicateWithResult = R.curry(function(values, predicate, property) {
//   var annotatedPredicate = maybeAnnotatePredicate(predicate);
//
//   return annotateWithResult(annotatedPredicate, property, values[property]);
// });
//
// // [Predicate] -> [a] -> [AnnotatedPredicateWithResults]
// function annotatePredicatesWithResults(predicates, values) {
//   var unsupportedParameters = getUnsupportedParameters(predicates, values),
//       allPredicates = R.merge(predicates, unsupportedParameters);
//
//   return R.values(R.mapObjIndexed(annotatePredicateWithResult(values), allPredicates));
// }

// [Predicate] -> [a] -> [String]
// function getUnsupportedParameters(predicates, values) {
//
//   // Find all the parameters that are defined in the value set, but not in the predicates
//   // these will be the unsupported parameters
//   var unSupportedParameters = R.filter(R.complement(Utils.hasPropIn(predicates)), R.keys(values));
//
//   return R.zipObj(unSupportedParameters, R.map(makeEmptyAnnotatedPredicate, unSupportedParameters));
// }
//
// // () -> AnnotatedPredicate
// var makeEmptyAnnotatedPredicate = R.always(annotatePredicateAsOptional(undefined));


var Core = require('./validator/core');
var Annotate = require('./validator/annotate');
var Err = require('./validator/errors');


function annotateWithDefaultErrorMessage(a) {
  return R.merge(a, {message: Err.defaultErrorMessageBuilder(a)});
}


module.exports = {

  /**
   * Returns list of errors for a validation pattern with values.
   * Errors include messages generated by the default error message builder.
   * {k: Predicate} -> {k: a} -> [Object]
   *
   * Error object is in the form of:
   * {
   *   property  : String,
   *   errorCode : String,
   *   message   : String
   * }
   */
   getErrors : Core.makeValidationFnInternal(R.always([]), R.map(annotateWithDefaultErrorMessage)),


  /**
   * Validates arguments against the provided pattern.
   * {k: Predicate} -> {k: a} -> Boolean
   */
   validate : Core.makeValidationFnInternal(R.T, R.F),


   /**
    * Throws a list of errors if predicate returns false.
    * Otherwise returns the original arguments.
    * {k: Predicate} -> {k: a} -> Error | {k: a}
    */
  //  Validator.validateOrThrow = R.curry(validateOrThrowAll),


  /**
   * Returns an object that specifies the predicate and that it is required.
   * Predicate -> {predicate: Predicate, required: true}
   */
  required : Annotate.annotatePredicateAsRequired,


  /**
   * Returns an object that specifies the predicate and that it is not required.
   * Predicate -> {predicate: Predicate, required: false}
   */
  // Note: this method is currently undocumented, as there is no real reason to
  // explicitly declare a property as optional. By default all properties are assumed
  // to be optional unless declared otherwise.
  optional : Annotate.annotatePredicateAsOptional,

};

/**
 * Returns list of errors for a validation pattern with values.
 * Errors include messages generated by the default error message builder.
 * {k: Predicate} -> {k: a} -> [Object]
 *
 * Error object is in the form of:
 * {
 *   property  : String,
 *   errorCode : String,
 *   message   : String
 * }
 */
// Validator.getErrors = R.curry(getErrors);


/**
 * Throws a list of errors if predicate returns false.
 * Otherwise returns the original arguments.
 * {k: Predicate} -> {k: a} -> Error | {k: a}
 */
// Validator.validateOrThrow = R.curry(validateOrThrowAll);

//
// /**
//  * Otherwise returns the original arguments.
//  * {k: Predicate} -> {k: a} -> Error | {k: a}
//  */
// Validator.validateOrThrowAll = R.curry(validateOrThrowAll);



/**
 * Creates an object that specifies the custom validation rules.
 * Note: a predicate must be supplied
 * {predicate: p, ...k: v} -> Error | {predicate: p, ...k: v}
 */
// Use the validator to validate custom annotations!
// Validator.custom = Validator.validateOrThrow({
//   predicate : Validator.required(R.is(Function)),
//   message   : R.is(String),
//   required  : R.is(Boolean)
// });

// var defaultErrorMessageBuilder = function(annotatedPredicate) {
//   return getErrorMessage(annotatedPredicate.errorCode) + annotatedPredicate.property;
// };

// keep success handler portion of API internal
// validation functions should (and will) always return original args unless other functionality is provided by this library
// var makeValidationFnInternal = R.curry(function(successHandler, errorHandler, errorHandler, schema, props) {
//
// });
//
// var makeValidationFn = R.curry(function(errorHandler, errorHandler, schema, props) {
//   var errors = getErrors(schema, props);
//
//   return R.isEmpty(errors) ? props : errorHandler(errors);
// });


// module.exports = Validator;
