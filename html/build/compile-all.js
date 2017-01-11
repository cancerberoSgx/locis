// Please execute this command as follows: node build/devel.js

var util = require('./util')

// util.compileAll( ()=>{util.startServer2()} )

console.log('Start compile all')
util.compileAll(() =>
{
	console.log('End compile all')
})