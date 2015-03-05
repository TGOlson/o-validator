'use strict';

var R = require('ramda'),
    curry   = R.curry,
    compose = R.compose;

// use lodash functions for object support
// TODO: remove dependency on lodash
var _ = require('lodash');

var Utils = {};

Utils.hasIn     = R.flip(R.has);
Utils.mapValues = R.flip(_.mapValues);
Utils.pick = R.flip(_.pick);

Utils.is = curry(function(v1, v2) {
  return v1 === v2;
});

Utils.isUndefined = Utils.is(undefined);
Utils.isTrue      = Utils.is(true);
Utils.isFalse     = Utils.is(false);

Utils.toArray = function(o) {
  return Array.prototype.slice.call(o);
};

Utils.propIs = curry(function(predicate, property) {
  return compose(predicate, R.get(property));
});

Utils.propIsTrue      = Utils.propIs(Utils.isTrue);
Utils.propIsFalse     = Utils.propIs(Utils.isFalse);
Utils.propIsUndefined = Utils.propIs(Utils.isUndefined);

Utils.maybeTransform = R.partialRight(R.ifElse, R.identity);

Utils.partialWithArguments = function(fn) {
  return function() {
    return fn(Utils.toArray(arguments));
  };
};

Utils.isAll = Utils.partialWithArguments(R.allPass);

Utils.isAny = Utils.partialWithArguments(R.anyPass);

module.exports = Utils;
