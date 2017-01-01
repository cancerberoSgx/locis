
var dbutils = require('../src/db')
var placedb = require('../src/db/place')
var testUtils = require('./testUtils')
var co = require('co')

var coCatch = function(err)
{
	expect(err).toBe(undefined)
	console.log('DB connection ERROR: ', err)
	cb()
}

describe('', function()
{
	it('place search delete', function(cb)
	{
		co(function*() 
		{
			var db = yield dbutils.connect()
			yield dbutils.initialize(db)

			console.time('remove')
			placedb.removeAll(db)
			// console.timeEnd('remove')

			console.time('add')
			var COUNT = 10, size = 50
			for (var i = 0; i < COUNT; i++) 
			{
				var place = {
					location: testUtils.randomLocationPoint(1,size,1,size)
				,	name: 'sample name'+i
				,	description: 'sample description'+i
				,	category: 'sample category'
				}
				yield placedb.insert(db, place)
			}

			// console.timeEnd('add')

			console.time('search')
			var polygon = {
				type: "Polygon",
				coordinates: [[
					[0, 0],
					[0, size+1],
					[size+1, size+1],
					[size+1, 0],
					[0, 0]
				]]
			}
			var results = yield placedb.searchWithin(db, polygon)
			expect(results.length).toBe(COUNT)

			// console.timeEnd('search')
			db.close()
			cb()
		})
		.catch(coCatch)
	})
})