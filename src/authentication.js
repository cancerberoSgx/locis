// authentication : 
// https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens

var jwt = require('jsonwebtoken')
var dbutils = require('./db')
var user = require('./db/user')

function authenticateHandler(req, res, fn)
{
	var db
	dbutils.connect()
	.then(function(db_)
	{
		db = db_
		return user.searchUser(db, req.body.name, req.body.password)
	})
	.then(function(users)
	{
		db.close()
		if(!users || !users.length)
		{
			// console.log('no users for', req.body.name)
			fn({ 
				success: false, 
				message: 'Authentication failed. User not found.'
			})
		}
		else
		{
			var payload = {}
			payload[req.body.name] = req.body.password

			var token = jwt.sign(payload, 'superSecret')
			// return the information including token as JSON
			fn({
				success: true,
				message: 'Enjoy your token!',
				token: token,
				user: user
			})
		}
	})
	.catch(function(ex)
	{
		console.log(ex)
		if(typeof(db)!='undefined')
		{
			db.close()
		}
		fn({
			success: false, 
			message: ex+''
		})
	})
}

var authenticateMiddleware = function(req, res, fn)
{
	var token = req.body.token || req.query.token || req.headers['x-access-token']
	if (token) 
	{
		// verifies secret and checks exp
		jwt.verify(token, 'superSecret', (err, decoded)=>
		{      
			if (err) 
			{
				// console.log('Failed to authenticate token.' )
				return fn({ 
					success: false, 
					message: 'Failed to authenticate token.',
					status: 401
				})  
			} 
			else 
			{
				// if everything is good, save to request for use in other routes
				req.decoded = decoded

				// console.log('Authentication OK' )
				return fn()
			}
		})
	} 
	else 
	{
		// if there is no token - return an error
		// console.log('ERROR: No token provided.' )
		fn({ 
			success: false, 
			message: 'No token provided.',
			status: 40
		})
	}
}

function registerAuthTools(app, express)
{
	// get an instance of the router for api routes
	var apiRoutes = express.Router() 

	// route to authenticate a user (POST http://localhost:8080/api/authenticate)
	apiRoutes.post('/authenticate', authenticateHandler)

	// route middleware to verify a token
	apiRoutes.use(authenticateMiddleware)

	apiRoutes.get('/utility1', (req, res)=>
	{
		res.json({
			success: true,
			result: 123123
		})
	})

	// apply the routes to our application with the prefix /api
	app.use('/api', apiRoutes)

}

module.exports = {
	registerAuthTools: registerAuthTools,
	authenticateHandler: authenticateHandler,
	authenticateMiddleware: authenticateMiddleware,
}


