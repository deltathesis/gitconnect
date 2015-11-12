var express = require('express');
var app = express();

var PORT = 3000;

app.use(express.static(__dirname + '/../client/app'));

app.get('/', function(req, res) {
  res.end('Hello, world!');
});


app.listen(PORT, function() {
	console.log('Server now running on port: ' + PORT);
});