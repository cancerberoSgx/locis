var util = require('../util')
var dbutils = require('../db')
var userdb = require('../db/user')

module.exports = {
	name: 'user',
	handler: {
		get: (request, response, apiCall)=>
		{
			// console.log(JSON.stringify(apiCall.user))
			if(!apiCall.user.roles.includes('administrator'))
			{
				util.jsonResponse(response, {'message': 'Not authorized'}, 401)
			}
			else
			{
				var db
				dbutils.connect()
				.then((db_)=>
				{
					db = db_
					return userdb.searchUser(db, apiCall.user.name, apiCall.user.password)
				})
				.then((users)=>
				{
					db.close()
					if(!users.length)
					{
						util.jsonResponse(response, {'message': 'User not found'}, 404)
					}
					var user = users[0]
					delete user.password
					util.jsonResponse(response, user, 200)
				})
				.catch((ex)=>
				{
					if(typeof(db)!='undefined')
					{
						db.close()
					}
					util.jsonResponse(response, {'message': ex+'\n\n'+ex.stack}, 500)
				})
			}
		},
		post: (request, response, apiCall)=>
		{
			util.jsonResponse(response, {}, 200)
		},
		put: (request, response, apiCall)=>
		{
			util.jsonResponse(response, {}, 200)
		},
		delete: (request, response, apiCall)=>
		{
			util.jsonResponse(response, {}, 200)
		}
	}
}