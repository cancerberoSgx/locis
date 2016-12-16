
var dbutils = require('../src/db')
var userdb = require('../src/db/user')
var co = require('co')

var coCatch = function(err)
{
	expect(err).toBe(undefined)
	console.log('DB connection ERROR: ', err)
	cb()
}

describe('', function()
{
	it('user insert search delete', function(cb)
	{
		co(function*() 
		{
			var db = yield dbutils.connect()
			var user = {name: 'test'+Date.now(), password: Date.now()}

			var result = yield userdb.searchUser(db, user.name, user.password)
			expect(result.length).toBe(0)

			yield userdb.insertUser(db, user)
			result = yield userdb.searchUser(db, user.name, user.password)

			expect(result.length).toBe(1)
			yield userdb.removeUser(db, result[0]._id)
			result = yield userdb.searchUser(db, user.name, user.password)
			expect(result.length).toBe(0)

			db.close()
			cb()
		})
		.catch(coCatch)
	})
})