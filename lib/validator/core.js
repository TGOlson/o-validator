'use strict';

var R = require('ramda');

var Annotate = require('./annotate');
var Err      = require('./errors');


// keep success handler portion of API internal
// validation functions should (and will) always return original args
// unless other functionality is explicitly provided by this library
var validateWithHandlers = R.curry(function(successHandler, errorHandler, schema, props) {
  var results = Annotate.annotatePredicatesWithResults(schema, props);
  var errors = Err.getErrors(results);

  return R.isEmpty(errors) ? successHandler(props) : errorHandler(errors);
});


var validateWithErrorHandler = validateWithHandlers(R.identity);


// R.map(Annotate.annotateWithDefaultErrorMessage)
// Takes an error handling function and attatches default error messages to the output
var withDefaultErrorMessages = R.curry(function(f, xs) {
  return f(R.map(Annotate.annotateWithDefaultErrorMessage, xs));
});


module.exports = {
  validateWithHandlers     : validateWithHandlers,
  validateWithErrorHandler : validateWithErrorHandler,
  withDefaultErrorMessages : withDefaultErrorMessages
};
