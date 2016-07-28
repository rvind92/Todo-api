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
	var query = request.query;
	var where = {};
	// var queryParams = request.query;
	// var filteredTodos = todos;

	if(query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if(query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false
	}

	if(query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({where: where}).then(function(todos) {
		response.json(todos);
	}, function(e) {
		response.status(500).send();
	});

	// if has property && completed === 'true'
	// filteredTodos = ._where(filteredTodos, ?)
	// else if has prop && completed if 'false'

	
	// if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
	// 	filteredTodos = _.where(filteredTodos, {completed: true});
	// } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
	// 	filteredTodos = _.where(filteredTodos, {completed: false});
	// }

	// if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
	// 	filteredTodos = _.filter(filteredTodos, function(todo) {
	// 		return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
	// 	});
	// }

	// response.json(filteredTodos);
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

	var body = _.pick(request.body, 'description', 'completed');

	db.todo.create(body).then(function(todo) {
		response.json(todo.toJSON());
	}, function(e) {
		response.status(400).json(e);
	});
	
});

// DELETE /todos/:id

app.delete('/todos/:id', function(request, response) {
	var todoId = parseInt(request.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted) {
		if(rowsDeleted === 0) {
			response.status(404).json({
				error: 'No todo with id'
			});
		} else {
			response.status(204).send();
		}
	}, function() {
		response.status(500).send();
	});

});

app.put('/todos/:id', function(request, response) {
	var todoId = parseInt(request.params.id, 10);

	var body = _.pick(request.body, 'description', 'completed');
	var attributes = {};

	if(body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if(body.hasOwnProperty('description')) {
		attributes.description = body.description;
	} 

	db.todo.findById(todoId).then(function(todo) {
		if(todo) {
			todo.update(attributes).then(function(todo) {
				response.json(todo.toJSON());
	}, function(e) {
		response.status(400).json(e);
	});
		} else {
			response.status(404).send();
		}
	}, function() {
		response.status(500).send();
	});
});

app.post('/users', function (request, response) {
	var body = _.pick(request.body, 'email', 'password');

	db.user.create(body).then(function (user) {
		response.json(user.toPublicJSON());
	}, function (e) {
		response.status(400).json(e);
		console.log(e);
	});
});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});







