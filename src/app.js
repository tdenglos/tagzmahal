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
var session = require('express-session');
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

passport.use(new GithubStrategy({
    clientID: "c0760198143c262b0cc3",
    clientSecret: "653b935888839573fc0fb42538615033f041ced0",
    callbackURL: "/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
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

app.use(function(req, res, next) {
    console.log('private filter');
    console.log(req.isAuthenticated());
    console.log(req.path.indexOf('/private'));
    if (req.isAuthenticated() == false && req.path.indexOf('/private') === 0)
    {
        res.redirect('/?error=not_registered_as_alpha_tester');
    }
    next(); 
});

app.use('/', serveStatic( app.get('public') ));
//app.use('/', feathers.static(__dirname + '/public'));

// we will call this to start the GitHub Login process
app.get('/auth/github', passport.authenticate('github'));

// GitHub will call this URL
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/successful_login.html');
  }
);

app.get('/logout', function(req, res){
  console.log('logging out');
  req.logout();
  res.redirect('/');
});
////////////////////
/*
// required for passport session
app.use(session({
  resave: true, 
  saveUninitialized: true, 
  secret: 'SOMERANDOMSECRETHERE', 
  cookie: { maxAge: 60000 }
}));

app.use(session({
  secret: 'secrettexthere',
  saveUninitialized: true,
  resave: true,
  // using store session on MongoDB using express-session + connect
  store: new MongoStore({
    url: config.urlMongo,
    collection: 'sessions'
  })
}));



// Init passport authentication 
app.use(passport.initialize());
// persistent login sessions 
app.use(passport.session());
*/

/*

app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

*/



/*
  // Set up our own custom redirect route for successful login
  app.get('/auth/success', function(req, res){
    //res.redirect('/home.html');
    console.log('user logged in');
    res.sendFile(path.resolve(__dirname, '..', 'private', 'home.html'));
   // console.log(path.resolve(__dirname, '..', 'public', 'success.html'));
  });
*/
  app.use(errorHandler());




// Require user to be authenticated to access pages under "/private/"


function requireLogin(req, res, next) {
  console.log('requireLogin is called');
  console.log (req.isAuthenticated());
  if (req.isAuthenticated()){
    console.log("authenticated");
    next();
  }else{
    console.log("not authenticated");
    res.redirect('/?error=not_registered_as_alpha_tester');
  }


  /*
  console.log(req.feathers.token);
  console.log(authenticationHooks.verifyToken());
  console.log(authenticationHooks.restrictToAuthenticated());
  if ( authenticationHooks.restrictToAuthenticated() instanceof Error ) {
    console.log('error');
    res.redirect('/');
  }else{
    console.log('success');
    next();
  }
*/



/*
      console.log(req);
  console.log('requireLogin is called');
  if (req.session.loggedIn) {

    console.log('OK, user is logged in');
    next(); // allow the next route to run
  } else {
    console.log('User is not logged in');
    // require the user to log in
    res.redirect("/"); // or render a form, etc.
  }
*/
}

//app.use('/private', feathers.static(__dirname + '/private'));
//app.get('/private/home', requireLogin, feathers.static(__dirname + '/public/private/home.html'));
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


/*
app.get("/admin/posts", function(req, res) {
  // if we got here, the `app.all` call above has already
  // ensured that the user is logged in
});
*/








module.exports = app;



// Déclaration des variables que j'utilise pour les ws

global.runList = [];
global.runOutputs = [];
global.authorizedUsers = [];


console.log('variables declared');


