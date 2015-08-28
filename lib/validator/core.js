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


var annotateWithDefaultErrorMessage = function(a) {
  return R.merge(a, {message: Err.getDefaultErrorMessage(a)});
};


var getUnsupportedParameters = function(predicates, values) {
  return R.reject(R.has(R.__, predicates), R.keys(values));
};


// Function not to be exported as part of the public API
// all validators should act as an identity for successfull validations
// unless otherwise exposed by this library
// TODO: clean up this core function
var validateWithHandlers = R.curry(function(successHandler, errorHandler, schema, data) {

  // annotated predicate object {prop: {predicate: f, ...}}
  var annotatedPs = R.mapObj(maybeAnnotatePredicate, schema);

  // unsupported parameter list [prop, prop, ...]
  var unsupportedParameters = getUnsupportedParameters(annotatedPs, data);

  // unsupported parameter predicate object {prop: {predicate: f, ...}}
  var unsupportedParameterPs = R.mergeAll(
    R.map(R.createMapEntry(R.__, emptyAnnotatedPredicate), unsupportedParameters)
  );

  // all predicates object {prop: {predicate: f, ...}}
  var allPredicates = R.merge(annotatedPs, unsupportedParameterPs);

  // all predicates with prop annotations {prop: {predicate: f, property: prop, ...}}
  var allPredicatesWithProps = annotateWithPropVals(allPredicates, data);

  // predicate list [{predicate: f, property: prop, ...}, ...]
  // this is the ideal state for predicates
  // TODO: get to this format quicker
  var predList = R.values(allPredicatesWithProps);

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
