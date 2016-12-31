
function getFromFileExtention(extension) 
{

	switch (extension.toLowerCase()) 
	{
		case 'css':
			return('text/css');
		break;
		case 'gif':
			return('image/gif');
		break;
		case 'htm':
		case 'html':
			return('text/html');
		break;
		case 'jpg':
		case 'jpeg':
		case 'jpe':
			return('image/jpeg');
		break;
		case 'js':
			return('text/javascript');
		break;
		case 'json':
			return('application/json');
		break;
		case 'png':
			return('image/png');
		break;
		case 'tiff':
			return('image/tiff');
		break;
		case 'txt':
			return('text/plain');
		break;
		default:
			return('application/octet-stream');
		break;
	}

}

function getFromFileName(filename) 
{
	return(getFromFileExtention(filename.split('.').pop()));
}

function getFromFilePath(path) 
{
	return(getFromFileName(path));
}

module.exports = {
	getFromFileExtention: getFromFileExtention,
	getFromFileName: getFromFileName,
	getFromFilePath: getFromFilePath
}