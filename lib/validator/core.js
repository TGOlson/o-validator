'use strict';

var R = require('ramda');

var Err = require('./errors');


var annotatePredicate = R.curry(function(annotation, predicate) {
  return R.merge(annotation, {predicate : predicate});
});


var annotatePredicateAsRequired = annotatePredicate({required: true});
var annotatePredicateAsOptional = annotatePredicate({required: false});


var makeEmptyAnnotatedPredicate = R.always(annotatePredicateAsOptional(undefined));


var maybeAnnotatePredicate = R.ifElse(R.is(Function), annotatePredicateAsOptional, R.identity);


var annotatePredicateWithResult = R.curry(function(values, predicate, property) {
  var annotatedPredicate = maybeAnnotatePredicate(predicate);
  var value = values[property];

  return R.merge(annotatedPredicate, {
    value    : value,
    property : property,
    result   : annotatedPredicate.predicate ? annotatedPredicate.predicate(value) : undefined
  });
});


// [Predicate] -> [a] -> [AnnotatedPredicateWithResults]
function annotatePredicatesWithResults(predicates, values) {
  var unsupportedParameters = getUnsupportedParameters(predicates, values),
      allPredicates = R.merge(predicates, unsupportedParameters);

  return R.values(R.mapObjIndexed(annotatePredicateWithResult(values), allPredicates));
}


function getUnsupportedParameters(predicates, values) {

  // Find all the parameters that are defined in the value set, but not in the predicates
  // these will be the unsupported parameters
  var unSupportedParameters = R.filter(R.complement(R.has(R.__, predicates)), R.keys(values));

  return R.zipObj(unSupportedParameters, R.map(makeEmptyAnnotatedPredicate, unSupportedParameters));
}


function annotateWithDefaultErrorMessage(a) {
  return R.merge(a, {message: Err.getDefaultErrorMessage(a)});
}


// keep success handler portion of API internal
// validation functions should (and will) always return original args
// unless other functionality is explicitly provided by this library
var validateWithHandlers = R.curry(function(successHandler, errorHandler, schema, props) {
  var results = annotatePredicatesWithResults(schema, props);
  var errors = Err.getErrors(results);

  return R.isEmpty(errors) ? successHandler(props) : errorHandler(errors);
});


var validateWithErrorHandler = validateWithHandlers(R.identity);


var addDefaultErrorMessages = R.map(annotateWithDefaultErrorMessage);


module.exports = {
  validateWithHandlers        : validateWithHandlers,
  validateWithErrorHandler    : validateWithErrorHandler,
  addDefaultErrorMessages     : addDefaultErrorMessages,
  annotatePredicateAsRequired : annotatePredicateAsRequired,
};
