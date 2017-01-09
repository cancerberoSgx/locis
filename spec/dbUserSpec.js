var dbutils = require('../src/db')
var userdb = require('../src/db/user')
var utils = require('./testUtils')
var co = require('co')

describe('', function()
{
	it('user insert search delete', function(cb)
	{
		co(function*() 
		{
			var db = yield dbutils.connect()
			var user = {
				name: 'test'+Date.now(), 
				password: Date.now()
			}

			var result = yield userdb.searchUser(db, user.name, user.password)
			expect(result.length).toBe(0)

			yield userdb.insertUser(db, user)
			result = yield userdb.searchUser(db, user.name, user.password)

			expect(result.length).toBe(1)
			yield userdb.removeUsers(db, {_id: result[0]._id})
			result = yield userdb.searchUser(db, user.name, user.password)
			expect(result.length).toBe(0)

			db.close()
			cb()
		})
		.catch(utils.coCatch(cb))
	})
})