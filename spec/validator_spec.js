'use strict';

var R = require('ramda');

var Validator = require('../lib/validator');

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
    result = Validator.validate(pattern, args);
    expect(result).toBe(true);
  });

  it('should return false if not all provided arguments are valid', function() {
    args.isActive = null;

    result = Validator.validate(pattern, args);
    expect(result).toBe(false);
  });

  it('should return false if any additional arguments are present', function() {
    args.isAdmin = true;

    result = Validator.validate(pattern, args);
    expect(result).toBe(false);
  });

  describe('required', function() {
    beforeEach(function() {
      pattern.title = Validator.required(R.is(String));
    });

    it('should return false if a required argument is missing', function() {
      result = Validator.validate(pattern, {});
      expect(result).toBe(false);
    });

    it('should return true if no arguments are missing or illegal', function() {
      result = Validator.validate(pattern, args);
      expect(result).toBe(true);
    });

    it('should return false if no arguments are missing but some are illegal', function() {
      args.title = 123;

      result = Validator.validate(pattern, args);
      expect(result).toBe(false);
    });

    it('should return false if any additional arguments are present', function() {
      args.isAdmin = true;

      result = Validator.validate(pattern, args);
      expect(result).toBe(false);
    });

    it('should return false if not all required arguments are present', function() {
      pattern.description = Validator.required(R.is(String));

      result = Validator.validate(pattern, args);
      expect(result).toBe(false);
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
      var errors = Validator.getErrors(pattern, args);
      expect(errors).toEqual([]);
    });

    it('should return an error when missing a required property', function() {
      pattern.title = Validator.required(R.is(String));
      args.title = undefined;

      var errors = Validator.getErrors(pattern, args);
      expect(errors).toEqual([expectedTitleRequiredError]);
    });

    it('should return an error when a property does not satisfy the predicate', function() {
      args.description = 123;

      var errors = Validator.getErrors(pattern, args);
      expect(errors).toEqual([expectedDescriptionValueError]);
    });

    it('should return an error when a property is unexpected', function() {
      args.isAdmin = true;

      var errors = Validator.getErrors(pattern, args);

      expect(errors).toEqual([expectedIsAdminUnsupportedError]);
    });

    it('should return a list of errors when passed illegal values', function() {
      pattern.title = Validator.required(R.is(String));
      args.title = undefined;
      args.description = 123;
      args.isAdmin = true;

      var errors = Validator.getErrors(pattern, args);

      expect(errors).toEqual([
        expectedTitleRequiredError,
        expectedDescriptionValueError,
        expectedIsAdminUnsupportedError
      ]);
    });
  });

  describe('validateOrThrow', function() {
    it('should throw an error if the arguments are invalid', function() {
      args.title = null;
      args.description = null;

      var validateOrThrow = Validator.validateOrThrow.bind(null, pattern, args);
      expect(validateOrThrow).toThrow('Illegal value for parameter: title');
    });

    it('should return the arguments if the arguments are valid', function() {
      var validateOrThrow = Validator.validateOrThrow(pattern, args);
      expect(validateOrThrow).toBe(args);
    });
  });

  describe('validateOrThrowAll', function() {
    it('should throw an error if the arguments are invalid', function() {
      args.title = null;
      args.description = null;

      var validateOrThrowAll = Validator.validateOrThrowAll.bind(null, pattern, args);
      expect(validateOrThrowAll).toThrow('Illegal value for parameter: title; Illegal value for parameter: description');
    });

    it('should return the arguments if the arguments are valid', function() {
      var validateOrThrowAll = Validator.validateOrThrowAll(pattern, args);
      expect(validateOrThrowAll).toBe(args);
    });
  });

  describe('custom', function() {
    var message;

    beforeEach(function() {
      message = 'That ain\'t the right title bruh.';
      pattern.title = Validator.custom({
        message   : message,
        predicate : R.is(String),
        required  : true
      });
    });

    it('should throw a custom error if the arguments are invalid', function() {
      args.title = null;

      var validateOrThrowCustom = Validator.validateOrThrow.bind(null, pattern, args);
      expect(validateOrThrowCustom).toThrow(message);
    });

    it('should throw a validation error if the custom arguments are invalid', function() {
      var validateCustom = Validator.custom.bind(null, {});
      expect(validateCustom).toThrow('Missing required parameter: predicate');
    });

    it('should return the arguments if the arguments are valid', function() {
      var validateOrThrowCustom = Validator.validateOrThrow(pattern, args);
      expect(validateOrThrowCustom).toBe(args);
    });
  });
});
