'use strict';

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

  it('should return false if any additional arguments are present', function() {
    args.isAdmin = true;

    result = validate(pattern, args);
    expect(result).toBe(false);
  });

  describe('required', function() {
    beforeEach(function() {
      pattern.title = validate.required(_.isString);
    });

    it('should return false if a required argument is missing', function() {
      result = validate(pattern, {});
      expect(result).toBe(false);
    });

    it('should return true if no arguments are missing or illegal', function() {
      result = validate(pattern, args);
      expect(result).toBe(true);
    });

    it('should false true if no arguments are missing but some are illegal', function() {
      args.title = 123;

      result = validate(pattern, args);
      expect(result).toBe(false);
    });

    it('should return false if any additional arguments are present', function() {
      args.isAdmin = true;

      result = validate(pattern, args);
      expect(result).toBe(false);
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

  describe('validateOrThrow', function() {
    var validator;

    beforeEach(function() {
      validator = validate(pattern);
      args.title = null;
    });

    it('should throw an error if the arguments are invalid', function() {
      var validateOrThrow = validate.orThrow.bind(null, validator, args);
      expect(validateOrThrow).toThrow('Input arguments include illegal values or properties.');
    });

    it('should not throw an error if the arguments are valid', function() {
      args.title = 'Something cool.';

      var validateOrThrow = validate.orThrow.bind(null, validator, args);
      expect(validateOrThrow).not.toThrow();
    });
  });

});
