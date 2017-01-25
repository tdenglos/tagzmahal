'use strict';


const path = require('path');
const serveStatic = require('feathers').static;
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const bodyParser = require('body-parser');
const socketio = require('feathers-socketio');
//const middleware = require('./middleware');
const services = require('./services');

// Added for authentication
var memory = require('feathers-memory');
var errorHandler = require('feathers-errors/handler');
var authentication = require('feathers-authentication');
const authenticationHooks = require('feathers-authentication').hooks
// Passport Auth Strategies
var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var session = require('express-session');

var Excel = require('exceljs');
var fileUpload = require('express-fileupload');
const fs = require('fs');

var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var db;
MongoClient.connect('mongodb://tagzmahal-app:tagzmahal-app@ds117199.mlab.com:17199/tagzmahal-beta', function(err, database) {
  if (err) {
    throw err;
  }
  db = database ;
  
  db.collection('beta-testers').find().toArray(function(err, result) {
    if (err) {
      throw err;
    }
    console.log("beta testers :");
    console.log(result);
  });

  var condition = {"status" : "Running"};
  var update = {"status" : "Queued"} ;
  db.collection('run-queue').update(condition, { $set: update }, {multi: true},function(err, result){
    if (err){
      throw err;
    }

    db.collection('run-queue').find().toArray(function(err, result) {
      if (err) {
        throw err;
      }
      console.log("runs in queue :");
      console.log(result);
      // Check run queue
      checkQueue(goNogo);
    });

  });

});

////// TEST AREA


////////

// Initialize the application
const app = feathers();


app.configure(configuration(path.join(__dirname, '..')));

app.use(compress())
  .options('*', cors())
  .use(cors())
  .use(favicon( path.join(app.get('public'), 'favicon.ico') ))
//  .use('/', serveStatic( app.get('public') ))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(hooks())
  .configure(rest())
  .configure(socketio())
  .configure(services)
 // .configure(middleware)
  
  // Configure feathers-authentication
/*  .configure(authentication({
    idField: 'id',
    shouldSetupSuccessRoute: true,
    github: {
      strategy: GithubStrategy,
// PRODUCTION CONF
   'clientID': '36b9ce352600f99c1569',
      'clientSecret': '190d22c079a92c0ef333b149cd0460255b12714e',

// DEV CONF
      'clientID': 'c0760198143c262b0cc3',
      'clientSecret': '653b935888839573fc0fb42538615033f041ced0',
// TRANSVERSAL CONF
      path: '/auth/github',
      successRedirect: '/successful_login.html'

    }
  })) */
  // Initialize a user service
  .use('/users', memory())
  //.use('/private', feathers.static(__dirname + '/private'))
  //.use('/', feathers.static(__dirname + '/public'));

app.use(fileUpload());


////// Nouvelle facon en utilisant directement passport
/*
passport.use(new GithubStrategy({
    // DEV CONF
    clientID: "c0760198143c262b0cc3",
    clientSecret: "653b935888839573fc0fb42538615033f041ced0",
    // PRODUCTION CONF
 // clientID: '36b9ce352600f99c1569',
  //clientSecret: '190d22c079a92c0ef333b149cd0460255b12714e',
    callbackURL: "/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));
*/

passport.use(new GoogleStrategy({
    // DEV CONF
    clientID: "285026965780-1vd3tcksdd85rqm2pg18lkvtnfbmemcb.apps.googleusercontent.com",
    clientSecret: "pwQV_wYmP_65xusaJ0ODD8yh",
    /*
    // PRODUCTION CONF
    clientID: "285026965780-1vd3tcksdd85rqm2pg18lkvtnfbmemcb.apps.googleusercontent.com",
    clientSecret: "pwQV_wYmP_65xusaJ0ODD8yh",
    */
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log('using google passport');
    return cb(null, profile);
/*
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
*/

  }
));





// Express and Passport Session
var session = require('express-session');
app.use(session({secret: "essotrazef"}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  // placeholder for custom user serialization
  // null is for errors
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  // placeholder for custom user deserialization.
  // maybe you are going to get the user from mongo by id?
  // null is for errors
  done(null, user);
});


