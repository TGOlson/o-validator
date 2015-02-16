var r = require('ramda');

/**
 * Aliased Helpers
 */
var curry = r.curry,
    hasIn = r.flip(r.has),

    // uses lodash.every because of compatibility with objects
    // TODO: refactor out dependency on lodash
    every = r.flip(require('lodash/collection/every'));

/**
 * Functional Helpers
 */
function hasAllPropsIn(o1, o2) {
  return every(hasIn(o1), r.keys(o2));
}

function pickFromKeys(o1, o2) {
  return r.pick(r.keys(o1) || [], o2);
}

function isUndefined(v) {
  return v === undefined;
}

/**
 * Library Constants
 */
var REQUIRED_SET_TYPE = 'required',
    OPTIONAL_SET_TYPE = 'optional';


/**
 * Validates a set of arguments against an argument pattern
 * Object -> Object -> Boolean
 */
var validate = curry(function(pattern, args) {

  // TODO: consider defaulting to optional args if no pattern type is defined.
  if(!pattern.required && !pattern.optional) {
    throw new Error('Must provide at least one required or optional pattern.');
  }

  var parsedArgs = parseArgs(pattern, args),
      validateParsedArgs = validateSet(pattern, parsedArgs);

  return hasAllPropsIn(mergePattern(pattern), args) &&
         validateParsedArgs(REQUIRED_SET_TYPE) &&
         validateParsedArgs(OPTIONAL_SET_TYPE);
});

function parseArgs(pattern, args) {
  return {
    required: pickFromKeys(pattern.required, args),
    optional: pickFromKeys(pattern.optional, args)
  };
}

var validateSet = curry(function(pattern, parsedArgs, setType) {
  return r.func(setType, validate, pattern[setType], parsedArgs[setType]);
});

function mergePattern(pattern) {
  return r.merge(pattern.required, pattern.optional);
}

function _validate(pattern, args) {
  var isValid = curry(function(args, predicate, key) {
    return validate.any(isUndefined, predicate)(args[key]);
  });

  return hasAllPropsIn(pattern, args) && every(isValid(args), pattern);
}

/**
 * Validates arguments, mandating each one defined in the pattern is present
 * Object -> Object -> Boolean
 */
validate.required = curry(function(pattern, args) {
  return hasAllPropsIn(args, pattern) && _validate(pattern, args);
});

/**
 * Validates arguments, without requirement of all properties being present
 * Object -> Object -> Boolean
 */
validate.optional = curry(_validate);

/**
 * Creates a pattern with required properties for the validator.
 * Object -> Object -> Object
 */
validate.createPattern = curry(function(required, optional) {
  return {
    required: required,
    optional: optional
  };
});

/**
 * Asserts all supplied predicates return true for provided value
 * Predicates -> * -> Boolean
 */
validate.all = function() {
  return r.allPass(arguments);
};

/**
 * Asserts any supplied predicates return true for provided value
 * Predicates -> * -> Boolean
 */
validate.any = function() {
  return r.anyPass(arguments);
};

module.exports = validate;
