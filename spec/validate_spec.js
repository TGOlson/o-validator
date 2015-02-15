var _ = require('lodash');

var validate = require('../lib/validate');

describe('validate', function() {
  var pattern,
      args,
      result;

  beforeEach(function() {
    pattern = {
      title: _.isString,
      description: _.isString,
      isActive: _.isBoolean
    };

    args = {
      title: 'Hello',
      isActive: true
    };
  });

  it('should return true if all provided arguments are valid', function() {
    result = validate(pattern, args);
    expect(result).toBe(true);
  });

  it('should return false if not all provided arguments are valid', function() {
    args.isActive = null;

    result = validate(pattern, args);
    expect(result).toBe(false);
  });

  xit('should return false if any required arguments are missing', function() {
    // TODO: implement this functionlity
  });

  describe('all', function() {
    it('should return true all the predicates evaluate to true', function() {
      function isNotNull(v) {
        return !_.isNull(v);
      }

      var isStringAndNotNull = validate.all(_.isString, isNotNull);

      expect(isStringAndNotNull('A String')).toBe(true);
    });

    it('should return false if all the predicates do not evaluate to true', function() {
      function isVeryLong(v) {
        return v.length > 20;
      }

      var isLongString = validate.all(_.isString, isVeryLong);

      expect(isLongString('A String')).toBe(false);
    });
  });

  describe('any', function() {
    it('should return true if any predicate evaluates to true', function() {
      var isStringOrNumber = validate.any(_.isString, _.isNumber);

      expect(isStringOrNumber(10)).toBe(true);
    });

    it('should return false if no predicates evaluate to true', function() {
      var isStringOrNumber = validate.any(_.isString, _.isNumber);

      expect(isStringOrNumber(null)).toBe(false);
    });
  });

});
