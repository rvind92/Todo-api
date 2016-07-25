var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.send('Todo API Root');
});

// GET /todos?completed=true
app.get('/todos', function(request, response) {
	var queryParams = request.query;
	var filteredTodos = todos;

	// if has property && completed === 'true'
	// filteredTodos = ._where(filteredTodos, ?)
	// else if has prop && completed if 'false'

	if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {completed: true});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {completed: false});
	}

	if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
		});
	}

	response.json(filteredTodos);
});

// GET /todos/:id
app.get('/todos/:id', function(request, response) {
	var todoId = parseInt(request.params.id, 10);

	db.todo.findById(todoId).then(function(todo) {
		if(!!todo) {
			response.json(todo.toJSON())
		} else {
			response.status(404).send();
		}
	}, function(e) {
		response.status(500).send();
	});
	// var matchedTodo = _.findWhere(todos, {id: todoId});
	// // var matchedTodo;

	// // todos.forEach(function(todo) {
	// // 	if(todoId === todo.id) {
	// // 		matchedTodo = todo;
	// // 	}
	// // });

	// if(matchedTodo) {
	// 	response.send(matchedTodo);
	// } else {
	// 	response.status(404).send();
	// }
});

// POST /todos/:id
app.post('/todos', function(request, response) {
	// var body = request.body;
	var body = _.pick(request.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		response.json(todo.toJSON());
	}, function(e) {
		response.status(400).json(e);
	});
	// if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
	// 	return response.status(400).send();
	// }

	// // set body.description to be trimmed value
	// body.description = body.description.trim();

	// // add id field
	// body.id = todoNextId;
	// todoNextId++;
	// // push body into array
	// todos.push(body);

	// response.json(body);
});

// DELETE /todos/:id

app.delete('/todos/:id', function(request, response) {
	var todoId = parseInt(request.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if(!matchedTodo) {
		response.status(404).json({"error": "no todo found with that id"});
	} else {
		todos = _.without(todos, matchedTodo);
		response.json(matchedTodo);
	}
});

app.put('/todos/:id', function(request, response) {
	var todoId = parseInt(request.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});
	var body = _.pick(request.body, 'description', 'completed');
	var validAttributes = {};

	if(!matchedTodo) {
		response.status(404).json({"error": "no todo found with that id"});
	}
	// body.hasOwnProperty('completed');
	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if(body.hasOwnProperty('completed')) {
		return response.status(400).send();
	}

	if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if(body.hasOwnProperty('description')) {
		return response.status(400).send();
	}

	// HERE
	_.extend(matchedTodo, validAttributes);
	response.json(matchedTodo);

});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Server has started at ' + PORT + '!');
	});
});







