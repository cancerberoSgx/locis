var assert = require('assert')

var searchUser = function(db, name, password, callback)
{
	return new Promise(function(resolve, reject)
	{
		var cursor = db.collection('users').find({name: name, password: password});
		var docs = []
		cursor.each(function(err, doc) 
		{
			assert.equal(err, null);
			if(err)
			{	
				callback && callback(err)
				reject(err)
			}
			if (doc != null)
			{
				docs.push(doc);
			} 
			else 
			{
				callback && callback(null, docs);
				resolve(docs);    
			}
		});
	});
}

var insertUser = function(db, user, callback)
{
	return new Promise(function(resolve, reject)
	{
		db.collection('users').insertOne( user, function(err, result) 
		{
			assert.equal(err, null);
			err ? reject(err) : resolve()
			callback && callback(err);
		});
	})
}

var removeUser = function(db, userId, callback)
{
	return new Promise(function(resolve, reject)
	{
		db.collection('users').deleteMany(
			{ "_id": userId},
			function(err, results) 
			{
				err ? reject(err) : resolve(results); 
				callback && callback(err, results);
			}
		);
	})
}

module.exports = {
	searchUser: searchUser,
	insertUser: insertUser,
	removeUser: removeUser
}