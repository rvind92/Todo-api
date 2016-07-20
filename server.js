var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

app.get('/', function(request, response) {
	response.send('Todo API Root');
});

app.listen(PORT, function() {
	console.log('Server has started at ' + PORT + '!');
});