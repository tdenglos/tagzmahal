'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('runstatus service', function() {
  it('registered the runstatuses service', () => {
    assert.ok(app.service('runstatuses'));
  });
});
