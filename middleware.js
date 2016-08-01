module.exports = function(db) {
<<<<<<< HEAD
=======

>>>>>>> bb89c4bd80f246e6ba41dfb0ed8f36d289ce954f
	return {
		requireAuthentication: function(request, response, next) {
			var token = request.get('Auth');

			db.user.findByToken(token).then(function(user) {
				request.user = user;
				next();
			}, function() {
				response.status(401).send();
			});
		}
	};
<<<<<<< HEAD
=======

>>>>>>> bb89c4bd80f246e6ba41dfb0ed8f36d289ce954f
};