//////////////////////
// REDIRECTIONS
//////////////////////

// redirect www
app.use(function(req, res, next) {
 //console.log('testing www');
 if(/^www\./.test(req.headers.host)) {
  res.redirect(req.protocol + '://' + req.headers.host.replace(/^www\./,'') + req.url,301);
 } else {
  next();
 }
});


// set up a route to redirect http to https
app.use(function(req, res, next){
  //console.log('checking https');
  if(req.protocol=="http"){
    res.redirect('https://'+req.hostname+req.url);
  }else{
    next();
  }
    
});


//////////////////////
// SECURITY
//////////////////////



// protect urls in /private folder
app.use(function(req, res, next) {
    //console.log('checking authentication status');
    //console.log(req.isAuthenticated());
    //console.log(req.path.indexOf('/private'));
    if (req.isAuthenticated() == false && req.path.indexOf('/private') === 0)
    {
        res.redirect('/?error=not_authenticated');
    }else{
      next();  
    }
});

app.use('/', serveStatic( app.get('public') ));
//app.use('/', feathers.static(__dirname + '/public'));


/*

// we will call this to start the GitHub Login process
app.get('/auth/github', 
  passport.authenticate('github', { scope: ['user:email'] }));

// GitHub will call this URL
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/successful_login.html');
  }
);
*/

app.get('/auth/google',
  passport.authenticate('google', { scope: ['email profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    var requesterEmail = req.user.emails[0].value ;
    
    db.collection('beta-testers').find({"email" : requesterEmail}).toArray(function(err, result) {
      if (err) {
        throw err;
      }
      //console.log(result);
      //console.log(result.length);
      if(result.length > 0){
        res.redirect('/private/home.html');    
        //res.redirect('/successful_login.html');    
      }else{
        req.logout();
        res.redirect('/become_beta_tester.html');  
      }      
    });
  });




app.get('/logout', function(req, res){
  //console.log('logging out');
  req.logout();
  res.redirect('/');
});
////////////////////


//  app.use(errorHandler());
  
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    //res.status(500).send('Something broke!');
  });


// Require user to be authenticated to access pages under "/private/"
function requireLogin(req, res, next) {
  /*
  console.log('requireLogin is called');
  console.log (req.isAuthenticated());
  if (req.isAuthenticated()){
    console.log("authenticated");
   // console.log(req.user);
    console.log(req.user.emails[0].value);

    next();
  }else{
    console.log("not authenticated");
    res.redirect('/?error=not_registered_as_alpha_tester');
  }
*/
  next();
}

//////////////////////
// PAGES
//////////////////////
/*
app.all('/private/home', requireLogin, function(req, res, next){
  res.sendFile(path.resolve(__dirname,'..', 'public', 'private', 'home.html'));
  }
);


app.all('/private/dashboard', requireLogin, function(req, res, next){
  res.sendFile(path.resolve(__dirname,'..', 'public', 'private', 'dashboard.html'));
  }
);

app.all('/private/dropzone', requireLogin, function(req, res, next){
  res.sendFile(path.resolve(__dirname,'..', 'public', 'private', 'dropzone.html'));
  }
);

app.all('/private/newrun', requireLogin, function(req, res, next){
  res.sendFile(path.resolve(__dirname,'..', 'public', 'private', 'newrun.html'));
  }
);

// Automatically apply the `requireLogin` middleware to all
// routes starting with `/admin`
app.all("/privateservices/*", requireLogin, function(req, res, next) {
  next(); // if the middleware allowed us to get here,
          // just move on to the next route handler
});
*/

//////////////////////
// SERVICES
//////////////////////


// Get run result
app.get('/privateservices/run-result', function(req, res){
  var requesterEmail = req.user.emails[0].value ;
  console.log(req.query);
  var condition = {"requester" : requesterEmail, "_id" : new ObjectId(req.query._id)};
  db.collection('run-queue').find(condition).toArray(function(err, result) {
    if (err) {
      throw err;
    }
    console.log(result);
    if(result[0].output){
      var filePath = path.join(__dirname, '..', 'uploaded_files/tmp/', result[0].output) ;
      res.sendFile(filePath);  
    }else{
      res.send("Not found");
    }
  });
});

