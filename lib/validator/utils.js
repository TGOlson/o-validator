'use strict';

var R = require('ramda');

var hasPropIn = R.flip(R.has);

var propIs = R.curry(function(predicate, property) {
  return R.compose(predicate, R.prop(property));
});

var propIsTrue      = propIs(R.equals(true));
var propIsFalse     = propIs(R.equals(false));
var propIsUndefined = propIs(R.equals(undefined));

var maybeTransform = R.ifElse(R.__, R.__, R.identity);

module.exports = {
  hasPropIn       : hasPropIn,
  propIsTrue      : propIsTrue,
  propIsFalse     : propIsFalse,
  propIsUndefined : propIsUndefined,
  maybeTransform  : maybeTransform
};
