var util = require('../util')
var dbutils = require('../db')
var userdb = require('../db/user')
var co = require('co')

var verifyPermissions = (request, response, apiCall)=>
{
	if(!apiCall.user.roles.includes('administrator'))
	{
		util.jsonResponse(response, {'message': 'Not authorized'}, 401)
		return false
	}
	return true
}

var coCatch = function(request, response)
{
	return (ex)=>
	{
		// console.log('user api cocatch', ex)
		if(typeof(db)!='undefined')
		{
			db.close()
		}
		util.jsonResponse(response, {'message': ex+'\n\n'+ex.stack}, 500)
	}
}

var db
module.exports = {
	name: 'user',
	handler: {
		get: (request, response, apiCall)=>
		{
			if(!verifyPermissions(request, response, apiCall))
			{
				return
			}
			co(function*()
			{
				db = yield dbutils.connect()
				var users = yield userdb.searchUser(db, apiCall.params.name, apiCall.params.password)
				db.close()
				if(!users.length)
				{
					util.jsonResponse(response, {'message': 'User not found'}, 404)
				}
				var user = users[0]
				delete user.password
				util.jsonResponse(response, user, 200)

			})
			.catch(coCatch(request, response))
		},

		post: (request, response, apiCall)=>
		{
			if(!verifyPermissions(request, response, apiCall))
			{
				return
			}
			var db
			co(function*()
			{
				db = yield dbutils.connect()
				var user = request.body
				user.roles = user.roles || []

				yield userdb.insertUser(db, user)

				delete user.password
				util.jsonResponse(response, user, 200)
			})
			.catch(coCatch(request, response))
		},

		put: (request, response, apiCall)=>
		{
			if(!verifyPermissions(request, response, apiCall))
			{
				return
			}
			co(function*()
			{
				db = yield dbutils.connect()
				var users = yield userdb.updateUser(db, apiCall.user.name, apiCall.user.password)
				db.close()
				if(!users.length)
				{
					util.jsonResponse(response, {'message': 'User not found'}, 404)
				}
				var user = users[0]
				delete user.password
				util.jsonResponse(response, user, 200)

			})
			.catch(coCatch(request, response))
		},

		delete: (request, response, apiCall)=>
		{
			util.jsonResponse(response, {}, 200)
		}
	}
}