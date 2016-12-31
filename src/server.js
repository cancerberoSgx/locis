var fs = require('fs')
var path = require('path')

var getContentType = require('./mime-types').getFromFilePath

var authentication = require('./authentication')

var util = require('./util')
// var util.readJSONBody = require('./util').util.readJSONBody
var jsonResponse = require('./util').jsonResponse
var parseUrlParameters = require('./util').parseUrlParameters

var api = require('./api')
	// api.parseApiCall: api.parseApiCall,
	// api.installApis: api.installApis,
	// api.getApis: api.getApis


// server startup 
function createServerAndListen(fn)
{
	var https = isProduction ? require('https') : require('http')
	var port = isProduction ? 443 : 3000
	var server
	if(isProduction)
	{
		var  options = {
			key: fs.readFileSync('/etc/letsencrypt/live/example.com/privkey.pem'),
			cert: fs.readFileSync('/etc/letsencrypt/live/example.com/cert.pem')
		}
		server = https.createServer(options, fn)
	}
	else
	{
		server = https.createServer(fn)
	}
	server.listen(port)
	return server
}




// SERVER STARTUP
module.exports = {
	start: startServer
}

var isProduction = false
var baseFolder = 'html'
var defaultFile = '/index.html'

function startServer(options)
{
	isProduction = options.isProduction || false
	baseFolder = options.baseFolder || 'html'
	defaultFile = options.defaultFile || '/index.html'

	api.installApis()
	
	createServerAndListen((request, response) => 
	{
		//post /authenticate i for obtaining jsonweb token
		if(request.url=='/api/authenticate')
		{
			util.readJSONBody(request).then(()=>
			{
				// jsonResponse(response, {foo: 'bar'}) ;return;
				authentication.authenticateHandler(request, response, (data)=>
				{
					jsonResponse(response, data, 200)
				})
			})
			.catch((ex)=>
			{
				jsonResponse(response, ex, 304)
			})
			return;
		}

		//then if starts with /api/* it is a api cal that must be authenticated. 
		var apiCall = api.parseApiCall(request)
		if(apiCall)
		{
			request.query = request.query || apiCall.params
			request.body =request.body ||{}
			request.headers =request.headers ||{}

			authentication.authenticateMiddleware(request, response, (err)=>
			{
				if(err)
				{
					jsonResponse(response, err, err.status||200)
				}
				else if(!apiCall.action || !api.getApis()[apiCall.action])
				{
					// console.log('api NOT found', apiCall)
					jsonResponse(response, {error: 'api not found'}, 404)
				}
				else
				{
					api.getApis()[apiCall.action](request, response, apiCall)
				}
			})
		}

		//then it is a static file
		if(!apiCall)
		{
			var file = util.getFile(request, defaultFile)
			
			if(!file.error && file.stat.isFile())
			{
				response.writeHead(200, {
					'Content-Type': file.contentType,
					'Content-Length': file.stat.size
				})

				var readStream = fs.createReadStream(file.path)
				readStream.pipe(response)
			}
			else
			{
				jsonResponse(response, {error: (file.error+'')||'invalid file'}, 404)
			}
		}
	})

}