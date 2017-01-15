'use strict';
const upload = require('./upload');
const runoutput = require('./runoutput');
const runstatus = require('./runstatus');
const testrun = require('./testrun');
//const authentication = require('./authentication');
const user = require('./user');

module.exports = function() {
  const app = this;


  //app.configure(authentication);
  app.configure(user);
  app.configure(testrun);
  app.configure(runstatus);
  app.configure(runoutput);
  app.configure(upload);
};
