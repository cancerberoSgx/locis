var request = require('superagent')
var _ = require('underscore')
var co = require('co')

module.exports = {

	serverStartup: function(url, expect, cb)
	{
		//make sure is turned off
		request.get(url).end(function(err, res)
		{
			expect(res).toBe(undefined) 
			expect(err.toString().indexOf('ECONNREFUSED')!==-1).toBe(true)
			// console.log('Please make sure you dont have already a server running')
		}) 

		var spawn = require('child_process').spawn
		var server = spawn('node', ['bin/www'])

		server.stdout.on('data', (data) => 
		{
			console.log(`server stdout: ${data}`)
		})
		server.stderr.on('data', (data) => 
		{
			console.log(`server stderr: ${data}`)
		})
		//turn it on
		setTimeout(function()
		{
			request.get(url).end(function(err, res)
			{
				expect(err).toBeFalsy()
				expect(res.text.indexOf('<!DOCTYPE html>')!==-1).toBe(true)
				cb(null, server)
			})
		}, 500) 
	}

,	serverStop: function(url, expect, server, cb)
	{
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

			req.send(params)

			_.each(headers, (val, name) =>
			{
				req.set(name, val)
			})

			req.end(function(err, res)
			{
				var result = {error: err, response: res}
				resolve(result)
				// err ? reject(err) : resolve(res)
			})
		})
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