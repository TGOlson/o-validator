'use strict';

var r = require('ramda');

/**
 * Aliased Helpers
 */
var curry   = r.curry,
    compose = r.compose,
    hasIn   = r.flip(r.has),

    // use below lodash functions for object support
    // TODO: remove dependency on lodash
    mapValues = r.flip(require('lodash/object/mapValues')),
    pick = r.flip(require('lodash/object/pick'));

/**
 * Functional Helpers
 */
var is = curry(function(v1, v2) {
  return v1 === v2;
});

var isUndefined = is(undefined);

function toArray(o) {
  return Array.prototype.slice.call(o);
}

/**
 * Core Library Code
 */
var resultIsFalse = isAny(isRequiredWithMissingValue, hasUndefinedPredicate, hasValueAndFalseResult);

var getErrors = compose(buildErrorMessages, pick(resultIsFalse), mapValuesByPattern);


function isRequiredWithMissingValue(o) {
  return o.required && !o.value;
}

function hasUndefinedPredicate(o) {
  return isUndefined(o.predicate);
}

function hasValueAndFalseResult(o) {
  return !isUndefined(o.value) && o.result === false;
}

/**
 * Validates arguments, mandating each property defined in the pattern is present.
 * Object -> Object -> Boolean
 */
var validate = curry(compose(r.isEmpty, getErrors));


/**
 * Returns list of errors for a validation pattern with values.
 * Object -> Object -> Array
 */
validate.getErrors = curry(getErrors);

function mapValuesByPattern(pattern, values) {

  // Build error message for any additional keys
  var additionalKeys = r.filter(validate.isNot(hasIn(pattern)), r.keys(values));

  var mappedValues = mapValues(transformPredicateToObject, pattern);

  mappedValues = mapValues(getResult(values), mappedValues);

  additionalKeys.forEach(function(val) {
    mappedValues[val] = {
      required: false,

      // set predicate to undefined to undeclared keys
      predicate: undefined,
      value: values[val],
      result: false
    };
  });

  // console.log(mappedValues);

  return mappedValues;
}

function transformPredicateToObject(predicate) {
  if(typeof predicate === 'object') {
    return predicate;
  } else {
    return validate.optional(predicate);
  }
}

var getResult = curry(function(values, predicateObj, key) {
  predicateObj = predicateObj || validate.optional(r.always(false));

  var value = values[key];

  predicateObj.value = value;
  predicateObj.result = predicateObj.predicate(value);

  return predicateObj;
});

// function wrapPredicate(p) {
//   return p.fname === REQUIRED_FNAME ? p : validate.optional(p);
// }

function buildErrorMessages(failures) {
  // console.log(failures);
  return r.map(buildPropertyErrorMessage, r.keys(failures));
}

function buildPropertyErrorMessage(property) {
  return {
    property: property,
    message: 'Illegal or missing value for property: ' + property
  };
}

/**
 * Throws an error if predicate returns false.
 * Object -> Object -> null | Error
 */
validate.orThrow = curry(orThrow);

function orThrow(pattern, values) {
  var errors = validate.getErrors(pattern, values);

  // throw the first validation error - errors[0] - if errors are found
  return r.isEmpty(errors) ? null : throwArgError(errors[0]);
}

function throwArgError(error) {
  throw new Error(error.message);
}

/**
 * Returns a predicate that is satisfied if the supplied predicate
 * is satisfied and the provided value is defined.
 * Predicate -> Predicate
 */
validate.required = function(p) {
  // return wrapFunction(validate.isAll(p), REQUIRED_FNAME);
  return wrapPredicate(p, true);
};

/**
 * Returns a predicate that is satisfied if the supplied predicate
 * is satisfied or the provided value is undefined.
 * Predicate -> Predicate
 */
validate.optional = function(p) {
  // return wrapFunction(validate.isAny(isUndefined, p), OPTIONAL_FNAME);
  return wrapPredicate(p, false);
};

function wrapPredicate(predicate, required) {
  return {
    required: required,
    predicate: predicate
  };
}

/**
 * Returns a predicate that is satisfied if all
 * supplied predicates are satisfied for the provided value.
 * Predicates -> Predicate
 */
validate.isAll = isAll;

function isAll() {
  return r.allPass(toArray(arguments));
}

/**
 * Returns a predicate that is satisfied if any of the
 * supplied predicates are satisfied for the provided value.
 * Predicates -> Predicate
 */
validate.isAny = isAny;

function isAny() {
  return r.anyPass(toArray(arguments));
}

/**
 * Returns a predicate that is satisfied if the supplied predicate is not satisfied.
 * Predicates -> Predicate
 */
validate.isNot = r.not;

module.exports = validate;
