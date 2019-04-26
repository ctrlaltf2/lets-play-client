const path = require('path');

module.exports = {
    entry: './src/js/Main.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'root')
	}
}
