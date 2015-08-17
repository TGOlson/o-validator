'use strict';

var R = require('ramda');
var Utils = require('./utils');

/**
 * Annotated Predicate Utilities
 * All of these functions operate on (or create) annotated predicates.
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

var pureLog = function(x) {console.log('Pure log: ', x); return x;};
var pureLogC = function(f) {return R.compose(pureLog, f);};
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
 //

 // AnnotatedPredicateWithResults -> Boolean
 var isRequiredWithUndefinedValue = R.allPass([
   Utils.propIsTrue('required'),
   Utils.propIsUndefined('value')
 ]);

 // AnnotatedPredicateWithResults -> Boolean
 var hasUndefinedPredicate = Utils.propIsUndefined('predicate');

 // AnnotatedPredicateWithResults -> Boolean
 var hasDefinedValue = R.complement(Utils.propIsUndefined('value'));

 var hasDefinedValueWithFalseResult = R.allPass([
   hasDefinedValue,
   Utils.propIsFalse('result')
 ]);


 var hasInvalidResult = R.anyPass([
   isRequiredWithUndefinedValue,
   hasUndefinedPredicate,
   hasDefinedValueWithFalseResult
 ]);

module.exports = {
  isRequiredWithUndefinedValue   : isRequiredWithUndefinedValue,
  hasUndefinedPredicate          : hasUndefinedPredicate,
  hasDefinedValueWithFalseResult : hasDefinedValueWithFalseResult,
  hasInvalidResult               : hasInvalidResult
  // annotatePredicateAsRequired    : annotatePredicateAsRequired,
  // annotatePredicateAsOptional    : annotatePredicateAsOptional,
  // annotatePredicate              : annotatePredicate,
  // maybeAnnotatePredicate         : maybeAnnotatePredicate
};
