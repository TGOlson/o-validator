'use strict';

var R = require('ramda');

var validate = require('../lib/simple-validate');

describe('validate', function() {
  var pattern,
      args,
      result;

  beforeEach(function() {
    pattern = {
      title: R.is(String),
      description: R.is(String),
      isActive: R.is(Boolean)
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
      pattern.title = validate.required(R.is(String));
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

    it('should return false if not all required arguments are present', function() {
      pattern.description = validate.required(R.is(String));

      result = validate(pattern, args);
      expect(result).toBe(false);
    });
  });

  describe('isAll', function() {
    it('should be satisfied if all the supplied predicates are satisfied', function() {
      function isLong(v) {
        return v.length > 20;
      }

      var isLongString = validate.isAll(R.is(String), isLong);

      expect(isLongString('A very very long string')).toBe(true);
      expect(isLongString('A short string')).toBe(false);
    });
  });

  describe('isAny', function() {
    it('should be satisfied if any the supplied predicates are satisfied', function() {
      var isStringOrNumber = validate.isAny(R.is(String), R.is(Number));

      expect(isStringOrNumber(10)).toBe(true);
      expect(isStringOrNumber(null)).toBe(false);
    });
  });

  describe('isNot', function() {
    it('should invert the supplied predicate', function() {
      var isNotNull = validate.isNot(R.eq(null));

      expect(isNotNull('Hello')).toBe(true);
      expect(isNotNull(null)).toBe(false);
    });
  });

  describe('getErrors', function() {
    var expectedTitleRequiredError = {
      property: 'title',
      errorCode: 'Required',
      message: 'Missing required parameter: title'
    };

    var expectedDescriptionValueError = {
      property: 'description',
      errorCode: 'Value',
      message: 'Illegal value for parameter: description'
    };

    var expectedIsAdminUnsupportedError = {
      property: 'isAdmin',
      errorCode: 'Unsupported',
      message: 'Unsupported parameter: isAdmin'
    };

    it('should return an empty list if no values are illegal', function() {
      var errors = validate.getErrors(pattern, args);
      expect(errors).toEqual([]);
    });

    it('should return an error when missing a required property', function() {
      pattern.title = validate.required(R.is(String));
      args.title = undefined;

      var errors = validate.getErrors(pattern, args);
      expect(errors).toEqual([expectedTitleRequiredError]);
    });

    it('should return an error when a property does not satisfy the predicate', function() {
      args.description = 123;

      var errors = validate.getErrors(pattern, args);
      expect(errors).toEqual([expectedDescriptionValueError]);
    });

    it('should return an error when a property is unexpected', function() {
      args.isAdmin = true;

      var errors = validate.getErrors(pattern, args);

      expect(errors).toEqual([expectedIsAdminUnsupportedError]);
    });

    it('should return a list of errors when passed illegal values', function() {
      pattern.title = validate.required(R.is(String));
      args.title = undefined;
      args.description = 123;
      args.isAdmin = true;

      var errors = validate.getErrors(pattern, args);

      expect(errors).toEqual([
        expectedTitleRequiredError,
        expectedDescriptionValueError,
        expectedIsAdminUnsupportedError
      ]);
    });
  });

  describe('validateOrThrow', function() {
    var validator;

    beforeEach(function() {
      validator = validate(pattern);
      args.title = null;
    });

    it('should throw an error if the arguments are invalid', function() {
      var validateOrThrow = validate.orThrow.bind(null, pattern, args);
      expect(validateOrThrow).toThrow('Illegal value for parameter: title');
    });

    it('should return null if the arguments are valid', function() {
      args.title = 'Something cool.';

      var validateOrThrow = validate.orThrow(pattern, args);
      expect(validateOrThrow).toBe(null);
    });
  });

});
