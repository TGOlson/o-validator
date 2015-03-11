'use strict';

var R = require('ramda');

var Utils = {};

Utils.hasPropIn = R.flip(R.has);

Utils.isUndefined = R.eq(undefined);
Utils.isTrue      = R.eq(true);
Utils.isFalse     = R.eq(false);

Utils.propIs = R.curry(function(predicate, property) {
  return R.compose(predicate, R.get(property));
});

Utils.propIsTrue      = Utils.propIs(Utils.isTrue);
Utils.propIsFalse     = Utils.propIs(Utils.isFalse);
Utils.propIsUndefined = Utils.propIs(Utils.isUndefined);

Utils.maybeTransform = R.partialRight(R.ifElse, R.identity);

Utils.toArray = function(o) {
  return Array.prototype.slice.call(o);
};

Utils.partialWithArguments = function(fn) {
  return function() {
    return fn(Utils.toArray(arguments));
  };
};

Utils.isAll = Utils.partialWithArguments(R.allPass);

Utils.isAny = Utils.partialWithArguments(R.anyPass);

module.exports = Utils;
