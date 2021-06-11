# NPM Package.json Lint Config

WordPress [npm-package-json-lint](https://github.com/tclindner/npm-package-json-lint) shareable configuration.

## Installation

Install the module

```shell
$ npm install @wordpress/npm-package-json-lint-config
```

**Note**: This package requires Node.js 12.0.0 or later. It is not compatible with older versions.

## Usage

Add this to your `package.json` file:

```json
"npmpackagejsonlint": {
	"extends": "@wordpress/npm-package-json-lint-config",
},
```

Or to a `.npmpackagejsonlintrc.json` file in the root of your repo:

```json
{
	"extends": "@wordpress/npm-package-json-lint-config"
}
```

To add, modify, or override any [npm-package-json-lint](https://github.com/tclindner/npm-package-json-lint/wiki) rules add this to your `package.json` file:

```json
"npmpackagejsonlint": {
	"extends": "@wordpress/npm-package-json-lint-config",
	"rules": {
		"valid-values-author": [
			"error",
			[
				"WordPress"
			]
		]
	}
},
```

Or to a `.npmpackagejsonlintrc.json` file in the root of your repo:

```json
{
	"extends": "@wordpress/npm-package-json-lint-config",
	"rules": {
		"require-publishConfig": "error",
		"valid-values-author": [ "error", [ "WordPress" ] ]
	}
}
```

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
