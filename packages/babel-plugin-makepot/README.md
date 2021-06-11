# Babel Plugin Makepot

Babel plugin used to scan JavaScript files for use of localization functions. It then compiles these into a [gettext POT formatted](https://en.wikipedia.org/wiki/Gettext) file as a template for translation. By default the output file will be written to `gettext.pot` of the root project directory. This can be overridden using the `"output"` option of the plugin.

```json
{
	"plugins": [
		[
			"@wordpress/babel-plugin-makepot",
			{ "output": "languages/myplugin.pot" }
		]
	]
}
```

## Installation

Install the module:

```bash
npm install @wordpress/babel-plugin-makepot --save-dev
```

**Note**: This package requires Node.js 12.0.0 or later. It is not compatible with older versions.

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
