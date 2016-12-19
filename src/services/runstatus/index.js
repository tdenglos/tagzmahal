'use strict';
/*
const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
*/
const hooks = require('./hooks');






class Service {
  constructor(options) {
    this.options = options || {};

    // TEST DE LOGGING SUR L'APPEL DU SERVICE
    console.log('constructor on runstatuses');
  
  }

  find(params) {
    var arr = new Array(); 
    for (var k in runList){
      arr.push(runList[k]);
    }
    return Promise.resolve(arr);
  }
/*
  create(data, params) {

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
/*
  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'runstatuses.db'),
    autoload: true
  });

  let options = {
    Model: db,
    paginate: {
      default: 5,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/runstatuses', service(options));

  // Get our initialize service to that we can bind hooks
  const runstatusService = app.service('/runstatuses');

  // Set up our before hooks
  runstatusService.before(hooks.before);

  // Set up our after hooks
  runstatusService.after(hooks.after);

*/


  // Initialize our service with any options it requires
  app.use('/runstatuses', new Service());

  // Get our initialize service to that we can bind hooks
  const runstatusService = app.service('/runstatuses');

  // Set up our before hooks
  runstatusService.before(hooks.before);

  // Set up our after hooks
  runstatusService.after(hooks.after);




};

module.exports.Service = Service;
