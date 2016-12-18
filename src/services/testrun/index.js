'use strict';

const hooks = require('./hooks');

class Service {
  constructor(options) {
    this.options = options || {};

    // TEST DE LOGGING SUR L'APPEL DU SERVICE
    console.log('constructor on testruns');
  
  }

  find(params) {
    return Promise.resolve([]);
  }
/*
  get(id, params) {
    return Promise.resolve({
      id, text: `A new message with ID: ${id}!`
    });
  }
*/
  create(data, params) {

    // TEST DE LOGGING SUR L'APPEL DU SERVICE
    console.log('POST request on testruns');
    
    if(Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current)));
    }

    return Promise.resolve(data);
  }
/*
  update(id, data, params) {
    return Promise.resolve(data);
  }

  patch(id, data, params) {
    return Promise.resolve(data);
  }

  remove(id, params) {
    return Promise.resolve({ id });
  }
*/

}


module.exports = function(){
  const app = this;

  // Initialize our service with any options it requires
  app.use('/testruns', new Service());

  // Get our initialize service to that we can bind hooks
  const testrunService = app.service('/testruns');

  // Set up our before hooks
  testrunService.before(hooks.before);

  // Set up our after hooks
  testrunService.after(hooks.after);
};

module.exports.Service = Service;
