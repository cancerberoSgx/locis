var fs = require('fs')

var authentication = require('./authentication')
var util = require('./util')
var api = require('./api')
var _ = require('underscore')

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
	server.listen(port, ()=>{console.log('Locis Server started at :'+port)})
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
			util.readJSONBody(request)
			.then(()=>
			{
				authentication.authenticateHandler(request, response, (data)=>
				{
					util.jsonResponse(response, data, data.status||200)
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

			//TODO: promise and yield the follwoing nested callbacks
			util.readJSONBody(request)
			.catch(()=>
			{
				//cannot parse body - we assume empty object
				request.body = {}
				return new Promise((resolve)=>{resolve()})
			})
			.then(new Promise((resolve)=>
			{
				apiCall.body = request.body
				resolve()
			}))
			.then(()=>{return authentication.authenticateMiddleware(request, response)})
			.then((result)=>
			{
				var name = _.without(_.keys(result.decoded), ['iat'])[0] // iat (issued at) see https://github.com/auth0/node-jsonwebtoken/issues/290#issuecomment-269989752
				apiCall.user = {
					name: name, 
					password: result.decoded[name]
				}
				return new Promise((resolve)=>{resolve()})
			})
			.catch((err)=>
			{
				err = err || {error: 'unknwon error', status: 401}
				util.jsonResponse(response, err, err.status || 401)
			})
			.then(()=>
			{
				return api.executeApi(request, response, apiCall)
			})
			.catch((err)=>
			{
				err = err || {error: 'unknwon error', status: 500}
				util.jsonResponse(response, err, err.status || 500)
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
