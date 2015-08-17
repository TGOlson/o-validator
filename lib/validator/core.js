'use strict';

var R = require('ramda');
var Err = require('./errors');
var Annotate = require('./annotate');


// keep success handler portion of API internal
// validation functions should (and will) always return original args unless other functionality is provided by this library
var makeValidationFnInternal = R.curry(function(successHandler, errorHandler, schema, props) {
  var results = Annotate.annotatePredicatesWithResults(schema, props);
  var errors = Err.getErrors(results);

  return R.isEmpty(errors) ? successHandler(props) : errorHandler(errors);
});

var makeValidationFn = makeValidationFnInternal(R.identity);

module.exports = {
  makeValidationFnInternal : makeValidationFnInternal,
  makeValidationFn         : makeValidationFn
};
