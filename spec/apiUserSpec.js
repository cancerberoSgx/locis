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


	var response, token
	var goodToken, badToken

	utils.itco('user get with priviligees and not so', (cb) => function*() 
	{
		//authenticate with wrong call
		response = yield utils.request('post', utils.getApiUrl('authenticate'), 
			{bar: 'adminuser', foo: 'test123'})
		expect(!!response.error).toBe(true)

		response = yield utils.request('post', utils.getApiUrl('authenticate'), 
			{name: 'adminuser', password: 'test123'})
		token = response.response.body.token
		expect(!!token).toBe(true)
		goodToken = token

		// get existent using user and password
		response = yield utils.request('get', utils.getApiUrl('user'), 
			{name: 'noadminuser', password: 'test123'}, {'x-access-token': token})
		expect(!!response.error).toBe(false)
		expect(response.response.body.name).toBe('noadminuser')
		expect(!!response.response.body._id).toBe(true)


		// get existent by id
		var existingId = response.response.body._id
		response = yield utils.request('get', utils.getApiUrl('user'), 
			{_id: existingId}, {'x-access-token': token})
		expect(!!response.error).toBe(false)
		expect(response.response.body.name).toBe('noadminuser')
		expect(response.response.body._id).toBe(existingId)

		//get with a non authorized user
		response = yield utils.request('post', utils.getApiUrl('authenticate'), 
			{name: 'noadminuser', password: 'test123'})
		token = response.response.body.token
		expect(!!token).toBe(true)
		response = yield utils.request('get', utils.getApiUrl('user'), 
			{name: 'noadminuser', password: 'test123'}, {'x-access-token': token})
		expect(!!response.error).toBe(true)
		expect(response.error.status).toBe(401)
		badToken = token

		cb()
	})

	utils.itco('insert, update & delete user', (cb) => function*() 
	{
		var user = {
			name: 'test'+Date.now(), 
			password: Date.now()+'',
			lastname: 'gurin'
		}

		response = yield utils.request('get', utils.getApiUrl('user'), 
			{name: user.name, password: user.password}, {'x-access-token': goodToken})
		expect(!!response.error).toBe(true)

		response = yield utils.request('post', utils.getApiUrl('user'), 
			user, {'x-access-token': goodToken})
		expect(!!response.error).toBe(false)
		expect(!!response.response.body._id).toBe(true)

		response = yield utils.request('get', utils.getApiUrl('user'), 
			{name: user.name, password: user.password}, {'x-access-token': goodToken})
		expect(!!response.error).toBe(false)
		// console.log(response.response.body)

		user._id = response.response.body._id
		user.lastname = 'marrero'
		response = yield utils.request('put', utils.getApiUrl('user'), 
			user, {'x-access-token': goodToken})
		expect(!!response.error).toBe(false)

		response = yield utils.request('get', utils.getApiUrl('user'), 
			{_id: user._id}, {'x-access-token': goodToken})
		expect(response.response.body.lastname).toBe('marrero')

		response = yield utils.request('delete', utils.getApiUrl('user'), 
			{_id: user._id}, {'x-access-token': goodToken})
		expect(response.response.body.result.n).toBe(1)

		response = yield utils.request('get', utils.getApiUrl('user'), 
			{_id: user._id}, {'x-access-token': goodToken})
		expect(response.response.status).toBe(404)

		cb()

	})



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


