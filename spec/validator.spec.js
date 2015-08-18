'use strict';

var R = require('ramda');

var Validator = require('../lib/validator');

describe('Validator', function() {
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

  describe('validate', function() {
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

    it('should recursively validate', function() {
      pattern.nested = Validator.validate({foo: R.is(String)});
      args.nested = {foo: 'bar'};

      result = Validator.validate(pattern, args);
      expect(result).toBe(true);
    });
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

    it('should recursively validate', function() {
      pattern.nested = Validator.required(Validator.validate({
        foo: Validator.required(R.is(String))
      }));

      args.nested = {foo: 'bar'};

      result = Validator.validate(pattern, args);
      expect(result).toBe(true);
    });
  });

  describe('getErrors', function() {
    var expectedTitleRequiredError = {
      property  : 'title',
      errorCode : 'Required',
      message   : 'Missing required parameter "title"'
    };

    var expectedDescriptionValueError = {
      property  : 'description',
      errorCode : 'Value',
      message   : 'Illegal value for parameter "description"'
    };

    var expectedIsAdminUnsupportedError = {
      property  : 'isAdmin',
      errorCode : 'Unsupported',
      message   : 'Unsupported parameter "isAdmin"'
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
    it('should throw an error if one of the arguments are invalid', function() {
      args.title = null;

      var validateOrThrow = Validator.validateOrThrow.bind(null, pattern, args);
      expect(validateOrThrow).toThrow('Validation Error: Illegal value for parameter "title"');
    });

    it('should throw an error if multiple the arguments are invalid', function() {
      args.title = null;
      args.description = null;

      var validateOrThrow = Validator.validateOrThrow.bind(null, pattern, args);
      expect(validateOrThrow).toThrow('Validation Error: Illegal value for parameter "title", Illegal value for parameter "description"');
    });

    it('should return the arguments if the arguments are valid', function() {
      expect(Validator.validateOrThrow(pattern, args)).toBe(args);
    });
  });
});
