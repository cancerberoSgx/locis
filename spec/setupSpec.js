var dbutils = require('../src/db')
var user = require('../src/db/user')

describe('setup', function()
{
	var db

	it('check if user already exists', function(cb)
	{
		dbutils
		.connect()
		.then(function(db_)
		{
			db = db_
			return user.searchUser(db, 'sgurin', 'test123')
		})
		.then(function(users)
		{
			if(users && users.length)
			{
				// console.log('user already exists')
				return new Promise(function(resolve){resolve(users)}) 
			}
			else
			{
				// console.log('user dont exists, creating it now.')
				return user
				.insertUser(db, {
					name: 'sgurin', 
					password: 'test123',
					roles: ['administrator']
				})
				.then(function()
				{
					return user
					.insertUser(db, {
						name: 'noroles', 
						password: 'test123',
						roles: []
					})
				})
				.then(function()
				{
					return user.searchUser(db, 'sgurin', 'test123')
				})
			}
		})
		.then(function(users)
		{
			expect(users && users.length>0).toBe(true)
			db.close()
			cb()
		})
		.catch(function(ex)
		{
			console.log('error', ex)
			db.close()
			cb()
		})
	})

})