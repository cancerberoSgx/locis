
function jsonResponse(response, obj, status) {
	status = status || 200;
	var s = JSON.stringify(obj);
	response.writeHead(status, {
		'Content-Type': 'application/json',
		'Content-Length': s.length
	});
	response.end(s);
}

function readJSONBody(request) {
	return new Promise((resolve, reject) => {
		var body = [];
		request.on('data', chunk => {
			body.push(chunk);
		}).on('end', () => {
			body = Buffer.concat(body).toString();
			try {
				request.body = JSON.parse(body);
				resolve(request);
			} catch (ex) {
				reject(ex);
			}
		});
	});
}

function parseUrlParameters(request) {
	var url = request.url;
	var a = url.indexOf('?'),
	    c;
	var result = {};
	if (a != -1) {
		url = url.substring(a + 1, url.length);
		a = url.split('&');
		a.forEach(b => {
			c = b.split('=');
			result[c[0]] = c[1];
		});
	}
	return result;
}

var path = require('path'),
    fs = require('fs'),
    mimeTypes = require('./mime-types');
// resolve and read requested file from fs
function getFile(request, defaultFile, baseFolder) {
	// console.log('getFile', request.url)
	if (request.url == '/') {
		request.url = defaultFile;
	}
	try {
		var filePath = path.join(baseFolder, request.url);
		// console.log('filePath', filePath)
		//TODO : security ! compare path.results against basefolder and make sure it is inside !
		var stat = fs.statSync(filePath);
		return {
			stat: stat,
			path: filePath,
			contentType: mimeTypes.getFromFilePath(filePath)
		};
	} catch (ex) {

		return { error: ex };
	}
}

module.exports = {
	jsonResponse: jsonResponse,
	readJSONBody: readJSONBody,
	parseUrlParameters: parseUrlParameters,
	getFile: getFile
};