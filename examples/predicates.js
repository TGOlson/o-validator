'use strict';

var _ = require('lodash');

module.exports = {

  // export standard lodash methods
  isString : _.isString,
  isArray  : _.isArray,
  isDate   : _.isDate,
  isNull   : _.isNull,
  isNumber : _.isNumber,

  // expose additional composed logic
  hasLengthBetween : _.curry(function(min, max, v) {
    return v.length > min && v.length < max;
  }),

  // cheating a little here...
  isDateString : _.isString,
  isMarkdown   : _.isString,
  isMarkup     : _.isString,
};
