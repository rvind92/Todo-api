var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.send('Todo API Root');
});

// GET /todos
app.get('/todos', function(request, response) {
	response.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function(request, response) {
	var todoId = parseInt(request.params.id, 10);
	var matchedTodo;

	todos.forEach(function(todo) {
		if(todoId === todo.id) {
			matchedTodo = todo;
		}
	});

	if(matchedTodo) {
		response.send(matchedTodo);
	} else {
		response.status(404).send();
	}
});

// POST /todos/:id
app.post('/todos', function(request, response) {
	var body = request.body;

	// add id field
	body.id = todoNextId;
	todoNextId++;
	// push body into array
	todos.push(body);

	console.log('description: ' + body.description);

	response.json(body);
});

app.listen(PORT, function() {
	console.log('Server has started at ' + PORT + '!');
});





