
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

			console.log(1)
			for (var i = 0; i < 50; i++) 
			{
				var place = {
					location: testUtils.randomLocationPoint(1,50,1,50)
				,	name: 'sample name'+i
				,	description: 'sample description'+i
				,	category: 'sample category'
				}
				yield placedb.insert(db, place)
			}

			var polygon = {
				type: "Polygon",
				coordinates: [[
					[0, 0],
					[0, 51],
					[51, 51],
					[51, 0],
					[0, 0]
				]]
			}
			console.log(3)
			var results = yield placedb.searchWithin(db, polygon)
			expect(results.length).toBe(50)

			db.close()
			cb()
		})
		.catch(coCatch)
	})
})