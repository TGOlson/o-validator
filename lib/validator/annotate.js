'use strict';

var R = require('ramda');
var Utils = require('./utils');

/**
 * Predicate Annotators
 * These functions take in a predicate and annotate it with it's required value.
 * Annotated predicate in the form of:
 * {
 *   required: Boolean,
 *   predicate: Function
 * }
 */

 /**
  * Annotated Predicate Utilities
  * All of these functions operate on annotated predicates.
  * Annotated predicates are objects that always include a base predicate
  * and may include additional information about the current validation process.
  * An annotated predicate should be in the form of:
  * {
  *   required: Boolean,
  *   predicate: Function,
  *   value: *,
  *   property: String,
  *   result: Boolean | Nil
  * }
  */

var annotatePredicate = R.curry(function(annotation, predicate) {
  return R.merge(annotation, {predicate : predicate});
});

var annotatePredicateAsRequired = annotatePredicate({required: true});
var annotatePredicateAsOptional = annotatePredicate({required: false});

// () -> AnnotatedPredicate
var makeEmptyAnnotatedPredicate = R.always(annotatePredicateAsOptional(undefined));


// Predicate | AnnotatedPredicate -> AnnotatedPredicate {k: Predicate}
// This function assumes the predicate will be annotated as optional.
var maybeAnnotatePredicate = Utils.maybeTransform(R.is(Function), annotatePredicateAsOptional);

//
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

var annotatePredicateWithResult = R.curry(function(values, predicate, property) {
  var annotatedPredicate = maybeAnnotatePredicate(predicate);

  return annotateWithResult(annotatedPredicate, property, values[property]);
});

// [Predicate] -> [a] -> [AnnotatedPredicateWithResults]
function annotatePredicatesWithResults(predicates, values) {
  var unsupportedParameters = getUnsupportedParameters(predicates, values),
      allPredicates = R.merge(predicates, unsupportedParameters);

  return R.values(R.mapObjIndexed(annotatePredicateWithResult(values), allPredicates));
}

var annotateWithResult = R.curry(function(annotatedPredicate, property, value) {
  return R.merge(annotatedPredicate, {
    value    : value,
    property : property,
    result   : maybeInvokePredicate(annotatedPredicate, value)
  });
});

// {k: Predicate} -> a -> Boolean
function maybeInvokePredicate(annotatedPredicate, value) {
  return annotatedPredicate.predicate ? annotatedPredicate.predicate(value) : false;
}

function getUnsupportedParameters(predicates, values) {

  // Find all the parameters that are defined in the value set, but not in the predicates
  // these will be the unsupported parameters
  var unSupportedParameters = R.filter(R.complement(Utils.hasPropIn(predicates)), R.keys(values));

  return R.zipObj(unSupportedParameters, R.map(makeEmptyAnnotatedPredicate, unSupportedParameters));
}


module.exports = {
  annotatePredicateAsRequired    : annotatePredicateAsRequired,
  annotatePredicateAsOptional    : annotatePredicateAsOptional,
  annotatePredicate              : annotatePredicate,
  maybeAnnotatePredicate         : maybeAnnotatePredicate,
  annotatePredicatesWithResults  : annotatePredicatesWithResults
};
