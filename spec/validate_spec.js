var _ = require('lodash');

var validate = require('../lib/validate');

describe('validate', function() {
  var pattern,
      args,
      result;

  beforeEach(function() {
    pattern = {
      title: _.isString,
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

  it('should return false if a property defined in the pattern does not exist in the arguments', function() {
    pattern.description = _.isString;

    result = validate(pattern, args);
    expect(result).toBe(false);
  });

  it('should return false if not all provided arguments are valid', function() {
    args.isActive = null;

    result = validate(pattern, args);
    expect(result).toBe(false);
  });

  it('should return false if any additional arguments are present', function() {
    args.isAdmin = true;

    result = validate(pattern, args);
    expect(result).toBe(false);
  });

  describe('required', function() {
    beforeEach(function() {
      pattern = {
        title: _.isString
      };

      args = {
        title: 'Hello',
      };
    });

    it('should return false if an argument is missing', function() {
      result = validate.required(pattern, {});
      expect(result).toBe(false);
    });

    it('should false true if no arguments are missing but some are illegal', function() {
      args.title = 123;

      result = validate.required(pattern, args);
      expect(result).toBe(false);
    });

    it('should return true if no arguments are missing or illegal', function() {
      result = validate.required(pattern, args);
      expect(result).toBe(true);
    });

    it('should return false if any additional arguments are present', function() {
      args.isAdmin = true;

      result = validate.required(pattern, args);
      expect(result).toBe(false);
    });
  });

  describe('optional', function() {
    beforeEach(function() {
      pattern = {
        title: _.isString,
        description: _.isString
      };

      args = {
        title: 'Hello'
      };
    });

    it('should return true if an argument is missing but non are illegal', function() {
      result = validate.optional(pattern, args);
      expect(result).toBe(true);
    });

    it('should false true if no arguments are missing but some are illegal', function() {
      args.description = null;

      result = validate.optional(pattern, args);
      expect(result).toBe(false);
    });

    it('should return true if no arguments are missing or illegal', function() {
      args.description = 'Something interesting';

      result = validate.optional(pattern, args);
      expect(result).toBe(true);
    });

    it('should return false if any additional arguments are present', function() {
      args.isAdmin = true;

      result = validate.optional(pattern, args);
      expect(result).toBe(false);
    });
  });

  describe('isOptional', function() {
    it('should be satisfied if the supplied predicate is satisfied or the value is undefined', function() {
      var maybeString = validate.isOptional(_.isString);

      expect(maybeString('Hello')).toBe(true);
      expect(maybeString(123)).toBe(false);
      expect(maybeString(undefined)).toBe(true);
    });
  });

  describe('isAll', function() {
    it('should be satisfied if all the supplied predicates are satisfied', function() {
      function isLong(v) {
        return v.length > 20;
      }

      var isLongString = validate.isAll(_.isString, isLong);

      expect(isLongString('A very very long string')).toBe(true);
      expect(isLongString('A short string')).toBe(false);
    });
  });

  describe('isAny', function() {
    it('should be satisfied if any the supplied predicates are satisfied', function() {
      var isStringOrNumber = validate.isAny(_.isString, _.isNumber);

      expect(isStringOrNumber(10)).toBe(true);
      expect(isStringOrNumber(null)).toBe(false);
    });
  });

  describe('isNot', function() {
    it('should invert the supplied predicate', function() {
      var isNotNull = validate.isNot(_.isNull);

      expect(isNotNull('Hello')).toBe(true);
      expect(isNotNull(null)).toBe(false);
    });
  });


});
