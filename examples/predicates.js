'use strict';

var R = require('ramda');

module.exports = {

  // export standard lodash methods
  isString : R.is(String),
  isArray  : R.is(Array),
  isDate   : R.is(Date),
  isNull   : R.eq(null),
  isNumber : R.is(Number),

  // expose additional composed logic
  hasLengthBetween : R.curry(function(min, max, v) {
    return v.length > min && v.length < max;
  }),

  // cheating a little here...
  isDateString : R.is(String),
  isMarkdown   : R.is(String),
  isMarkup     : R.is(String),
};
