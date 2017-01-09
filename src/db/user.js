var search = require('./dbutil').search('users')

var searchUser = function(db, name, password, callback)
{
	return search(db, {name: name, password:password}, callback)
}

var updateUser = require('./dbutil').update('users')

var insertUser = require('./dbutil').insert('users')

var removeUsers = require('./dbutil').delete('users')

module.exports = {
	searchUser: searchUser,
	search: search,
	insertUser: insertUser,
	removeUsers: removeUsers,
	updateUser: updateUser
}