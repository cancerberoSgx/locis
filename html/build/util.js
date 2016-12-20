// Please execute this command as follows: node build/devel.js

//rm -rf output; mkdir output; babel src -d output; browserify output/index.js > output/bundle.js; static-server .

var shell = require('shelljs')
shell.config.silent = true
var assert = require('assert')

function compileJavaScript(fn)
{
	shell.mkdir('output')
	assert.equal(shell.exec('babel src -d output').code, 0)
	var p = shell.exec('browserify output/index.js')
	assert.equal(p.code, 0)
	p.to('output/bundle.js')
	fn && fn()
}

function compileLess(fn)
{
	shell.mkdir('output')
	var less = require('less');

	// console.log(shell.cat('src/less/index.less').toString())
	var options = {
		paths: ['./src/less'],  // Specify search paths for @import directives
		filename: 'style.less', // Specify a filename, for better error messages
		compress: true          // Minify CSS output
	,	sourceMap: true
    }
	less.render(shell.cat('src/less/index.less').toString(), options, (e, output) =>
	{
		if(e){
			console.log('ERROR in LESS', e)
		}
		shell.ShellString(output.css).to('output/styles.css');
		fn && fn()
		// console.log(output.css);
	})
}

function startServer(options, fn)
{
	var StaticServer = require('static-server');
	var defaultOptions = {
		rootPath: '.',            // required, the root of the server file tree 
		name: 'locis-devel-server',   // optional, will set "X-Powered-by" HTTP header 
		port: 9080,               // optional, defaults to a random port 
		// host: '10.0.0.100',       // optional, defaults to any interface 
		// cors: '*'                 // optional, defaults to undefined 
		// followSymlink: true,      // optional, defaults to a 404 error 
		// templates: {
		// 	index: 'foo.html',      // optional, defaults to 'index.html' 
		// 	notFound: '404.html'    // optional, defaults to undefined 
		// }
	};
	options = options || {}
	options = Object.assign(defaultOptions, options)
	var server = new StaticServer(options);
	 
	server.start( (fn) =>
	{
		console.log('Server listening to', server.port);
		fn && fn()
	});
}

function compileAll(fn)
{
	compileJavaScript(function(){compileLess(fn)})
}
// compileAll()
// startServer()
module.exports = {
	compileAll: compileAll,
	startServer: startServer,
	compileJavaScript: compileJavaScript,
	compileLess: compileLess
}

