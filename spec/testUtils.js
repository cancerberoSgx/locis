var request = require('superagent')
var _ = require('underscore')
var co = require('co')
var args = require('yargs').argv

module.exports = {

	serverStartup: function(url, expect, cb)
	{
		if(args.dontRunServer)
		{
			return cb(null)
		}
		//make sure is turned off
		request.get(url).end(function(err, res)
		{
			expect(res).toBe(undefined) 
			expect(err.toString().indexOf('ECONNREFUSED')!==-1).toBe(true)
		}) 

		var spawn = require('child_process').spawn
		var server = spawn('node', ['bin/www'])

		function testServerAfterStart()
		{
			request.get(url).end(function(err, res)
			{
				expect(err).toBeFalsy()
				expect(res.text.indexOf('<!DOCTYPE html>')!==-1).toBe(true)
				cb(null, server)
			})
		}
		server.stdout.on('data', (data) => 
		{
			if(data.indexOf('Locis Server started at')!==-1)
			{
				testServerAfterStart()
			}
			console.log(`server stdout: ${data}`)
		})
		server.stderr.on('data', (data) => 
		{
			console.log(`server stderr: ${data}`)
		})
	}

,	serverStop: function(url, expect, server, cb)
	{
		if(args.dontRunServer)
		{
			return cb(null)
		}
		server.kill() 
		setTimeout(function()
		{
			request.get(url).end(function(err, res)
			{
				expect(res).toBe(undefined) 
				expect(err.toString().indexOf('ECONNREFUSED')!==-1).toBe(true) 
				cb(null) 
			}) 
		}, 500)
	}

,	randomLocationPoint: function(x1, x2, y1, y2)
	{
		return [
			_.random(x1*1000, x2*1000)/1000,
			_.random(y1*1000, y2*1000)/1000
		]
	}

,	request: function(method, url, params, headers)
	{
		params = params || {}
		headers = headers || {}
		return new Promise(function(resolve, reject)
		{
			//first obtain the token
			var req = request[method](url)

			_.each(headers, (val, name) =>
			{
				req.set(name, val)
			})

			if(method.toLowerCase()=='post' || method.toLowerCase()=='put')
			{
				req.send(params)
			}
			else
			{
				req.query(params)
				req.send({})
			}

			req.end(function(err, res)
			{
				var result = {error: err, response: res}
				resolve(result)
			})
		})
	}

,	getApiUrl: function(api)
	{
		return 'http://localhost:3000/api/' + api
	}


	//a jasmine it() that supports co()
,	itco: function(label, fn)
	{
		it(label, (cb) =>
		{
			co(fn.apply(this, [cb]))
			.catch(this.coCatch(cb, label))
		})
	}
		

,	coCatch: function(cb, message)
	{
		return function(err)
		{
			// expect(message).toBeFalsy()
			expect('Error ' + message + '. Cause: ' + err + '').toBeFalsy()
			console.log('\nSpec EXCEPTION: '+message+'\n\n', err)
			cb()
		}
	}
}