// delete a run result
app.get('/privateservices/run-result/delete', function(req, res){
  var requesterEmail = req.user.emails[0].value ;
  var id = req.query._id ;
  //console.log('asking run conf delete for ' + requesterEmail + ' for run ' + runId );    
  var condition = {"_id" : new ObjectId(id), "requester" : requesterEmail};
/*  db.collection('run-configurations').find(condition).toArray(function(err, result) {
    if (err) {
      throw err;
    }
    console.log(result);
    res.send(result);
  }); */
  db.collection('run-queue').deleteOne(condition);
  res.send("done");
});

// List all run configurations of a user
app.get('/privateservices/run-configurations', function(req, res){
  var requesterEmail = req.user.emails[0].value ;
  //console.log('asking run conf list for ' + requesterEmail);
  db.collection('run-configurations').find({"owner" : requesterEmail}).toArray(function(err, result) {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});

// delete a run configuration
app.get('/privateservices/run-configurations/delete', function(req, res){
  var requesterEmail = req.user.emails[0].value ;
  var runId = req.query.runId ;
  //console.log('asking run conf delete for ' + requesterEmail + ' for run ' + runId );    
  var condition = {"_id" : new ObjectId(runId), "owner" : requesterEmail};
/*  db.collection('run-configurations').find(condition).toArray(function(err, result) {
    if (err) {
      throw err;
    }
    console.log(result);
    res.send(result);
  }); */
  db.collection('run-configurations').deleteOne(condition);
  res.send("done");
});

// add a co-owner to a run configuration
/*
app.get('/privateservices/run-configurations/add-co-owner', function(req, res){
  var requesterEmail = req.user.emails[0].value ;
  var coOwnerEmail = req.query.coOwnerEmail ;
  var runId = req.query.runId ;
  console.log('asking co-owner add for ' + requesterEmail + ' for run ' + runId + ' for co-owner ' + coOwnerEmail );
  res.send(coOwnerEmail + "add as co-owner");
});
*/

// upload a run configuration
function RunConf(owner, website, description, journey, tags){
  this.owner = owner ;
  this.website = website ;
  this.description = description ;
  this.journey = journey ;
  this.tags = tags
}
function PageConf(url, events) {
  this.url = url;
  this.events = events;
}
function Tag(name, url, splitChar1, splitChar2) {
  this.name = name;
  this.url = url;
  this.splitChar1 = splitChar1;
  this.splitChar2 = splitChar2;
}
function runconf2json(runconf){
  var output = new Array();
  output["owner"] = runconf.owner ;
  output["website"] = runconf.website ;
  output["description"] = runconf.description ;
  output["journey"] = runconf.journey ;
  output["tags"] = runconf.tags ;
  return JSON.stringify(output);
}
app.post('/privateservices/run-configurations/upload', function(req, res) {
  var requesterEmail = req.user.emails[0].value ;
  var website = req.body.website ;
  var description = req.body.description ;
  var runFile;
 
  if (!req.files) {
    res.redirect('/private/configure-new-run.html');
    return;
  }
 
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file 
  runFile = req.files.runConfigurationFile;
  //console.log(runFile);
 
  // Use the mv() method to place the file somewhere on your server 
  var filePath = path.join(__dirname, '..', '/uploaded_files/', runFile.name) ;
  // check if other file with same name already exists
  runFile.mv(filePath, function(err) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    }
    else {
     // res.send('File uploaded!');
      // Parse the file to generate the configuration
      //var runConf = new Array();
      var workbook = new Excel.Workbook();
      workbook.xlsx.readFile(filePath)
        .then(function() {
          
          var journey = new Array();
          var worksheet_journey = workbook.getWorksheet("journey");
          //console.log(worksheet.getCell('A1').value);
          var dobCol = worksheet_journey.getColumn('A');
          // iterate over all current cells in this column 
          dobCol.eachCell(function(cell, rowNumber) {
              //console.log(cell.value);
              if(rowNumber!=1){
                var pageConf = new PageConf(cell.value, {});
                journey.push(pageConf);
              }
          });

          var tags = new Array();
          var worksheet_tags = workbook.getWorksheet("tags");
          //console.log(worksheet.getCell('A1').value);
          var dobCol = worksheet_tags.getColumn('A');
          // iterate over all current cells in this column 
          var row = 1;
          var coords = new Array();
          dobCol.eachCell(function(cell, rowNumber) {
              //console.log(cell.value);
              if(row > 1){
                coords["name"] = "A" + row ;
                coords["url"] = "B" + row ;
                coords["splitChar1"] = "C" + row ;
                coords["splitChar2"] = "D" + row ;
                var tag = new Tag(
                  worksheet_tags.getCell(coords["name"]).value, 
                  worksheet_tags.getCell(coords["url"]).value,
                  worksheet_tags.getCell(coords["splitChar1"]).value,
                  worksheet_tags.getCell(coords["splitChar2"]).value
                );
                tags.push(tag);
              }
              row++;
          });
          
          var runConf = new RunConf(requesterEmail, website, description, journey, tags) ;
          var runConfJson = runconf2json(runConf);
          console.log(runConf);
          res.redirect('/private/run-configurations.html');
          //console.log(runConfJson);
          // Delete file
          fs.unlinkSync(filePath);
          // Store the configuration in the database
          db.collection('run-configurations').insert(runConf, function(err, records) {
            if (err) throw err;
            console.log("record added");
            //console.log("Record added as "+records[0]._id);
          });
        });
    }
  });
});


