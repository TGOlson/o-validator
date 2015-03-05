'use strict';

var R = require('ramda');

// use below lodash functions for object support
// TODO: remove dependency on lodash
var _ = require('lodash');

var curry   = R.curry,
    compose = R.compose;


/**
 * Functional Utilities
 */
var Utils = {};

Utils.hasIn = R.flip(R.has);
Utils.mapValues = R.flip(_.mapValues);
Utils.pick = R.flip(_.pick);

Utils.is = curry(function(v1, v2) {
  return v1 === v2;
});

Utils.isUndefined = Utils.is(undefined);
Utils.isTrue      = Utils.is(true);
Utils.isFalse     = Utils.is(false);

Utils.isTypeOf = curry(function(v1, v2) {
  return Utils.is(typeof v2, v1);
});

Utils.toArray = function(o) {
  return Array.prototype.slice.call(o);
};

Utils.propIs = curry(function(predicate, property) {
  return compose(predicate, R.get(property));
});


Utils.propIsUndefined = Utils.propIs(Utils.isUndefined);
Utils.propIsFalse = Utils.propIs(Utils.is(false));
Utils.propIsTrue = Utils.propIs(Utils.is(true));

Utils.maybeTransform = function(predicate, transformer) {
  return R.cond(
    [predicate, transformer],
    [R.T,       R.I]
  );
};

Utils.isAll = function() {
  return R.allPass(Utils.toArray(arguments));
};

Utils.isAny = function() {
  return R.anyPass(Utils.toArray(arguments));
};


module.exports = Utils;
