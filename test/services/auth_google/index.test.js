'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('auth_google service', function() {
  it('registered the auth_googles service', () => {
    assert.ok(app.service('auth_googles'));
  });
});
