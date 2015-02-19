'use strict';

// valid set of arguments created to pass the validation
exports.post = {
  title       : 'A story about something.',
  author      : 'Tyler',
  body        : 'This is the post body and it has to be long to pass the validator.',
  description : 'A very interesting story about something.',
  date        : new Date(),
  category    : 'Examples',
  // tags are undefined - but that is ok, validator treats them as optional
  metadata : {
    wordCount : 123
    // related is undefined as well
  }
};