// see summary of run statuses of a user
app.get('/privateservices/runs', function(req, res){
  var requesterEmail = req.user.emails[0].value ;
  //console.log('asking run statuses list for ' + requesterEmail);
  db.collection('run-queue').find({"requester" : requesterEmail}).toArray(function(err, result) {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});


// delete a run
app.get('/privateservices/runs/delete', function(req, res){
  var requesterEmail = req.user.emails[0].value ;
  var runId = req.query.runId ;
  console.log('asking run delete for ' + requesterEmail + ' for run ' + runId );
  res.send("done");
});

// Add run to queue
app.post('/privateservices/run', function(req, res){
  var requesterEmail = req.user.emails[0].value ;
  var runId = req.body.runId ;
  var website = req.body.website ;
  var description = req.body.description ;
  function QueueElement(requester, runId, website, description, status){
    this.requester = requester ;
    this.runId = runId ;
    this.website = website ;
    this.description = description ;
    this.status = status ;
  }
  var queueElement = new Array();
  var status = "Queued" ;
  queueElement.push(new QueueElement(requesterEmail, runId, website, description, status));
  console.log('asking execution for run from ' + requesterEmail);
  console.log(queueElement);
  db.collection('run-queue').insert(queueElement, function(err, records) {
    if (err) throw err;
    console.log("run added in queue");
    res.send('done');
    checkQueue(goNogo);
    //console.log("Record added as "+records[0]._id);
  });
});


//////////////////////
// RUN
//////////////////////

function navigate(runRequest, filePath){
  var runLogs ='';
  console.log('Launching phantomjs run...');
  const spawn = require('child_process').spawn;
  const ls = spawn('phantomjs', ['src/run.js', filePath]);
  /*
  ls.stdout.on('data', function(data){
    console.log(data);
  });
*/
  
  ls.stdout.on('data', (data) => {
    console.log(`${data}`);
    runLogs += `${data}`;
  });
  
  ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
   /*
    var newRun = {
      id: runRequest._id,
      output: runLogs
    };
    */
  var outputFilePath = filePath.split(".")[0] + "_output.csv";
  deleteFromQueue(runRequest, outputFilePath);
  deleteJsonFromFs(filePath);
  //console.log(newRun);
  });
}


