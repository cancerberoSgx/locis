var util = require('../util')
module.exports = {
	name: 'sum',
	handler: {
		get: (request, response, apiCall)=>
		{
			var data = {
				success: true,
				result: parseInt(apiCall.params.a, 10) + parseInt(apiCall.params.b, 10)
			}
			util.jsonResponse(response, data, 200)
		}
	}
}
