var dbutils = require('../src/db')
var userdb = require('../src/db/user')
var usergroups = require('../src/db/usergroup')
var utils = require('./testUtils')
var co = require('co')

describe('', function()
{
	it('user insert search delete', function(cb)
	{
		co(function*() 
		{
			var db = yield dbutils.connect()
			usergroups.removeAll(db)

			var user = {name: 'test'+Date.now(), password: Date.now()}

			yield userdb.insertUser(db, user)

			var result = yield usergroups.getGroupsOfUser(db, user._id)
			expect(result.length).toBe(0)

			var group1 = {
				name: 'group1', 
				description: 'group1desc',
				users: []
			}
			usergroups.insert(db, group1)

			result = yield usergroups.getGroupsOfUser(db, user._id)
			expect(result.length).toBe(0)

			yield usergroups.addUsersToGroups(db, [user._id], [group1._id])
			result = yield usergroups.getGroupsOfUser(db, user._id)
			expect(result.length).toBe(1)

			db.close()
			cb()
		})
		.catch(utils.coCatch(cb))
	})
})