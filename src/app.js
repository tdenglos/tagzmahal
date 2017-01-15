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
var GithubStrategy = require('passport-github').Strategy;

// Initialize the application
const app = feathers();


app.configure(configuration(path.join(__dirname, '..')));

app.use(compress())
  .options('*', cors())
  .use(cors())
  .use(favicon( path.join(app.get('public'), 'favicon.ico') ))
  .use('/', serveStatic( app.get('public') ))
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .configure(hooks())
  .configure(rest())
  .configure(socketio())
  .configure(services)
 // .configure(middleware)
  
  // Configure feathers-authentication
  .configure(authentication({
    idField: 'id',
    shouldSetupSuccessRoute: true,
    github: {
      strategy: GithubStrategy,
      'clientID': '36b9ce352600f99c1569',
      'clientSecret': '190d22c079a92c0ef333b149cd0460255b12714e',
      path: '/auth/github',
      successRedirect: '/successful_login.html'

    }
  }))
  // Initialize a user service
  .use('/users', memory())
  //.use('/private', feathers.static(__dirname + '/private'))
  .use('/', feathers.static(__dirname + '/public'));





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
  authenticationHooks.verifyToken();
  if ( authenticationHooks.restrictToAuthenticated() instanceof Error ) {
    console.log('error');
    res.redirect('/');
  }else{
    console.log('success');
    next();
  }




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


