var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);
var firebase = require('firebase');

firebase.initializeApp({
	serviceAccount: {
		projectId: "todoapp-d323d",
		clientEmail: "todoapp@todoapp-d323d.iam.gserviceaccount.com",
		privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDLQD3RqyMZoVAu\nsbvEiZj5kjlNgG3OI/r3GBpV57odynefFlEMXSYmFY70y0v+ScVdQMuIwE22uPtp\nnkURZX9ZIdQxFXBSIZD8Zc8RDahci7PSxScD/Nj0kdlyLra9mOXrXCOooEApzzpy\nwutHTB1z0COlbeK6Wl1qUDkwcC5CsfLcVzipX8sTmF+peQZhGl1aGrXedmOvHWRt\nNvB15devGEaHnc57I5zF/9CbGpimyogqanEcUF/agXKgRF3VQry2wiOH1y6p5nRp\ncqzXV7QCtS6Ofl+8XnbvZ+EKSk1qQOWK1QfzIVKiGHYI4JQxMW4Jaby9Mg077K5K\nmLpm1a/HAgMBAAECggEAOvi1twrnkT0rrZCmAT1HJEpX0/PKaEAqRd05bulgJ9qh\n4IeyFltEgVJJ+x6tOueemxL8uv3IzpZXY+qm8Yg4bd0R2vf0cfAJSCIl9TW4PrnN\n//5x9oc7T6Ktq6KAJPyi4SoHsppkY30b4UZKy5H7Dao7XXlHinhDmGAUZ8h0s6a3\nZw4GFvROZ4s0iAqYGadnji+MjpJmNfDI076KNWE+nz+oHSlpJbcksyLD6ySdU2rK\nNdOggQKoK0my8ZJBU+dFJIcOa8xESS7uEm84v81OyXV2yUkVEZC64rWFG0ddEbG+\n7Mpuragmug2vQ8wT4JhG8Wxgob9QHSm1HPgfkLHNKQKBgQDukhCoqP22oIF2ZOal\nZVXzEa/5i9RTnYfZN5P3H+KmGDiUa6haZOJJ+/u1X2Z6tjo8ySS1pHtgG+KOA7am\nHGFoLWEVG0Zpo9zDhimTyATxlbnnyMO16OtJPQlck/YChAJoBU978JUMR8DpSs7N\nR4kOmSZSAOJfQKnYKV/N4VV6DQKBgQDaGZnX0FCPQvbePQD9SURrSN+O2z5HDBdf\nBEM9IxNc4UDhcqB75NCeWn7LYpPkv4sJEO1UVR9CQLq7Q0p1JS6zp+WufQIS1YAp\nlEfGqmdIX28wp+x4z83cDQYijFJSgVdLXU1+cCBE3oRIgVU+qFU3vXFWs20m8M19\nHcyv7T4AIwKBgQDiYg6WzU18OFDBdTv8pO1ra1ROe+autaSMdhXdgg9Dx2YhSQuH\nQ4YL6KZQ1MddGICo38IK75r3d16Dnnh6piG0hqNCMRCe/BRoIW5gwoQWbxrrHHLC\nstRaOiYhCHKArp3N8YQcOw5kic5AUnFtED25cZCQbjBhbO3+pjw4FGRVHQKBgHbn\n0joY9nLEnXbYZ3uvwD+FgWyPF0sAypUg68+fGeVfYVIIfnpNa3eJ+urDmcHys8iD\nlACQT/R8+dEyhJuNZALKnKwet0yxXahNkTw8lwacETDDvGa5VJCOATRAsHkOzxrl\niWRPmSgy8IffCyyX9a3n+Ky+MdozGrUF1BxuCYllAoGBAKmUWbxL2LT+rVmn2PFM\nGj3b1i9O9dCaUNwSuf+TYrBuV9b9ezA0nh+splzCyddOAk2+ynfA3z6MGjdU8CWd\naw8Yz60gP7TOrGnZpnaGL2bB8LeT16hQLHSEB/FNgzZwE6AX+D8pKTFYWipzBycO\nblhx/0pdBgCJM73ZN9k4CcDn\n-----END PRIVATE KEY-----\n"
	},
	databaseURL: "https://todoapp-d323d.firebaseio.com/"
});

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.send('Aravind Todo API');
});

// GET /todos?completed=true
app.get('/todos', middleware.requireAuthentication, function(request, response) {
	var query = request.query;
	var where = {
		userId: request.user.get('id')
	}; //request.user.get('id')

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
});

// GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function(request, response) {
	var todoId = parseInt(request.params.id, 10);

	db.todo.findOne({
		where: {
			id: todoId,
			userId: request.user.get('id')
		}
	}).then(function(todo) {
		if(!!todo) {
			response.json(todo.toJSON())
		} else {
			response.status(404).send();
		}
	}, function(e) {
		response.status(500).send();
	});

});

// POST /todos/:id
app.post('/todos', middleware.requireAuthentication, function(request, response) {

	var body = _.pick(request.body, 'description', 'completed');

	console.log('PLEASE FUCKING PRINT ' + JSON.stringify(body));

	db.todo.create(body).then(function(todo) {
		request.user.addTodo(todo).then(function() {
			return todo.reload();
		}).then(function(todo) {
			response.json(todo.toJSON());
		});
	}, function(e) {
		response.status(400).json(e);
	});
	
});

// DELETE /todos/:id

app.delete('/todos/:id', middleware.requireAuthentication, function(request, response) {
	var todoId = parseInt(request.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId,
			userId: request.user.get('id')
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

app.put('/todos/:id', middleware.requireAuthentication, function(request, response) {
	var todoId = parseInt(request.params.id, 10);

	var body = _.pick(request.body, 'description', 'completed');
	var attributes = {};

	if(body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if(body.hasOwnProperty('description')) {
		attributes.description = body.description;
	} 

	db.todo.findOne({
		where: {
			id: todoId,
			userId: request.user.get('id')
		}
	}).then(function(todo) {
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

// POST /users/login

app.post('/users/login', function(request, response) {
	var body = _.pick(request.body, 'email', 'password');
	var userInstance;
	var uid = body.email;
	var customToken = firebase.auth().createCustomToken(uid);
	console.log('CUSTOM TOKEN: ' + customToken);

	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		userInstance = user;

		return db.token.create({
			token: token
		});

	}).then(function(tokenInstance) {
		response.header('FirebaseToken', customToken);
		response.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());
		// response.header('FirebaseToken', customToken.get('customToken')).json(userInstance.toPublicJSON());
	}).catch(function() {
		response.status(401).send();
	});
});

app.delete('/users/login', middleware.requireAuthentication, function(request, response) {
	request.token.destroy().then(function() {
		response.status(204).send();
	}).catch(function() {
		response.status(500).send();
	});
});

// app.use(express.static(__dirname + '/public'));

db.sequelize.sync({force: true}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});



