var request = require('superagent')
var utils = require('./testUtils')
var dbutils = require('../src/db')
var co = require('co')

var coCatch = function(err)
{
	expect(err).toBe(undefined)
	console.log('DB connection ERROR: ', err)
	cb()
}

describe('', function()
{
	it('connect callback', function(cb)
	{
		dbutils.connect(function(err, db)
		{
			expect(!!err).toBe(false)
			expect(!!db).toBe(true)
			db.close()
			cb()
		})
		.catch(coCatch)
	})

	it('connect promise', function(cb)
	{
		dbutils
		.connect()
		.then(function(db)
		{
			expect(!!db).toBe(true)
			db.close()
			cb()
		})
		.catch(coCatch)
	})

	it('connect insert search', function(cb)
	{
		co(function*() 
		{
			var db = yield dbutils.connect()
			yield dbutils.insertDocument(db)
			var result = yield dbutils.findRestaurants(db)
			expect(result.length>0).toBe(true)
			db.close()
			cb()
		})
		.catch(coCatch)
	})

	// //same as before w promises
	// it('connect insert search', function(cb)
	// {
	// 	var db 
	// 	db
	// 	.connect()
	// 	.then(function(db_)
	// 	{
	// 		db = db_
	// 		return db.insertDocument(db)
	// 	})
	// 	.then(function()
	// 	{
	// 		return db.findRestaurants(db)
	// 	})
	// 	.then(function(result)
	// 	{
	// 		expect(result.length>0).toBe(true)
	// 	})


	// 	// .then(function()
	// 	// {
	// 	// 	return db.removeRestaurants(db)
	// 	// })
	// 	// .then(function()
	// 	// {
	// 	// 	return db.findRestaurants(db)
	// 	// })
	// 	// .then(function(result)
	// 	// {
	// 	// 	expect(result.length).toBe(0)
	// 	// })

	// 	// .then(function(db_)
	// 	// {
	// 	// 	db = db_
	// 	// 	return db.insertDocument(db)
	// 	// })

	// 	//close data base and catch errors:
	// 	.then(function()
	// 	{
	// 		db.close()
	// 		cb()
	// 	})
	// 	.catch(function(err)
	// 	{
	// 		expect(err).toBe(undefined)
	// 		console.log('DB connection ERROR: ', err) 
	// 		db.close()
	// 		cb()
	// 	})
	// })






	

})