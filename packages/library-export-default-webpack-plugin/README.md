# Library Export Default Webpack Plugin

Webpack plugin for exporting `default` property for selected libraries which use ES6 Modules. Implementation is based on the Webpack's core plugin [ExportPropertyMainTemplatePlugin](https://github.com/webpack/webpack/blob/51b0df77e4f366163730ee465f01458bfad81f34/lib/ExportPropertyMainTemplatePlugin.js). The only difference is that this plugin allows to include all entry point names where the default export of your entry point will be assigned to the library target.

## Installation

Install the module

```bash
npm install @wordpress/library-export-default-webpack-plugin --save
```

**Note**: This package requires Node.js 12.0.0 or later. It also requires webpack 4.0 and newer. It is not compatible with older versions.

## Usage

Construct an instance of `LibraryExportDefaultPlugin` in your Webpack configurations plugins entry, passing an array where values correspond to the entry point name.

The following example selects `boo` entry point to be updated by the plugin. When compiled, the built file will ensure that `default` value exported for the chunk will be assigned to the global variable `wp.boo`. `foo` chunk will remain untouched.

```js
const LibraryExportDefaultPlugin = require( '@wordpress/library-export-default-webpack-plugin' );

module.exports = {
	// ...

	entry: {
		boo: './packages/boo',
		foo: './packages/foo',
	},

	output: {
		filename: 'build/[name].js',
		path: __dirname,
		library: [ 'wp', '[name]' ],
		libraryTarget: 'this',
	},

	plugins: [ new LibraryExportDefaultPlugin( [ 'boo' ] ) ],
};
```

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
