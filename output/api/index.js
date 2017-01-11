var util = require('../util');

var apis = {};

//if url starts with /api then we consider it an api call - we authenticate it - if not we assume it's a local file
function parseApiCall(request) {
	var regex = /^\/api\/([^\?]+)/;
	var result = regex.exec(request.url);
	if (result) {
		return {
			action: result[1],
			params: util.parseUrlParameters(request)
		};
	}
}

function installApis() {
	registerApi(require('./utility1'));
	registerApi(require('./sum'));
	registerApi(require('./user'));
	registerApi(require('./place'));
}

function getApis() {
	return apis;
}

function registerApi(obj) {
	apis[obj.name] = obj;
}

// api dispatcher - from here the api take control 
function executeApi(request, response, apiCall) {
	return new Promise((resolve, reject) => {
		if (!apiCall.action || !getApis()[apiCall.action] || !getApis()[apiCall.action].handler[request.method.toLowerCase()]) {
			reject({ error: 'api not found', status: 403 });
			util.jsonResponse(response, { error: 'api not found' }, 403);
			return;
		}
		createApiCallSession(apiCall).then(() => {
			var method = request.method.toLowerCase();
			var handler = getApis()[apiCall.action].handler[method];
			if (!handler) {
				reject({ 'message': 'Method not allowed for this api', status: 405 });
			} else {
				try {
					var result = handler(request, response, apiCall);
					resolve(result);
				} catch (ex) {
					ex.status = 500;
					reject(ex);
				}
			}
		}).catch(ex => {
			console.log(ex, ex.stack); // TODO: we are the dispatcher, we are responsible of handinglng it here.
			ex.status = ex.status || 500;
			reject(ex);
		});
	});
}

var userdb = require('../db/user');
var dbutils = require('../db');
function createApiCallSession(apiCall) {
	return new Promise((resolve, reject) => {
		var db;
		dbutils.connect().then(db_ => {
			db = db_;
			return userdb.searchUser(db, apiCall.user.name, apiCall.user.password);
		})
		// .catch((ex)=>{console.log('exexex', ex)})
		.then(users => {
			db.close();
			apiCall.originalUser = apiCall.user;
			apiCall.user = users[0]; // throws an exeption if not found
			resolve(apiCall);
		}).catch(ex => {
			if (typeof db != 'undefined') {
				db.close();
			}
			reject(ex);
		});
	});
}

module.exports = {
	parseApiCall: parseApiCall,
	installApis: installApis,
	// getApis: getApis,
	registerApi: registerApi,
	executeApi: executeApi
};