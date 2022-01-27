const { assert } = require('chai');

const { emailChecker, urlsForUser, generateRandomString } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testDatabase = {
  "fboiaf": {
    longURL: "http://www.lighthouselabs.ca",
    userId: "user1"
  },
  "fnpaos": {
    longURL: "http://www.google.com/",
    userId: "user1"
  },
  "pogbsb": {
    longURL: "https://www.tsn.ca/",
    userId: "user2"
  },
};

describe('emailChecker', function() {
  it('should return a user with valid email', function() {
    const user = emailChecker("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return undefined when no user exists for that email', function() {
    const user = emailChecker("aboutToFail@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe('urlsForUser', function() {
  it('should return the urls for a specific user, given their ID', function() {
    const urls = urlsForUser("user1", testDatabase);
    const expectedOutput = {
      "fboiaf": {
        longURL: "http://www.lighthouselabs.ca",
        userId: "user1"
      },
      "fnpaos": {
        longURL: "http://www.google.com/",
        userId: "user1"
      },
    };
    assert.deepEqual(urls, expectedOutput);
  });

  it('should return an empty array when no user exists for that id', function() {
    const urls = urlsForUser("user3", testDatabase);
    const expectedOutput = {};
    assert.deepEqual(urls, expectedOutput);
  });
});

describe('generateRandomString', function() {
  it('should return a 6 digit string', function() {
    const string = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(string, expectedOutput);
  });

  it('should generate different strings when called multiple times', function() {
    const string1 = generateRandomString();
    const string2 = generateRandomString();
    assert.notEqual(string1, string2);
  });
});