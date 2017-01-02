var assert = require('assert')

var insert = function(db, place)
{
	return new Promise((resolve, reject)=>
	{
		db.collection('places').insertOne( place, (err, result)=>
		{
			assert.equal(err, null)
			err ? reject(err) : resolve()
		})
	})
}

var remove = function(db, _id)
{
	return new Promise((resolve, reject)=>
	{
		db.collection('places').deleteMany({ "_id": _id}, (err, results) =>
		{
			err ? reject(err) : resolve(results)
		})
	})
}

var searchWithin = function(db, geometry)
{
	return new Promise((resolve, reject)=>
	{
		var cursor = db.collection('places').find({ 
			location: { 
				$geoWithin: { $geometry: geometry } 
			}
		})
		var docs = []
		cursor.each((err, doc) =>
		{
			assert.equal(err, null)
			if(err)
			{
				reject(err)
			}
			if (doc != null)
			{
				docs.push(doc)
			} 
			else 
			{
				resolve(docs)
			}
		})
	})
}

var removeAll = function(db)
{
	db.collection('places').deleteMany({})
}

var initialize = function(db)
{
	db.collection('places').createIndex( { location : "2dsphere" , category : -1, name: 1 } )
}

module.exports = {
	searchWithin: searchWithin,
	initialize: initialize,
	insert: insert,
	remove: remove,
	removeAll: removeAll
}