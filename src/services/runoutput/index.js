'use strict';

const hooks = require('./hooks');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  find(params) {
 /*   console.log(params.query.rank);
    var response = runOutputs[params.query.rank];
    var json = JSON.stringify(response);
    return Promise.resolve(json);
*/
    var arr = new Array(); 
      arr.push(runOutputs[params.query.rank]);
    return Promise.resolve(arr);
  }

  get(id, params) {
    var arr = new Array(); 
    arr.push(runOutputs[params.query.rank]);
    return Promise.resolve(arr);

/*
    return Promise.resolve({
      id, text: `A new message with ID: ${id}!`
    });
*/
  }
/*
  create(data, params) {
    if(Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current)));
    }

    return Promise.resolve(data);
  }

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
  app.use('/runoutputs', new Service());

  // Get our initialize service to that we can bind hooks
  const runoutputService = app.service('/runoutputs');

  // Set up our before hooks
  runoutputService.before(hooks.before);

  // Set up our after hooks
  runoutputService.after(hooks.after);
};

module.exports.Service = Service;
