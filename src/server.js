var fs = require('fs')
var path = require('path')

var getContentType = require('./mime-types').getFromFilePath

var authentication = require('./authentication')

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

function getFile(request)
{
	if(request.url == '/')
	{
		request.url = defaultFile
	}
	try
	{
		var filePath = path.join(baseFolder, request.url)
		//TODO : security ! compare path.results against basefolder and make sure it is inside !
		var stat = fs.statSync(filePath)
		return {
			stat: stat,
			path: filePath,
			contentType: getContentType(filePath)
		}
	}
	catch(ex)
	{
		return {error: ex}
	}
}

//if url starts with /api then we consider it an api call - we authenticate it - if not we assume it's a local file
function parseApiCall(request)
{
	var regex = /^\/api\/([^\?]+)/
	var result = regex.exec(request.url)
	if(result)
	{
		return {
			action: result[1], 
			params: parseUrlParameters(request)
		}
	}
}
function parseUrlParameters(request)
{
	var url = request.url
	var a = url.indexOf('?')
	var result = {}
	if(a!=-1)
	{
		url = url.substring(a + 1, url.length)
		a = url.split('&')
		a.forEach((b) =>
		{
			c = b.split('='); 
			result[c[0]] = c[1]; 
		})
	}
	return result;
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
		jsonResponse(response, data, 200)
	}
}
function getApis(){return apis}

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
	return new Promise(function(resolve, reject)
	{
		var body = []
		request
		.on('data', function(chunk) 
		{
			body.push(chunk)
		})
		.on('end', function() 
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

	installApis()
	
	createServerAndListen((request, response) => 
	{
		//post /authenticate i for obtaining jsonweb token
		if(request.url=='/api/authenticate')
		{
			readJSONBody(request).then(()=>
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
		var apiCall = parseApiCall(request)
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
				else if(!apiCall.action || !getApis()[apiCall.action])
				{
					// console.log('api NOT found', apiCall)
					jsonResponse(response, {error: 'api not found'}, 404)
				}
				else
				{
					getApis()[apiCall.action](request, response, apiCall)
				}
			})
		}

		//then it is a static file
		if(!apiCall)
		{
			var file = getFile(request)
			
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