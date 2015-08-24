'use strict';

var R = require('ramda');

var Constant = require('./validator/constants');
var Core     = require('./validator/core');
var Err      = require('./validator/errors');


/**
 * Types:
 *
 * Predicate :: a -> Boolean
 * Schema :: {k: Predicate}
 * ErrorObject :: {property: String, errorCode: String}
 * ErrorObjectWithMessage :: {property: String, errorCode: String, message: String}
 */


module.exports = {


  /**
   * Validates a data object against the provided schema, returning a boolean
   * value to indicate if the arguments were valid.
   *
   * Schema -> Object -> Boolean
   */
   validate : Core.validateWithHandlers(R.T, R.F),


   /**
    * Returns a list of validation errors produced from validating the data
    * object against the provided schema. Error objects contain information
    * about the validation error, including the offending property, and what
    * sort of validation error occurred (see `Validator.errorCodes`). If no
    * errors are found, the method returns an empty array.
    *
    * Schema -> Object -> [ErrorObjectWithMessage]
    */
   getErrors : Core.validateWithHandlers(R.always([]), Core.addDefaultErrorMessages),


   /**
    * Throws an error containing information about any validation errors, if
    * found. Otherwise returns the original input arguments.
    * Schema -> Object -> Error or Object
    */
   validateOrThrow : Core.validateWithErrorHandler(
     R.compose(Err.throwValidationErrors, Core.addDefaultErrorMessages)),


  /**
   * Low level function for creating a validation with a custom error handler.
   * Invokes the supplied error handler if any validation errors are found,
   * otherwise returns the original arguments. Error handling function will be
   * passed an array of `ErrorObject`s.
   *
   * ([ErrorObject] -> a) -> Schema -> Object -> a or Object
   */
  validateWithErrorHandler : Core.validateWithErrorHandler,


  /**
   * Utility function that adds default error messages to a list of errors.
   *
   * [ErrorObject] -> [ErrorObjectWithMessage]
   */
  addDefaultErrorMessages : Core.addDefaultErrorMessages,


  /*
   * Error codes that define the type of validation error that was found. Used
   * to populate `ErrorObject.errorCode`.
   *
   * {k: string}
   */
  errorCodes : Constant.errorCodes,


  /**
   * Specifies that a property in the schema is required.
   *
   * (type not exposed, implementation details are internal to this library)
   */
  required : Core.annotatePredicateAsRequired
};
