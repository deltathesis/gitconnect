require('dotenv').load();

var express = require('express');
var http = require('http');

var app = express();
var server = http.Server(app);

// Initialize Socket.IO
require('./socket/socket')(server);

// Load Passport Middleware
require('./passport')(app);

// Load Express Middleware
require('./middleware')(app);

server.listen(process.env.PORT);
console.log('Server now running on port: ' + process.env.PORT);
