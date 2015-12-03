var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');

module.exports = function(app) {

	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());
	app.use(session({
		secret: 'Hhhhhaaaah!',
		resave: true,
		saveUninitialized: true,
		cookie: {
			maxAge: 60000
		}
	}));

	app.use(cookieParser());
	app.use('/', require('./router'));
	app.use(express.static(__dirname + '/../client/app'));

};