function createXlsx(runRequest, filePath){
/*
 console.log("creating xlsx");
 var outputPath = path.join(__dirname, '..', 'run_results/', runRequest._id, ".xlsx");
  fs.readFile(filePath, (err, data) => {
    if (err) throw err;
    //console.log(data);
    
    // create xlsx
    
    deleteJsonFromFs(filePath);
    setRunOutput(runRequest, outputFilePath);
    
  });

*/
// Temorary solution
var fileName = filePath.replace(/^.*[\\\/]/, '');
setRunOutput(runRequest, fileName);

}


function setRunOutput(runRequest,fileName){
  var condition = {"_id" : new ObjectId(runRequest._id)};
  var update = {$set: {"output" : fileName}} ;
  var options = {upsert: false, multi: false} ;
  db.collection('run-queue').update(condition, update, function(err, result) {
    if (err) {
      throw err;
    }
    setStatus(runRequest, "Done", "", function(){});
    checkQueue(goNogo);
  });
}


function writeJsonOnFs(runRequest){
  db.collection('run-configurations').find({"owner" : runRequest.requester, "_id" : new ObjectId(runRequest.runId)}).toArray(function(err, result) {
    if (err) {
      throw err;
    }
    console.log(result[0]);
    console.log(JSON.stringify(result[0]));
    var key = Date.now() ;
    var filename = runRequest._id + "_" + key + ".json" ;
    var filePath = path.join(__dirname, '..', 'uploaded_files/tmp/', filename) ;
    fs.writeFile(filePath, JSON.stringify(result[0]), function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!"); 
      navigate(runRequest, filePath);
    });
  });
}


function deleteJsonFromFs(filePath){
        // Delete file
        fs.unlinkSync(filePath);
}


function deleteFromQueue(runRequest, path){
  activeRuns-- ;
  console.log(activeRuns);
  setStatus(runRequest, "Finishing",  path, createXlsx);

/*
  var condition = {"_id" : new ObjectId(runRequest._id)};
  db.collection('run-queue').deleteOne(condition, function(err){
    if (err){
      throw err ;
    }
    checkQueue(goNogo);
  });
*/
}

function run(runRequest,path){
  console.log("running");
  console.log(runRequest);

  // Set run as on-going
  // Start run
  // Remove from queue and add to run-results
  // Decrement active runs
  
  writeJsonOnFs(runRequest);

  /*
  var i = Math.floor(Math.random() * (15 - 3 + 1) + 3);
  setTimeout(function() {

  }, i*1000);
*/
}



//////////////////////
// RUN LAUNCHER
//////////////////////



var maxActiveRuns = 1 ;
var activeRuns = 0 ;


// Check run queue
function checkQueue(callback){
   var condition = {"status" : "Queued"} ;
   db.collection('run-queue').find(condition).toArray(function(err, runsInQueue) {
    if (err) {
      throw err;
    }
    callback(runsInQueue);
  });
}


// Set run request status
function setStatus(runRequest, status, path, callback){
  var condition = {"_id" : new ObjectId(runRequest._id)};
  var update = {$set: {"status" : status}} ;
  var options = {upsert: false, multi: false} ;
  db.collection('run-queue').update(condition, update, function(err, result) {
    if (err) {
      throw err;
    }
    runRequest.status = status ;
    callback(runRequest, path);
  });
}


// Hold or run
function goNogo(queue) {
  console.log(queue.length + ' runs in queue');
  console.log(activeRuns + ' runs running');
  // if I have something to do and room to do it
  if (queue.length > 0 && activeRuns < maxActiveRuns){
    // Build an array of runs I can handle
    var i = Math.min(queue.length, maxActiveRuns - activeRuns) ;
    var runsToLaunch = new Array();
    for (var x = 0; x < i; x++){
      activeRuns++;
      runsToLaunch[x] = queue[x];
    }
    console.log("Runs to launch:");
    console.log(runsToLaunch);
    setStatus(runsToLaunch[0], "Running", "", run);

  }else{
    console.log("Run stack is full or queue is empty");
  }
 
}




//////////////////////
// APPLICATION LAUNCH
//////////////////////

module.exports = app;


// Déclaration des variables que j'utilise pour les ws

global.runList = [];
global.runOutputs = [];
global.authorizedUsers = [];
//console.log('variables declared');


  