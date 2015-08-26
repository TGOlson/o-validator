'use strict';

var R = require('ramda');

var V = require('../lib/validator');

describe('Validator', function() {
  var schema,
      args,
      result;

  beforeEach(function() {
    schema = {
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
      result = V.validate(schema, args);
      expect(result).toBe(true);
    });

    it('should return false if not all provided arguments are valid', function() {
      args.isActive = null;

      result = V.validate(schema, args);
      expect(result).toBe(false);
    });

    it('should return false if any additional arguments are present', function() {
      args.isAdmin = true;

      result = V.validate(schema, args);
      expect(result).toBe(false);
    });

    it('should recursively validate', function() {
      schema.nested = V.validate({foo: R.is(String)});
      args.nested = {foo: 'bar'};

      result = V.validate(schema, args);
      expect(result).toBe(true);
    });
  });

  describe('required', function() {
    beforeEach(function() {
      schema.title = V.required(R.is(String));
    });

    it('should return false if a required argument is missing', function() {
      result = V.validate(schema, {});
      expect(result).toBe(false);
    });

    it('should return true if no arguments are missing or illegal', function() {
      result = V.validate(schema, args);
      expect(result).toBe(true);
    });

    it('should return false if no arguments are missing but some are illegal', function() {
      args.title = 123;

      result = V.validate(schema, args);
      expect(result).toBe(false);
    });

    it('should return false if any additional arguments are present', function() {
      args.isAdmin = true;

      result = V.validate(schema, args);
      expect(result).toBe(false);
    });

    it('should return false if not all required arguments are present', function() {
      schema.description = V.required(R.is(String));

      result = V.validate(schema, args);
      expect(result).toBe(false);
    });

    it('should recursively validate', function() {
      schema.nested = V.required(V.validate({
        foo: V.required(R.is(String))
      }));

      args.nested = {foo: 'bar'};

      result = V.validate(schema, args);
      expect(result).toBe(true);
    });

    it('should support shorthand type syntax', function() {
      var schema = {
        foo  : String,
        bar  : Number,
        baz  : Function,
        bang : Boolean
      };

      expect(V.validate(schema, {foo: 'Hi'})).toBe(true);
    });
  });

  describe('getErrors', function() {
    var expectedTitleRequiredError = {
      property  : 'title',
      errorCode : 'REQUIRED',
      message   : 'Missing required parameter "title"'
    };

    var expectedDescriptionValueError = {
      property  : 'description',
      errorCode : 'VALUE',
      message   : 'Illegal value for parameter "description"'
    };

    var expectedIsAdminUnsupportedError = {
      property  : 'isAdmin',
      errorCode : 'UNSUPPORTED',
      message   : 'Unsupported parameter "isAdmin"'
    };

    it('should return an empty list if no values are illegal', function() {
      var errors = V.getErrors(schema, args);
      expect(errors).toEqual([]);
    });

    it('should return an error when missing a required property', function() {
      schema.title = V.required(R.is(String));
      args.title = undefined;

      var errors = V.getErrors(schema, args);
      expect(errors).toEqual([expectedTitleRequiredError]);
    });

    it('should return an error when a property does not satisfy the predicate', function() {
      args.description = 123;

      var errors = V.getErrors(schema, args);
      expect(errors).toEqual([expectedDescriptionValueError]);
    });

    it('should return an error when a property is unexpected', function() {
      args.isAdmin = true;

      var errors = V.getErrors(schema, args);

      expect(errors).toEqual([expectedIsAdminUnsupportedError]);
    });

    it('should return a list of errors when passed illegal values', function() {
      schema.title = V.required(R.is(String));
      args.title = undefined;
      args.description = 123;
      args.isAdmin = true;

      var errors = V.getErrors(schema, args);

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

      var validateOrThrow = V.validateOrThrow.bind(null, schema, args);
      expect(validateOrThrow).toThrow('Validation Error: Illegal value for parameter "title"');
    });

    it('should throw an error if multiple the arguments are invalid', function() {
      args.title = null;
      args.description = null;

      var validateOrThrow = V.validateOrThrow.bind(null, schema, args);
      expect(validateOrThrow).toThrow('Validation Error: Illegal value for parameter "title", Illegal value for parameter "description"');
    });

    it('should return the arguments if the arguments are valid', function() {
      expect(V.validateOrThrow(schema, args)).toBe(args);
    });
  });

  describe('errorCodes', function() {
    it('should be a set of error codes', function() {
      expect(V.errorCodes).toEqual({
        REQUIRED    : 'REQUIRED',
        UNSUPPORTED : 'UNSUPPORTED',
        VALUE       : 'VALUE',
        UNKNOWN     : 'UNKNOWN'
      });
    });
  });
});
