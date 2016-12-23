


'use strict';

const hooks = require('./hooks');

const multer = require('multer');
const multipartMiddleware = multer();
const dauria = require('dauria');

// feathers-blob service
const blobService = require('feathers-blob');

// Here we initialize a FileSystem storage,
// but you can use feathers-blob with any other
// storage service like AWS or Google Drive.
const fs = require('fs-blob-store');
//const blobStorage = fs(__dirname + '/uploaded_files');
const blobStorage = fs('./uploaded_files');

module.exports = function(){
  const app = this;

  // Initialize our service with any options it requires
  // Upload Service with multipart support
  app.use('/uploads',

      // multer parses the file named 'uri'.
      // Without extra params the data is
      // temporarely kept in memory
      multipartMiddleware.single('uri'),

      // another middleware, this time to
      // transfer the received file to feathers
      function(req,res,next){
          req.feathers.file = req.file;
          console.log('creating file on server');
          next();
      },
      blobService({Model: blobStorage})
  );



  // Get our initialize service to that we can bind hooks
  const uploadService = app.service('/uploads');

  // Set up our before hooks

  // before-create Hook to get the file (if there is any)
  // and turn it into a datauri,
  // transparently getting feathers-blob
  // to work with multipart file uploads
  app.service('/uploads').before({
      create: [
          function(hook) {
              if (!hook.data.uri && hook.params.file){
                  const file = hook.params.file;
                  const uri = dauria.getBase64DataURI(file.buffer, file.mimetype);
                  hook.data = {uri: uri};
              }
          }
      ]
  });
};

//module.exports.Service = Service;






/*
//////////////////////////////
//////////////////////////////
// Code présent par défaut
//////////////////////////////
//////////////////////////////


'use strict';

const hooks = require('./hooks');

class Service {
  constructor(options) {
    this.options = options || {};
  }

  find(params) {
    return Promise.resolve([]);
  }

  get(id, params) {
    return Promise.resolve({
      id, text: `A new message with ID: ${id}!`
    });
  }

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
}

module.exports = function(){
  const app = this;

  // Initialize our service with any options it requires
  app.use('/uploads', new Service());

  // Get our initialize service to that we can bind hooks
  const uploadService = app.service('/uploads');

  // Set up our before hooks
  uploadService.before(hooks.before);

  // Set up our after hooks
  uploadService.after(hooks.after);
};

module.exports.Service = Service;

//////////////////////
*/



