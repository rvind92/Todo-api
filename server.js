var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'Eating food',
	completed: false
}, {
	id: 2,
	description: 'Drive car',
	completed: false
}, {
	id: 3,
	description: 'Sleep on bed',
	completed: false
}];

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

app.listen(PORT, function() {
	console.log('Server has started at ' + PORT + '!');
});





