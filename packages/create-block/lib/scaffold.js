/**
 * External dependencies
 */
const { camelCase, snakeCase } = require( 'change-case' );

/**
 * Internal dependencies
 */
const initBlock = require( './init-block' );
const initPackageJSON = require( './init-package-json' );
const initWPScripts = require( './init-wp-scripts' );
const initWPEnv = require( './init-wp-env' );
const { code, info, success } = require( './log' );
const { writeOutputAsset, writeOutputTemplate } = require( './output' );

function upperFirst( str ) {
	return str.charAt( 0 ).toUpperCase() + str.substr( 1 );
}

module.exports = async (
	{ blockOutputTemplates, pluginOutputTemplates, outputAssets },
	{
		$schema,
		apiVersion,
		namespace,
		slug,
		title,
		description,
		dashicon,
		category,
		attributes,
		supports,
		author,
		pluginURI,
		license,
		licenseURI,
		domainPath,
		updateURI,
		version,
		wpScripts,
		wpEnv,
		npmDependencies,
		npmDevDependencies,
		customScripts,
		folderName,
		editorScript,
		editorStyle,
		style,
	}
) => {
	slug = slug.toLowerCase();
	namespace = namespace.toLowerCase();

	info( '' );
	info( `Creating a new WordPress plugin in the "${ slug }" directory.` );

	const view = {
		$schema,
		apiVersion,
		namespace,
		namespaceSnakeCase: snakeCase( namespace ),
		slug,
		slugSnakeCase: snakeCase( slug ),
		slugPascalCase: upperFirst( camelCase( slug ) ),
		title,
		description,
		dashicon,
		category,
		attributes,
		supports,
		version,
		author,
		pluginURI,
		license,
		licenseURI,
		textdomain: slug,
		domainPath,
		updateURI,
		wpScripts,
		wpEnv,
		npmDependencies,
		npmDevDependencies,
		customScripts,
		folderName,
		editorScript,
		editorStyle,
		style,
	};

	await Promise.all(
		Object.keys( pluginOutputTemplates ).map(
			async ( outputFile ) =>
				await writeOutputTemplate(
					pluginOutputTemplates[ outputFile ],
					outputFile,
					view
				)
		)
	);

	await Promise.all(
		Object.keys( outputAssets ).map(
			async ( outputFile ) =>
				await writeOutputAsset(
					outputAssets[ outputFile ],
					outputFile,
					view
				)
		)
	);

	await initBlock( blockOutputTemplates, view );

	await initPackageJSON( view );

	if ( wpScripts ) {
		await initWPScripts( view );
	}

	if ( wpEnv ) {
		await initWPEnv( view );
	}

	info( '' );
	success(
		`Done: WordPress plugin "${ title }" bootstrapped in the "${ slug }" directory.`
	);
	if ( wpScripts ) {
		info( '' );
		info( 'You can run several commands inside:' );
		info( '' );
		code( '  $ npm start' );
		info( '    Starts the build for development.' );
		info( '' );
		code( '  $ npm run build' );
		info( '    Builds the code for production.' );
		info( '' );
		code( '  $ npm run format' );
		info( '    Formats files.' );
		info( '' );
		code( '  $ npm run lint:css' );
		info( '    Lints CSS files.' );
		info( '' );
		code( '  $ npm run lint:js' );
		info( '    Lints JavaScript files.' );
		info( '' );
		code( '  $ npm run plugin-zip' );
		info( '    Creates a zip file for a WordPress plugin.' );
		info( '' );
		code( '  $ npm run packages-update' );
		info( '    Updates WordPress packages to the latest version.' );
	}
	info( '' );
	info( 'To enter the directory type:' );
	info( '' );
	code( `  $ cd ${ slug }` );
	if ( wpScripts ) {
		info( '' );
		info( 'You can start development with:' );
		info( '' );
		code( '  $ npm start' );
	}
	if ( wpEnv ) {
		info( '' );
		info( 'You can start WordPress with:' );
		info( '' );
		code( '  $ npx wp-env start' );
	}
	info( '' );
	info( 'Code is Poetry' );
};
