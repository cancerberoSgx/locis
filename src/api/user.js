var util = require('../util')
module.exports = {
	name: 'user',
	handler: {
		get: (request, response, apiCall)=>
		{
			// console.log(apiCall.user)
			util.jsonResponse(response, {'message': 'hello'}, 200)
		},
		post: (request, response, apiCall)=>
		{
			
			util.jsonResponse(response, {}, 200)
		},
		put: (request, response, apiCall)=>
		{
			
			util.jsonResponse(response, {}, 200)
		},
		delete: (request, response, apiCall)=>
		{
			
			util.jsonResponse(response, {}, 200)
		}
	}
}