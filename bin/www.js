var args = require('yargs').argv

var options = {
	isProduction: args.production || false,
	baseFolder: 'html',
	defaultFile: '/index.html'
}

require('../src/server').start(options)

