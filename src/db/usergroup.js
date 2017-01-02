var assert = require('assert')
var _ = require('underscore')

var getGroupsOfUser = function(db, userId, callback)
{
	return new Promise((resolve, reject)=>
	{
		var cursor = db.collection('usergroups').find({users: userId})
		var docs = []
		cursor.each((err, doc) =>
		{
			assert.equal(err, null)
			if(err)
			{	
				callback && callback(err)
				reject(err)
			}
			if (doc != null)
			{
				docs.push(doc)
			} 
			else 
			{
				callback && callback(null, docs)
				resolve(docs)    
			}
		})
	})
}

var addUsersToGroups = function(db, userIds, userGroupIds, callback)
{
	if(!userIds || !userGroupIds)
	{
		return new Promise((resolve, reject)=>{reject(new Error('Must provide userIds and userGroupsIds'))})
	}
	return new Promise((resolve, reject)=>
	{
		var cursor = db.collection('usergroups').find({_id: {$in: userGroupIds}})
		cursor.each((err, doc) =>
		{
			if(err)
			{
				return reject(err)
			}
			else if(!doc)
			{
				return resolve()
			}
			doc.users = doc.users || []
			doc.users = _.union(doc.users, userIds)
			db.collection('usergroups').save(doc)
			callback && callback(null, doc)
			resolve()
		})
	})
}

var insert = function(db, userGroup, callback)
{
	return new Promise((resolve, reject)=>
	{
		db.collection('usergroups').insertOne(userGroup, (err, result) =>
		{
			assert.equal(err, null)
			err ? reject(err) : resolve()
			callback && callback(err)
		})
	})
}

var removeAll = function(db)
{
	db.collection('usergroups').deleteMany({})
}

var removeUserGroup = function(db, userId, callback)
{
	return new Promise((resolve, reject)=>
	{
		db.collection('usergroups').deleteMany({_id: userId},	(err, results) =>
		{
			err ? reject(err) : resolve(results) 
			callback && callback(err, results)
		})
	})
}

module.exports = {
	getGroupsOfUser: getGroupsOfUser,
	insert: insert,
	removeUserGroup: removeUserGroup,
	addUsersToGroups: addUsersToGroups,
	removeAll: removeAll
}