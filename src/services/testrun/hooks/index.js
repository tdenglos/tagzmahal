'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');



const myHook = options => { // always wrap in a function so you can pass options and for consistency.
  return hook => {
    
    console.log('Launching phantomjs run...');
    const spawn = require('child_process').spawn;
    

    const ls = spawn('phantomjs', ['/Users/thomas/Documents/Startups/Automation/tagzmahal/git/web_clicker.js']);
    //const ls = spawn('phantomjs /Users/thomas/Documents/Startups/Automation/tagzmahal/git/web_clicker.js');

    //const ls = spawn('ls', ['-lh', '/usr']);

    ls.stdout.on('data', (data) => {
      console.log(`${data}`);
    });

    ls.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });

    return Promise.resolve(hook); // A good convention is to always return a promise.
  };
};



exports.before = {
  all: [],
  find: [],
  get: [],
  create: [myHook()],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
