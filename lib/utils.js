'use strict';

var R = require('ramda');

var hasPropIn = R.flip(R.has);

var isUndefined = R.eq(undefined);
var isTrue      = R.eq(true);
var isFalse     = R.eq(false);

var propIs = R.curry(function(predicate, property) {
  return R.compose(predicate, R.prop(property));
});

var propIsTrue      = propIs(isTrue);
var propIsFalse     = propIs(isFalse);
var propIsUndefined = propIs(isUndefined);

var maybeTransform = R.partialRight(R.ifElse, R.identity);

function toArray(o) {
  return Array.prototype.slice.call(o);
}

function partialWithArguments(fn) {
  return function() {
    return fn(toArray(arguments));
  };
}

var isAll = partialWithArguments(R.allPass);

var isAny = partialWithArguments(R.anyPass);

module.exports = {
  hasPropIn: hasPropIn,
  propIsTrue: propIsTrue,
  propIsFalse: propIsFalse,
  propIsUndefined: propIsUndefined,
  maybeTransform: maybeTransform,
  isAll: isAll,
  isAny: isAny
};
