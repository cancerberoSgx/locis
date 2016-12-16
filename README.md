locis == "places" in latin

similar to google places but more colaborative and categorized content. Some high level characteristics

### initial description of the problem to solve

 * The idea is to have an API for 'categorized places' in a map
 * with rich geospatial queries
 * could use google places data&api for 'default categories'
 * but the idea is that the user is able to administer categories of places - collaboratively.
 * w authentication, support concepts of users, groups, read/write
 * Then There is a default html appplication that consumes it. (separated project, TBD) - with easy oauth google&facebook auth

For example, using a map and visual tools the user could perform the following query: 

 * from 'montevideo restaurants groovy' category, give me the places to the north of my current position with foodtype.contains('pasta') 
 * First et me visually declare a 'barrioSur' polygon in some category. Then, from 'Lima Banreds ATM' category, give me the ones INSIDE 'barrioSur' shape-place (custom polygon)
 * Let me visually declare place-shape 'Bv España' in the map (complex line segment). Then I want to know the places from 'La Habana - Cuba Recycles' category, the places wich are no further than 200 meters from 'Bv España' street.

Future: 
 * investigate formats for import/export from public data (streets, etc.)
 * Dynamic places. Imagine that in some cities, public transport support an open API for the position of its vehicles. I want to develop a plugin to connect to that information and associate a Place with a handler that trigger position:changed event. 

##Install: 

	npm install

##starting the server : 

	node bin/www

##running mongodb server

	mkdir /tmp/dbtest1; mongod --dbpath /tmp/dbtest1

##running tests 

(automatically will start the web server - *make sure isn't one running*)

	killall node; npm test

 * after that npm test will start working
 * mongodb server must be running. 
 * Make sure the server at (http://localhost:3000) is killed first (killall node)
 * Try to execute the tests twice since in the first time a new user is created. 

##Calling the API

See spec/test1Spec.js - it will turn on the server, ask for a web token, and call the API using that webtoken. An example using superagent

	new Promise(function(resolve, reject)
	{
		//first obtain the token
		request
		.post('http://localhost:3000/api/authenticate')
		.send({name: 'sgurin', password: 'test123'})
		.end(function(err, res)
		{
			err ? reject(err) : resolve(res.body.token);
		})
	})
	.then(function(token)
	{
		//now make the api call passing the token
		return new Promise(function(resolve, reject)
		{
			request
			.get('http://localhost:3000/api/utility1')
			.set('x-access-token', token)
			.end(function(err, res)
			{
				err ? reject(err) : resolve(res.body.result);
			});
		});
	})
	.then(function(result)
	{
		//we have the api call result :)
		expect(result).toBe(123123)
		cb()
	})
	.catch(function(err)
	{
		console.log('ERROR', err.toString())
		cb()
	});


##Tecnhnologies used

we choosed the following technologies: 

 * mongodb, for storing the data, particularly geospatial index for rich spatial queries
 * express for web container
 * jsonwebtoken for auth
 * ecma6+co+promises

for developing/tests we use:

 * superagent
 * jasmine

