
function getFromFileExtention(extension) {

	switch (extension.toLowerCase()) {
		case 'css':
			return 'text/css';
		case 'gif':
			return 'image/gif';
		case 'htm':
		case 'html':
			return 'text/html';
		case 'jpg':
		case 'jpeg':
		case 'jpe':
			return 'image/jpeg';
		case 'js':
			return 'text/javascript';
		case 'json':
			return 'application/json';
		case 'png':
			return 'image/png';
		case 'tiff':
			return 'image/tiff';
		case 'txt':
			return 'text/plain';
		default:
			return 'application/octet-stream';
	}
}

function getFromFileName(filename) {
	return getFromFileExtention(filename.split('.').pop());
}

function getFromFilePath(path) {
	return getFromFileName(path);
}

module.exports = {
	getFromFileExtention: getFromFileExtention,
	getFromFileName: getFromFileName,
	getFromFilePath: getFromFilePath
};