var util = require('../util')


var apis = {}

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

function installApis()
{
	registerApi(require('./utility1'))
}

function getApis()
{
	return apis
}

function registerApi(obj)
{
	apis[obj.name] = obj
}

function executeApi(request, response, apiCall)
{
	getApis()[apiCall.action].handler(request, response, apiCall)
}

module.exports = {
	parseApiCall: parseApiCall,
	installApis: installApis,
	getApis: getApis,
	registerApi: registerApi,
	executeApi: executeApi
}