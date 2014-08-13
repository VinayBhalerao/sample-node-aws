// server.js

// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8081;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var request = require('request');

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); 

app.configure(function() {

	// set up our express application
	app.use(express.logger('dev')); 
	app.use(express.cookieParser()); 
	app.use(express.bodyParser()); 

	app.set('view engine', 'ejs'); 

	// required for passport
	app.use(express.session({ secret: '3scaledemo' }));
	app.use(passport.initialize());
	app.use(passport.session()); 
	app.use(flash()); 

});

// routes ======================================================================
require('./app/routes.js')(app, passport); // the main login to route

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
