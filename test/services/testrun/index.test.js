'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('testrun service', function() {
  it('registered the testruns service', () => {
    assert.ok(app.service('testruns'));
  });
});
