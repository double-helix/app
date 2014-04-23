var express   = require('express');
var app       = express();
var logger    = require('morgan');
var mongoose  = require('mongoose');
var session   = require('express-session');
var MongoStore = require('connect-mongo')({ session: session });
var errorHandler = require('errorhandler');


/**
 * API keys + Passport configuration.
 */

var secrets = require('./config/secrets');

/**
 * Mongoose configuration.
 */

mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('✗ MongoDB Connection Error. Please make sure MongoDB is running.');
});

/**
 * Express configuration.
 */

app.use(logger());
app.use(session({
  secret: secrets.sessionSecret,
  store: new MongoStore({
    url: secrets.db,
    auto_reconnect: true
  })
}));
app.use(express.static(__dirname + '/public'));
app.use(function(req, res, next) {
  // Keep track of previous URL to redirect back to
  // original destination after a successful login.
  if (req.method !== 'GET') return next();
  var path = req.path.split('/')[1];
  if (/(auth|login|logout|signup)$/i.test(path)) return next();
  req.session.returnTo = req.path;
  next();
});

// app.all('/api/*', requireAuthentication);
app.route('/api')
  .get(function(req, res, next) {
    res.json({ 'status' : true });
  });

app.route('/api/dev/:id')
  .get(function(req, res, next) {
    res.json({ 'dev_id': req.params.id });
  });

/**
 * 500 Error Handler.
 * As of Express 4.0 it must be placed at the end of all routes.
 */

app.use(errorHandler());

/**
 * Start Express server.
 */

app.listen(app.get('port'), function() {
  console.log("✔ Express server listening on port %d in %s mode", app.get('port'), app.get('env'));
});

module.exports = app;