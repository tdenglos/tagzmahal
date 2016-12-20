'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('runoutput service', function() {
  it('registered the runoutputs service', () => {
    assert.ok(app.service('runoutputs'));
  });
});
