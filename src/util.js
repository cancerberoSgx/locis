
function jsonResponse(response, obj, status)
{
	status = status || 200
	var s = JSON.stringify(obj)
	response.writeHead(200, {
		'Content-Type': 'application/json', 
		'Content-Length': s.length
	})
	response.end(s)
}


function readJSONBody(request)
{
	return new Promise((resolve, reject) =>
	{
		var body = []
		request
		.on('data', (chunk) =>
		{
			body.push(chunk)
		})
		.on('end', () =>
		{
			body = Buffer.concat(body).toString()
			try 
			{
				request.body = JSON.parse(body)
				resolve(request)
			}
			catch(ex)
			{
				reject(ex)
			}
		})
	})
	
}



module.exports = {
	jsonResponse: jsonResponse,
	readJSONBody: readJSONBody
}