const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser');

const index = require('./routes/index');
const users = require('./routes/users');

const app = express();

app.use(cookieSession({ secret: 'keyboard cat' }));

const passport = require('passport')

const FacebookStrategy = require('passport-facebook').Strategy

passport.use(new FacebookStrategy (
  {
    clientID: '125954554766866',
    clientSecret: 'f539c416641d2c4c4fa8fbecfc819355', callbackURL:'http://localhost:3000/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email'],
    enableProof: true
  },

  function onSuccessfulLogin(token, refreshToken, profile, done) {
    done(null, {token, profile});
  }
));

app.use(passport.initialize())
app.use(passport.session())


passport.serializeUser((object, done) => {
  done(null, {token: object.token})
})

passport.deserializeUser((object, done) => {
    done(null, object)
})

app.get('/auth/facebook', passport.authenticate('facebook'));

// Step 2: Setting up the callback route
// makes 2 api calls to github
app.get('/auth/facebook/callback',
passport.authenticate('facebook', { failureRedirect: '/login' }),
function(req, res) {
  // Successful authentication, redirect home.
  res.redirect('/');
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
