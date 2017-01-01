// examples from https://docs.mongodb.com/getting-started/node/client/
// this file is a very primitive model class - see spec/dbTest1Spec.js on how to use it

var MongoClient = require('mongodb').MongoClient

module.exports = {
	url: 'mongodb://localhost:27017/test'

,	connect: function(callback)
	{
		return new Promise((resolve, reject)=>
		{
			MongoClient.connect(this.url, (err, db) =>
			{
				callback ? callback(err, db) : null
				err ? reject(err) : resolve(db)
			})
		})
	}

,	initialize: function(db)
	{
		return new Promise((resolve, reject)=>
		{
			if(this.initialized)
			{
				resolve()
			}
			else
			{
				require('./place').initialize(db)
				this.initialized = true
				resolve()
			}
		})
	}

,	initialized: false

}
