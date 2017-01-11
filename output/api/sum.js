var util = require('../util');
module.exports = {
	name: 'sum',
	handler: {
		get: (request, response, apiCall) => {
			var a = parseInt(apiCall.params.a, 10);
			var b = parseInt(apiCall.params.b, 10);
			if (isNaN(a) || isNaN(b)) {
				throw { error: 'Invalid call, a or b are invalid numbers' };
			}
			var data = {
				success: true,
				result: a + b
			};
			util.jsonResponse(response, data, 200);
		}
	}
};