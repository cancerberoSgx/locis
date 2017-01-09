// examples from https://docs.mongodb.com/getting-started/node/client/
// this file is a very primitive model class - see spec/dbTest1Spec.js on how to use it

var MongoClient = require('mongodb').MongoClient

var reuseDbInstance = true  //make sure is true for production - if false it will open / close db connection each time

var db //for performance reasons we use always the same db instance and we disable closing it. 

module.exports = {
	url: 'mongodb://localhost:27017/test'

,	connect: function(callback)
	{
		return new Promise((resolve, reject)=>
		{
			if(reuseDbInstance && db)
			{
				//TODO: check if it is connected
				resolve(db)
				callback && callback(null, db)
			}
			else
			{
				MongoClient.connect(this.url, (err, _db) =>
				{
					if(!err)
					{
						db = _db
						if(reuseDbInstance)
						{
							db.close = function(){}
						}
					}
					if(err)
					{
						reject(err)
					}
					else
					{
						resolve(db)
					}
					callback && callback(err, db)
				})
			}
			
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
