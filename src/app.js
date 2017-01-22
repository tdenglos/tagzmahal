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

var MongoClient = require('mongodb').MongoClient;
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
    console.log(result);
  });
});




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

// redirect www
app.use(function(req, res, next) {
 console.log('testing www');
 if(/^www\./.test(req.headers.host)) {
  res.redirect(req.protocol + '://' + req.headers.host.replace(/^www\./,'') + req.url,301);
 } else {
  next();
 }
});


// set up a route to redirect http to https
app.use(function(req, res, next){
  console.log('checking https');
  if(req.protocol=="http"){
    res.redirect('https://'+req.hostname+req.url);
  }else{
    next();
  }
    
});


// protect urls in /private folder
app.use(function(req, res, next) {
    console.log('checking authentication status');
    console.log(req.isAuthenticated());
    console.log(req.path.indexOf('/private'));
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
      console.log(result);
      console.log(result.length);
      if(result.length > 0){
        res.redirect('/successful_login.html');    
      }else{
        req.logout();
        res.redirect('/become_beta_tester.html');  
      }      
    });
  });




app.get('/logout', function(req, res){
  console.log('logging out');
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










module.exports = app;



// Déclaration des variables que j'utilise pour les ws

global.runList = [];
global.runOutputs = [];
global.authorizedUsers = [];


console.log('variables declared');


