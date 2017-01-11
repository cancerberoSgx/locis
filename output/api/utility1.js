var util = require('../util');
module.exports = {
	name: 'utility1',
	handler: {
		get: (request, response, apiCall) => {
			var data = {
				success: true,
				result: 123123
			};
			util.jsonResponse(response, data, 200);
		}
	}
};