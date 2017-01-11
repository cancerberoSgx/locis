var assert = require('assert')

var insert = require('./dbutil').insert('places')

var search = require('./dbutil').search('places')

var deleteMany = require('./dbutil').delete('places')

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
	return deleteMany(db, {})
}

var initialize = function(db)
{
	db.collection('places').createIndex( { location : '2dsphere' , category : -1, name: 1 } )
}

module.exports = {
	searchWithin: searchWithin,
	initialize: initialize,
	insert: insert,
	remove: deleteMany,
	removeAll: removeAll,
	search: search
}