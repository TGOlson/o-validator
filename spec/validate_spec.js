var _ = require('lodash');

var validate = require('../lib/validate');

describe('validate', function() {
  var pattern,
      args,
      result;

  beforeEach(function() {
    pattern = {
      required: {
        title: _.isString
      },
      optional: {
        description: _.isString,
        isActive: _.isBoolean
      }
    };

    args = {
      title: 'Hello',
      isActive: true
    };
  });

  it('should throw an error if no required or optional arguments are declared in the pattern', function() {
    var validateEmpty = validate.bind(null, {}, args);
    expect(validateEmpty).toThrow('Must provide at least one required or optional pattern.');
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

  it('should return false if any additional arguments are present', function() {
    args.isAdmin = true;

    result = validate(pattern, args);
    expect(result).toBe(false);
  });

  describe('createPattern', function() {
    it('should create a new validation pattern', function() {
      var createdPattern = validate.createPattern(pattern.required, pattern.optional);
      expect(createdPattern).toEqual(pattern);
    });
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

});
