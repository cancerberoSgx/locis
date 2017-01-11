/*
Usage: 

	cd locis/html
	node build/devel-watch.js
*/

var watch = require('watch')
var path = require('path')
var compileJavaScript = require('./util').compileJavaScript

var fileTypes = [ 
	{
		extension: '.js', 
		label: 'JavaScript', 
		compile: require('./util').compileJavaScript
	},
	{
		extension: '.less', 
		label: 'Less', 
		compile: require('./util').compileLess
	}
]

watch.watchTree('src', function (f, curr, prev) 
{
	if (typeof f == 'object' && prev === null && curr === null) 
	{
		// Finished walking the tree
		// console.log('Finished walking the tree')
	} 
	else if (prev === null) 
	{
		// f is a new file
	} 
	else if (curr.nlink === 0) 
	{
		// f was removed
	} 
	else 
	{
		//f was changed
		var ext = path.extname(f)
		var ft = fileTypes.find((ft)=>{return ft.extension == ext})

		console.log(ft.label+' compilation started')
		ft.compile(()=>
		{
			console.log(ft.label+' compilation ended')
		})
		
	}
})
