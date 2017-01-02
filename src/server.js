var fs = require('fs')

var authentication = require('./authentication')
var util = require('./util')
var api = require('./api')

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
				authentication.authenticateHandler(request, response, (data)=>
				{
					util.jsonResponse(response, data, 200)
				})
			})
			.catch((ex)=>
			{
				util.jsonResponse(response, ex, 401)
			})
			return
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
					util.jsonResponse(response, err, err.status || 200)
				}
				else if(!apiCall.action || !api.getApis()[apiCall.action])
				{
					util.jsonResponse(response, {error: 'api not found'}, 404)
				}
				else
				{
					api.executeApi(request, response, apiCall)
				}
			})
			return
		}

		//then it is a static file
		var file = util.getFile(request, defaultFile, baseFolder)
			
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
			util.jsonResponse(response, {error: (file.error+'')||'invalid file'}, 404)
		}
	})
}


module.exports = {
	start: startServer
}
