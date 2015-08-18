'use strict';

var R = require('ramda');


/**
 * Annotated Predicate with Result Utilities
 * All of these functions operate on annotated predicates after the results have been annotated.
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


 // AnnotatedPredicateWithResults -> Boolean
 var isRequiredWithUndefinedValue = R.allPass([
   R.propEq('required', true),
   R.propEq('value', undefined)
 ]);


 // AnnotatedPredicateWithResults -> Boolean
 var hasUndefinedPredicate = R.propEq('predicate', undefined);


 // AnnotatedPredicateWithResults -> Boolean
 var hasDefinedValueWithFalseResult = R.allPass([
   R.complement(R.propEq('value', undefined)),
   R.propEq('result', false)
 ]);


 // AnnotatedPredicateWithResults -> Boolean
 var satisfiedPredicate = R.propEq('result', true);


 // AnnotatedPredicateWithResults -> Boolean
 var isOptionallyOmmitted = R.allPass([R.propEq('required', false), R.propEq('value', undefined)]);


 // AnnotatedPredicateWithResults -> Boolean
var isPassingResult = R.anyPass([satisfiedPredicate, isOptionallyOmmitted]);


module.exports = {
  isRequiredWithUndefinedValue   : isRequiredWithUndefinedValue,
  hasUndefinedPredicate          : hasUndefinedPredicate,
  hasDefinedValueWithFalseResult : hasDefinedValueWithFalseResult,
  isPassingResult                : isPassingResult
};
