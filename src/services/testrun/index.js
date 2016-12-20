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

    // LOGGING SUR L'APPEL DU SERVICE
    var key = data.timestamp.toString();
    console.log('POST request on testruns - ' + key);
    var runIndex = runList.length;
    var newRun = {
      rank: runIndex,
      id: key,
      status: 'Queued'
    };
    runList.push(newRun) ; 

    
    var runLogs ='';

    console.log('Launching phantomjs run...');
    const spawn = require('child_process').spawn;

    runList[runIndex].status = "Started";

    const ls = spawn('phantomjs', ['web_clicker.js']);
    //const ls = spawn('phantomjs', ['/Users/thomas/Documents/Startups/Automation/tagzmahal/git/web_clicker.js']);
    
    ls.stdout.on('data', (data) => {
      console.log(`${data}`);
      runLogs += `${data}`;
    });

    ls.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      runList[runIndex].status = "Finished";
      var newRun = {
        id: key,
        output: runLogs
      };
      runOutputs.push(newRun) ; 
      console.log(runLogs);
      
    });




    data.runStatus = 'Run queued with ID ' + data.timestamp + ' for user ' + data.user;
    data.runLogs = runLogs;
    //console.log(runLogs);


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
