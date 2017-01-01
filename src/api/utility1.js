var util = require('../util')
module.exports = {
	name: 'utility1',
	handler: (request, response)=>
	{
		var data = {
			success: true,
			result: 123123
		}
		util.jsonResponse(response, data, 200)
	}
}