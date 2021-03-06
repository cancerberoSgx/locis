// authentication : 
// Uses https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens

var jwt = require('jsonwebtoken');
var dbutils = require('./db');
var user = require('./db/user');

// internal - token - userid mapping. Used as cache for getting the user given a token. 
// If a key is removed in this map then the auth middleware will fail. 
// var tokenUserMap = {}

function authenticateHandler(req, res, fn) {
	var db;
	dbutils.connect().then(function (db_) {
		db = db_;
		return user.searchUser(db, req.body.name, req.body.password);
	}).then(function (users) {
		db.close();
		if (!users || !users.length) {
			fn({
				success: false,
				message: 'Authentication failed. User not found.',
				status: 401
			});
		} else {
			var payload = {};
			payload[req.body.name] = req.body.password;

			var token = jwt.sign(payload, 'superSecret');

			//TODO: what if users.length>1 ? 

			fn({
				success: true,
				message: 'Enjoy your token!',
				token: token,
				user: users[0]
			});
		}
	}).catch(function (ex) {
		console.log('Authentication exx: ', ex);
		if (typeof db != 'undefined') {
			db.close();
		}
		fn({
			success: false,
			message: ex + ''
		});
	});
}

var authenticateMiddleware = function (req, res, fn) {
	return new Promise((resolve, reject) => {
		var token = req.body.token || req.query.token || req.headers['x-access-token'];
		if (token) {
			// verifies secret and checks exp
			jwt.verify(token, 'superSecret', (err, decoded) => {
				if (err) {
					var result = {
						success: false,
						message: 'Failed to authenticate token.',
						status: 401
					};
					fn && fn(result);
					reject(result);
				} else {
					var result = { decoded: decoded };
					// if everything is good, save to request for use in other routes
					req.decoded = decoded;
					// console.log('DECODED1', result)
					resolve(result);
					fn && fn(null, result);
				}
			});
		} else {
			// if there is no token - return an error
			console.log('ERROR: No token provided.');
			var result = {
				success: false,
				message: 'No token provided.',
				status: 40
			};
			fn && fn(result);
			reject(result);
		}
	});
};

module.exports = {
	authenticateHandler: authenticateHandler,
	authenticateMiddleware: authenticateMiddleware
};