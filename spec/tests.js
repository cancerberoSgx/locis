var request = require('superagent')

var url = 'http://localhost:3000/'
request.get(url).end(function(err, res)
{
	debugger;
})
