var isProduction = false;
var baseFolder = '.';

function createServerAndListen(fn)
{
	var https = isProduction ? require('https') : require('http')
	var port = isProduction ? 443 : 8080
	var server
	if(isProduction)
	{
		var  options = {
			key: fs.readFileSync('/etc/letsencrypt/live/example.com/privkey.pem'),
			cert: fs.readFileSync('/etc/letsencrypt/live/example.com/cert.pem')
		};
		server = https.createServer(options, fn)
	}
	else
	{
		server = https.createServer(fn)
	}
	server.listen(port);
	return server
}

var fs = require('fs')
var path = require('path')
function getFile(request)
{
	try
	{
		var filePath = path.join(baseFolder, request.url);
		//TODO : security ! compare path.results against basefolder and make sure it is inside !
		var stat = fs.statSync(filePath);
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

var getContentType = require('./mime-types').getFromFilePath
// function getContentType(filePath)
// {
// 	return 'plain/text'
// }

createServerAndListen((request, response) => {

	var file = getFile(request)
	// console.log(request.url, file.stat)
	
	if(!file.error && file.stat.isFile())
	{
		response.writeHead(200, {
			'Content-Type': file.contentType,
			'Content-Length': file.stat.size
		});

		var readStream = fs.createReadStream(file.path);
		readStream.pipe(response);
	}
	else
	{
		response.writeHead(404, {});
		response.end((file.error+'')||'invalid file')
	}
});






