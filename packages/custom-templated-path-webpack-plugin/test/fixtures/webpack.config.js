/**
 * External dependencies
 */
const { basename } = require( 'path' );

/**
 * WordPress dependencies
 */
const CustomTemplatedPathPlugin = require( '@wordpress/custom-templated-path-webpack-plugin' );

module.exports = {
	mode: 'development',
	context: __dirname,
	entry: './entry',
	output: {
		filename: 'build/[basename]-[theanswertolife].js',
		path: __dirname,
	},
	plugins: [
		new CustomTemplatedPathPlugin( {
			basename( path, data ) {
				let rawRequest;
				if ( data && data.chunk && data.chunk.entryModule ) {
					rawRequest = data.chunk.entryModule.rawRequest;
				}

				if ( rawRequest ) {
					return basename( rawRequest );
				}

				return path;
			},
			theanswertolife() {
				return 42;
			},
		} ),
	],
};
