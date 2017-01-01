var dbutils = require('../src/db')
var testUtils = require('./testUtils')
var co = require('co')

describe('', function()
{
	it('some relationships', function(cb)
	{
		co(function*() 
		{
			var db = yield dbutils.connect()
			var user1 = {
				name: 'user1', 
				password: ''+Date.now()
			}
			yield db.collection('user').insertOne(user1)
			expect(user1._id).not.toBeFalsy()

			var userGroup1 = {
				name: 'usergroup1', 
				users: [user1._id]
			}
			yield db.collection('usergroup').insertOne(userGroup1)

			//find the groups that contain 'user1'
			var result = yield db.collection('usergroup').find({users: user1._id}).toArray()
			expect(result.length).toBe(1)
			expect(result[0].name).toBe('usergroup1')

			var place1 = {
				name: 'foo1', description: 'bar2',
				readUsers: [],
				readUserGroups: []
			}
			yield db.collection('place').insertOne(place1)

			result = yield db.collection('place').find({readUsers: user1._id}).toArray()
			expect(result.length).toBe(0)

			//add a read-user to a place
			yield db.collection('place').update(
				{_id: place1._id},
				{$push: {readUsers: user1._id}}
			)

			//search for a place that has a read-user
			result = yield db.collection('place').find({readUsers: user1._id}).toArray()
			expect(result.length).toBe(1)
			expect(result[0].name).toBe('foo1')

			//add a user to a user group of a place
			yield db.collection('place').update(
				{_id: place1._id},
				{$push: {readUsers: user1._id}}
			)

			// user groups
			// create user and user group
			var user2 = {
				name: 'user2', 
				password: ''+Date.now()
			}
			yield db.collection('user').insertOne(user2)
			expect(user2._id).not.toBeFalsy()

			var userGroup2 = {
				name: 'usergroup2', 
				users: [user2._id]
			}
			yield db.collection('usergroup').insertOne(userGroup2)


			//search for a place that has a readUserGroup that has a readuser:
			var place2 = {
				name: 'foo2', description: 'bar23',
				readUsers: [],
				readUserGroups: []
			}
			yield db.collection('place').insertOne(place2)
			result = yield db.collection('place').find({readUserGroups: {$elemMatch: {readUserGroups: place2._id}}}).toArray()
			expect(result.length).toBe(0)

			db.close()
			cb()
		})
		.catch(testUtils.coCatch(cb))
	})
})
