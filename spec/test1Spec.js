var request = require('superagent')
var utils = require('./testUtils')


describe('basic auth - utility1', function()
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

	it('/api/authenticate w no credentials', function(cb)
	{
		request
		.post('http://localhost:3000/api/authenticate')
		.end(function(err)
		{
			expect(err.status).toBe(401)
			cb()
		})
	}) 
	it('/api/authenticate w wrong credentials', function(cb)
	{
		request
		.post('http://localhost:3000/api/authenticate')
		.send({name: 'bad', password: 'user'})
		.end(function(err, res)
		{
			expect(err).toBeFalsy()
			if(!err)
			{
				expect(res.body.success).toBeFalsy() //bad credentials
			}
			else
			{
				expect(err.status).toBe(401)
			}
			cb()
		})
	}) 

	

	it('happypath1', function(cb)
	{
		new Promise(function(resolve, reject)
		{
			//first obtain the token
			request
			.post('http://localhost:3000/api/authenticate')
			.send({name: 'sgurin', password: 'test123'})
			.end(function(err, res)
			{
				expect(err).toBeFalsy()
				err ? reject(err) : resolve(res.body.token)
			})
		})
		.then(function(token)
		{
			//now make the api call passing the token
			return new Promise(function(resolve, reject)
			{
				request
				.get('http://localhost:3000/api/utility1')
				.set('x-access-token', token)
				.end(function(err, res)
				{
					err ? reject(err) : resolve(res.body.result)
				})
			})
		})
		.then(function(result)
		{
			//we have the api call result :)
			expect(result).toBe(123123)
			cb()
		})
		.catch(function(err)
		{
			console.log('ERROR', err.toString())
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


