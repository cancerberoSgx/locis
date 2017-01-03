var utils = require('./testUtils')
var user = require('../src/db/user')
var dbutils = require('../src/db')

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


	utils.itco('user get with priviligees', (cb) => function*() 
	{
		var response, token
		response = yield utils.request('post', 'http://localhost:3000/api/authenticate', {name: 'adminuser', password: 'test123'})
		token = response.response.body.token
		expect(!!token).toBe(true)

		response = yield utils.request('get', 'http://localhost:3000/api/user', {}, {'x-access-token': token})
		expect(!!response.error).toBe(false)
		// console.log(response.response.body)

		response = yield utils.request('post', 'http://localhost:3000/api/authenticate', {name: 'noadminuser', password: 'test123'})
		expect(token != response.response.body.token).toBe(true)
		token = response.response.body.token
		expect(!!token).toBe(true)


		response = yield utils.request('get', 'http://localhost:3000/api/user', {}, {'x-access-token': token})
		expect(!!response.error).toBe(true)
		expect(response.response.status).toBe(401)

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


