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

	utils.itco('place users preconditions', (cb) => function*() 
	{	
		var db = yield dbutils.connect()

		yield user.insertUser(db, {
			name: 'userplace1', 
			password: 'test123',
			roles: ['place-insert']
		})
		yield user.insertUser(db, {
			name: 'noadminuser', 
			password: 'test123',
			roles: []
		})

		db.close()
		cb()
	})


	var response, goodToken, badToken

	utils.itco('place insert w good user', (cb) => function*() 
	{
		response = yield utils.request('post', utils.getApiUrl('authenticate'), 
			{name: 'userplace1', password: 'test123'})
		expect(!!response.error).toBe(false)
		goodToken = response.response.body.token
		expect(!!goodToken).toBe(true)

		var place = {
			location: utils.randomLocationPoint(1,50,1,50)
		,	name: 'sample name'
		,	description: 'sample description'
		,	category: 'sample category'
		}
		response = yield utils.request('post', utils.getApiUrl('place'), 
			place, {'x-access-token': goodToken})
		expect(!!response.error).toBe(false)
		cb()
	})

	utils.itco('place insert w bad user', (cb) => function*() 
	{
		response = yield utils.request('post', utils.getApiUrl('authenticate'), 
			{name: 'noadminuser', password: 'test123'})
		expect(!!response.error).toBe(false)
		badToken = response.response.body.token
		expect(!!badToken).toBe(true)
		
		var place2 = {
			location: utils.randomLocationPoint(1,50,1,50)
		,	name: '2sample name'
		,	description: '2sample description'
		,	category: '2sample category'
		}	
		response = yield utils.request('post', utils.getApiUrl('place'), 
			place2, {'x-access-token': badToken})
		expect(!!response.error).toBe(true)
		expect(response.response.status).toBe(401)
		cb()
	})

	utils.itco('insert, update & delete user', (cb) => function*() 
	{

		// var user = {
		// 	name: 'test'+Date.now(), 
		// 	password: Date.now()+'',
		// 	lastname: 'gurin'
		// }

		// response = yield utils.request('get', utils.getApiUrl('user'), 
		// 	{name: user.name, password: user.password}, {'x-access-token': goodToken})
		// expect(!!response.error).toBe(true)

		// response = yield utils.request('post', utils.getApiUrl('user'), 
		// 	user, {'x-access-token': goodToken})
		// expect(!!response.error).toBe(false)
		// expect(!!response.response.body._id).toBe(true)

		// response = yield utils.request('get', utils.getApiUrl('user'), 
		// 	{name: user.name, password: user.password}, {'x-access-token': goodToken})
		// expect(!!response.error).toBe(false)
		// // console.log(response.response.body)

		// user._id = response.response.body._id
		// user.lastname = 'marrero'
		// response = yield utils.request('put', utils.getApiUrl('user'), 
		// 	user, {'x-access-token': goodToken})
		// expect(!!response.error).toBe(false)

		// response = yield utils.request('get', utils.getApiUrl('user'), 
		// 	{_id: user._id}, {'x-access-token': goodToken})
		// expect(response.response.body.lastname).toBe('marrero')

		// response = yield utils.request('delete', utils.getApiUrl('user'), 
		// 	{_id: user._id}, {'x-access-token': goodToken})
		// expect(response.response.body.result.n).toBe(1)

		// response = yield utils.request('get', utils.getApiUrl('user'), 
		// 	{_id: user._id}, {'x-access-token': goodToken})
		// expect(response.response.status).toBe(404)

		cb()

	})



	utils.itco('remove users', (cb) => function*() 
	{
		var db = yield dbutils.connect()
		// console.log(adminUser._id)

		yield user.removeUsers(db, {name: 'userplace1', password: 'test123'})
		yield user.removeUsers(db, {name: 'noadminuser', password: 'test123'})

		var result = yield user.searchUser(db, 'userplace1', 'test123')
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


