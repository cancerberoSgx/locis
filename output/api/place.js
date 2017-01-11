var util = require('../util');
var dbutils = require('../db');
var placedb = require('../db/place');
var co = require('co');

// var verifyPermissions = (request, response, apiCall)=>
// {
// 	// if(!apiCall.user.roles.includes('administrator'))
// 	// {
// 	// 	util.jsonResponse(response, {'message': 'Not authorized'}, 401)
// 	// 	return false
// 	// }
// 	return true
// }

var coCatch = function (request, response) {
	return ex => {
		console.log('place api exception', ex);
		if (typeof db != 'undefined') {
			db.close();
		}
		util.jsonResponse(response, { 'message': ex + '\n\n' + ex.stack }, 500);
	};
};

var db;

module.exports = {

	name: 'place',

	handler: {

		get: (request, response, apiCall) => {
			//no roles required
			var db;
			co(function* () {
				db = yield dbutils.connect();
				var place = request.body;
				yield placedb.insert(db, place);
				db.close();
				util.jsonResponse(response, place, 200);
			}).catch(coCatch(request, response));
		},

		post: (request, response, apiCall) => {

			if (!apiCall.user.roles.includes('place-insert')) {
				util.jsonResponse(response, { 'message': 'Not authorized' }, 401);
				return false;
			}
			var db;
			co(function* () {
				db = yield dbutils.connect();
				var place = request.body;
				yield placedb.insert(db, place);
				db.close();
				util.jsonResponse(response, place, 200);
			}).catch(coCatch(request, response));
		}

	}
};