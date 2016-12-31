var util = require('../util')
// APIS - TODO: move this to another folder

//if url starts with /api then we consider it an api call - we authenticate it - if not we assume it's a local file
function parseApiCall(request)
{
	var regex = /^\/api\/([^\?]+)/
	var result = regex.exec(request.url)
	if(result)
	{
		return {
			action: result[1], 
			params: util.parseUrlParameters(request)
		}
	}
}

var apis = {}
function installApis()
{
	apis.utility1 = function(request, response)
	{
		var data = {
			success: true,
			result: 123123
		}
		util.jsonResponse(response, data, 200)
	}
}
function getApis()
{
	return apis
}


module.exports = {
	parseApiCall: parseApiCall,
	installApis: installApis,
	getApis: getApis
}