'use strict';

var R = require('ramda');

var Err = require('./errors');


var annotate = R.curry(function(annotation, predicate) {
  return R.merge(annotation, {predicate : predicate});
});


var annotateAsRequired = annotate({required: true});
var annotateAsOptional = annotate({required: false});
var emptyAnnotatedPredicate = annotateAsOptional(undefined);


var maybeAnnotatePredicate = R.ifElse(R.is(Function), annotateAsOptional, R.identity);


var annotateWithResult = function(annotatedP) {
  return R.merge(annotatedP, {
    result: annotatedP.predicate ? annotatedP.predicate(annotatedP.value) : undefined
  });
};


var annotateWithPropVals = R.curry(function(annotatedPs, values) {
  return R.mapObjIndexed(function(pred, prop) {
    return R.merge(pred, {property: prop, value: values[prop]});
  }, annotatedPs);
});


var addUnsupportedParameters = function(predicates, values) {
  var unsupportedParameters = R.reject(R.has(R.__, predicates), R.keys(values));
  return R.assoc(unsupportedParameters, emptyAnnotatedPredicate, predicates);
};


var annotateWithDefaultErrorMessage = function(a) {
  return R.merge(a, {message: Err.getDefaultErrorMessage(a)});
};


var validateWithHandlers = R.curry(function(successHandler, errorHandler, schema, data) {
  var annotatedPs = R.mapObj(maybeAnnotatePredicate, schema);
  var allPredicates = addUnsupportedParameters(annotatedPs, data);
  var predList = R.values(annotateWithPropVals(allPredicates, data));

  var results = R.map(annotateWithResult, predList);
  var errors = Err.getErrors(results);

  return R.isEmpty(errors) ? successHandler(data) : errorHandler(errors);
});


var validateWithErrorHandler = validateWithHandlers(R.identity);


var addDefaultErrorMessages = R.map(annotateWithDefaultErrorMessage);


module.exports = {
  validateWithHandlers     : validateWithHandlers,
  validateWithErrorHandler : validateWithErrorHandler,
  addDefaultErrorMessages  : addDefaultErrorMessages,
  annotateAsRequired       : annotateAsRequired
};
