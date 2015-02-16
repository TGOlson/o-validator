var _ = require('lodash');

var validate = require('../lib/validate');

/**
 * Validation Helpers
 */

function length(v) {
  return v.length;
}

var greaterThan = _.curry(function(v1, v2) {
  return v1 < v2;
});

var lessThan = _.curry(function(v1, v2) {
  return v1 > v2;
});

var lengthGreaterThan = _.curry(function(v1, v2) {
  return greaterThan(v1, length(v2));
});

var lengthLessThan = _.curry(function(v1, v2) {
  return lessThan(v1, length(v2));
});

/**
 * Arguments validator for post entities.
 */

exports.post = validate({
  required: {
    title: validate.all(_.isString, lengthGreaterThan(10), lengthLessThan(50)),
    author: _.isString,
    date: _.isDate
  },
  optional: {
    // TODO: add more props
  }
});
