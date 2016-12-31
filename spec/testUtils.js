var request = require('superagent')
var _ = require('underscore')
module.exports = {

	serverStartup: function(url, expect, cb)
	{
		//make sure is turned off
		request.get(url).end(function(err, res)
		{
			expect(res).toBe(undefined) 
			expect(err.toString().indexOf('ECONNREFUSED')!==-1).toBe(true)
		}) 

		var spawn = require('child_process').spawn
		var server = spawn('node', ['bin/www'])

		server.stdout.on('data', (data) => 
		{
			console.log(`stdout: ${data}`)
		})
		server.stderr.on('data', (data) => 
		{
			console.log(`stdout: ${data}`);
		});
		//turn it on
		setTimeout(function()
		{
			request.get(url).end(function(err, res)
			{
				expect(!!err).toBe(false)
				cb(null, server)
				// fn(server)
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
}