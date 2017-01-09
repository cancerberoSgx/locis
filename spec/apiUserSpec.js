var utils = require('./testUtils')
var user = require('../src/db/user')
var dbutils = require('../src/db')
var _ = require('underscore')

describe('api user', function()
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



	var adminUser, noAdminUser

	utils.itco('users preconditions', (cb) => function*() 
	{	
		var db = yield dbutils.connect()

		yield user.insertUser(db, {
			name: 'adminuser', 
			password: 'test123',
			roles: ['administrator']
		})
		yield user.insertUser(db, {
			name: 'noadminuser', 
			password: 'test123',
			roles: []
		})
		var result = yield user.searchUser(db, 'adminuser', 'test123')
		adminUser = result[0]
		expect(adminUser.name).toBe('adminuser')
		result = yield user.searchUser(db, 'noadminuser', 'test123')
		noAdminUser = result[0]
		expect(noAdminUser.name).toBe('noadminuser')

		db.close()
		cb()
	})


	var goodToken, badToken
	utils.itco('user get with priviligees and not so', (cb) => function*() 
	{
		var response, token

		//authenticate with wrong call
		response = yield utils.request('post', 'http://localhost:3000/api/authenticate', 
			{bar: 'adminuser', foo: 'test123'})

		response = yield utils.request('post', 'http://localhost:3000/api/authenticate', 
			{name: 'adminuser', password: 'test123'})
		token = response.response.body.token
		expect(!!token).toBe(true)
		goodToken = token

		// get existent using user and password
		response = yield utils.request('get', 'http://localhost:3000/api/user', 
			{name: 'noadminuser', password: 'test123'}, {'x-access-token': token})
		expect(!!response.error).toBe(false)
		expect(response.response.body.name).toBe('noadminuser')
		expect(!!response.response.body._id).toBe(true)


		// get existent by id
		var existingId = response.response.body._id
		response = yield utils.request('get', 'http://localhost:3000/api/user', 
			{_id: existingId}, {'x-access-token': token})
		expect(!!response.error).toBe(false)
		expect(response.response.body.name).toBe('noadminuser')
		expect(response.response.body._id).toBe(existingId)

		//get with a non authorized user
		response = yield utils.request('post', 'http://localhost:3000/api/authenticate', 
			{name: 'noadminuser', password: 'test123'})
		token = response.response.body.token
		expect(!!token).toBe(true)
		response = yield utils.request('get', 'http://localhost:3000/api/user', 
			{name: 'noadminuser', password: 'test123'}, {'x-access-token': token})
		expect(!!response.error).toBe(true)
		expect(response.error.status).toBe(401)
		badToken = token

		cb()
	})

	// utils.itco('insert, update & delete user', (cb) => function*() 
	// {
	// 	var response
	// 	var user = {
	// 		name: 'test'+Date.now(), 
	// 		password: Date.now()+''
	// 	}
	// 	response = yield utils.request('post', 'http://localhost:3000/api/user', user, {'x-access-token': goodToken})
	// 	expect(!!response.error).toBe(false)
	// 	expect(!!response.response.body._id).toBe(true)

	// 	response = yield utils.request('get', 'http://localhost:3000/api/user', 
	// 		{name: user.name, password: user.pasword}, {'x-access-token': goodToken})
	// 	expect(!!response.error).toBe(false)
	// 	expect(response.response.body.name).toBe(user.name)

	// 	cb()

	// 	// var request = require('superagent')
	// 	// request.post('http://localhost:3000/api/user')
	// 	// 	.set('Content-Type', 'application/json')
	// 	// 	.set('x-access-token', goodToken)
	// 	// 	.send(JSON.stringify(user))
	// 	// 	.end(function(err, res)
	// 	// 	{
	// 	// 		if (err || !res.ok) 
	// 	// 		{
	// 	// 			console.log('Oh no! error')
	// 	// 			console.log(_.keys(res), res.body)//response.response.params)
	// 	// 		} 
	// 	// 		else 
	// 	// 		{
	// 	// 			console.log('yay got ' + JSON.stringify(res.body))
	// 	// 		}
	// 	// 		cb()
	// 	// 	})

	// })



	utils.itco('remove users', (cb) => function*() 
	{
		var db = yield dbutils.connect()
		// console.log(adminUser._id)

		yield user.removeUsers(db, 'adminuser', 'test123')
		yield user.removeUsers(db, 'noadminuser', 'test123')

		var result = yield user.searchUser(db, 'adminuser', 'test123')
		expect(result.length).toBe(0)
		result = yield user.searchUser(db, 'noadminuser', 'test123')
		expect(result.length).toBe(0)

		db.close()
		cb()
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


