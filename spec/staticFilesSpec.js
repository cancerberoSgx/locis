var request = require('superagent')
var utils = require('./testUtils')


describe('static files', function()
{
	var server 

	it('server startup', function(cb)
	{
		utils.serverStartup('http://localhost:3000', expect, function(error, server_)
		{
			server = server_
			expect(!!error).toBe(false) 
			cb() 
		})
	}) 

	it('get / should serve index.html', function(cb)
	{
		request
		.get('http://localhost:3000/')
		.end(function(err, res)
		{
			expect(res.text.indexOf('<!DOCTYPE html>')!==-1).toBe(true)
			cb()
		})
	}) 

	it('server stop', function(cb)
	{
		utils.serverStop('http://localhost:3000', expect, server, function(error)
		{
			expect(!!error).toBe(false) 
			cb() 
		})
	})
})


