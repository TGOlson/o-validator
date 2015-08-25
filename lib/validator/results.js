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


 var isRequiredWithUndefinedValue = R.allPass([
   R.propEq('required', true),
   R.propEq('value', undefined)
 ]);


 var hasUndefinedPredicate = R.propEq('predicate', undefined);


 var hasDefinedValueWithFalseResult = R.allPass([
   R.complement(R.propEq('value', undefined)),
   R.propEq('result', false)
 ]);


 var satisfiedPredicate = R.propEq('result', true);


 var isOptionallyOmmitted = R.allPass([R.propEq('required', false), R.propEq('value', undefined)]);


var isPassingResult = R.anyPass([satisfiedPredicate, isOptionallyOmmitted]);


module.exports = {
  isRequiredWithUndefinedValue   : isRequiredWithUndefinedValue,
  hasUndefinedPredicate          : hasUndefinedPredicate,
  hasDefinedValueWithFalseResult : hasDefinedValueWithFalseResult,
  isPassingResult                : isPassingResult
};
