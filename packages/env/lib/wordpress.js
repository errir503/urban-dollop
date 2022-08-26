/**
 * External dependencies
 */
const dockerCompose = require( 'docker-compose' );
const util = require( 'util' );
const fs = require( 'fs' ).promises;
const path = require( 'path' );
const got = require( 'got' );

/**
 * Promisified dependencies
 */
const copyDir = util.promisify( require( 'copy-dir' ) );

/**
 * @typedef {import('./config').WPConfig} WPConfig
 * @typedef {import('./config').WPServiceConfig} WPServiceConfig
 * @typedef {import('./config').WPSource} WPSource
 * @typedef {'development'|'tests'} WPEnvironment
 * @typedef {'development'|'tests'|'all'} WPEnvironmentSelection
 */

/**
 * Checks a WordPress database connection. An error is thrown if the test is
 * unsuccessful.
 *
 * @param {WPConfig} config The wp-env config object.
 */
async function checkDatabaseConnection( { dockerComposeConfigPath, debug } ) {
	await dockerCompose.run( 'cli', 'wp db check', {
		config: dockerComposeConfigPath,
		commandOptions: [ '--rm' ],
		log: debug,
	} );
}

/**
 * Configures WordPress for the given environment by installing WordPress,
 * activating all plugins, and activating the first theme. These steps are
 * performed sequentially so as to not overload the WordPress instance.
 *
 * @param {WPEnvironment} environment The environment to configure. Either 'development' or 'tests'.
 * @param {WPConfig}      config      The wp-env config object.
 * @param {Object}        spinner     A CLI spinner which indicates progress.
 */
async function configureWordPress( environment, config, spinner ) {
	const url = ( () => {
		const port = config.env[ environment ].port;
		const domain =
			environment === 'tests'
				? config.env.tests.config.WP_TESTS_DOMAIN
				: config.env.development.config.WP_SITEURL;
		if ( port === 80 ) {
			return domain;
		}

		return `${ domain }:${ port }`;
	} )();

	const installCommand = `wp core install --url="${ url }" --title="${ config.name }" --admin_user=admin --admin_password=password --admin_email=wordpress@example.com --skip-email`;

	// -eo pipefail exits the command as soon as anything fails in bash.
	const setupCommands = [ 'set -eo pipefail', installCommand ];

	// Set wp-config.php values.
	for ( let [ key, value ] of Object.entries(
		config.env[ environment ].config
	) ) {
		// Allow the configuration to skip a default constant by specifying it as null.
		if ( null === value ) {
			continue;
		}

		// Add quotes around string values to work with multi-word strings better.
		value = typeof value === 'string' ? `"${ value }"` : value;
		setupCommands.push(
			`wp config set ${ key } ${ value } --anchor="define( 'WP_DEBUG',"${
				typeof value !== 'string' ? ' --raw' : ''
			}`
		);
	}

	// Activate all plugins.
	for ( const pluginSource of config.env[ environment ].pluginSources ) {
		setupCommands.push( `wp plugin activate ${ pluginSource.basename }` );
	}

	if ( config.debug ) {
		spinner.info(
			`Running the following setup commands on the ${ environment } instance:\n - ${ setupCommands.join(
				'\n - '
			) }\n`
		);
	}

	// Execute all setup commands in a batch.
	await dockerCompose.run(
		environment === 'development' ? 'cli' : 'tests-cli',
		[ 'bash', '-c', setupCommands.join( ' && ' ) ],
		{
			config: config.dockerComposeConfigPath,
			log: config.debug,
		}
	);

	// WordPress' PHPUnit suite expects a `wp-tests-config.php` in
	// the directory that the test suite is contained within.
	// Make sure ABSPATH points to the WordPress install.
	await dockerCompose.exec(
		environment === 'development' ? 'wordpress' : 'tests-wordpress',
		[
			'sh',
			'-c',
			`sed -e "/^require.*wp-settings.php/d" -e "s/define( 'ABSPATH', __DIR__ . '\\/' );/define( 'ABSPATH', '\\/var\\/www\\/html\\/' );\\n\\tdefine( 'WP_DEFAULT_THEME', 'default' );/" /var/www/html/wp-config.php > /wordpress-phpunit/wp-tests-config.php`,
		],
		{
			config: config.dockerComposeConfigPath,
			log: config.debug,
		}
	);
}

/**
 * Resets the development server's database, the tests server's database, or both.
 *
 * @param {WPEnvironmentSelection} environment The environment to clean. Either 'development', 'tests', or 'all'.
 * @param {WPConfig}               config      The wp-env config object.
 */
async function resetDatabase(
	environment,
	{ dockerComposeConfigPath, debug }
) {
	const options = {
		config: dockerComposeConfigPath,
		commandOptions: [ '--rm' ],
		log: debug,
	};

	const tasks = [];

	if ( environment === 'all' || environment === 'development' ) {
		tasks.push( dockerCompose.run( 'cli', 'wp db reset --yes', options ) );
	}

	if ( environment === 'all' || environment === 'tests' ) {
		tasks.push(
			dockerCompose.run( 'tests-cli', 'wp db reset --yes', options )
		);
	}

	await Promise.all( tasks );
}

async function setupWordPressDirectories( config ) {
	if (
		config.env.development.coreSource &&
		hasSameCoreSource( [ config.env.development, config.env.tests ] )
	) {
		await copyCoreFiles(
			config.env.development.coreSource.path,
			config.env.development.coreSource.testsPath
		);
		await createUploadsDir( config.env.development.coreSource.testsPath );
	}

	const checkedPaths = {};
	for ( const { coreSource } of Object.values( config.env ) ) {
		if ( coreSource && ! checkedPaths[ coreSource.path ] ) {
			await createUploadsDir( coreSource.path );
			checkedPaths[ coreSource.path ] = true;
		}
	}
}

async function createUploadsDir( corePath ) {
	// Ensure the tests uploads folder is writeable for travis,
	// creating the folder if necessary.
	const uploadPath = path.join( corePath, 'wp-content/uploads' );
	await fs.mkdir( uploadPath, { recursive: true } );
	await fs.chmod( uploadPath, 0o0767 );
}

/**
 * Returns true if all given environment configs have the same core source.
 *
 * @param {WPServiceConfig[]} envs An array of environments to check.
 *
 * @return {boolean} True if all the environments have the same core source.
 */
function hasSameCoreSource( envs ) {
	if ( envs.length < 2 ) {
		return true;
	}
	return ! envs.some( ( env ) =>
		areCoreSourcesDifferent( envs[ 0 ].coreSource, env.coreSource )
	);
}

function areCoreSourcesDifferent( coreSource1, coreSource2 ) {
	if (
		( ! coreSource1 && coreSource2 ) ||
		( coreSource1 && ! coreSource2 )
	) {
		return true;
	}

	if ( coreSource1 && coreSource2 && coreSource1.path !== coreSource2.path ) {
		return true;
	}

	return false;
}

/**
 * Copies a WordPress installation, taking care to ignore large directories
 * (.git, node_modules) and configuration files (wp-config.php).
 *
 * @param {string} fromPath Path to the WordPress directory to copy.
 * @param {string} toPath   Destination path.
 */
async function copyCoreFiles( fromPath, toPath ) {
	await copyDir( fromPath, toPath, {
		filter( stat, filepath, filename ) {
			if ( stat === 'symbolicLink' ) {
				return false;
			}
			if ( stat === 'directory' && filename === '.git' ) {
				return false;
			}
			if ( stat === 'directory' && filename === 'node_modules' ) {
				return false;
			}
			if ( stat === 'file' && filename === 'wp-config.php' ) {
				return false;
			}
			return true;
		},
	} );
}

/**
 * Scans through a WordPress source to find the version of WordPress it contains.
 *
 * @param {WPSource} coreSource The WordPress source.
 * @param {Object}   spinner    A CLI spinner which indicates progress.
 * @param {boolean}  debug      Indicates whether or not the CLI is in debug mode.
 * @return {string} The version of WordPress the source is for.
 */
async function readWordPressVersion( coreSource, spinner, debug ) {
	const versionFilePath = path.join(
		coreSource.path,
		'wp-includes',
		'version.php'
	);
	const versionFile = await fs.readFile( versionFilePath, {
		encoding: 'utf-8',
	} );
	const versionMatch = versionFile.match(
		/\$wp_version = '([A-Za-z\-0-9.]+)'/
	);
	if ( ! versionMatch ) {
		throw new Error( `Failed to find version in ${ versionFilePath }` );
	}

	if ( debug ) {
		spinner.info(
			`Found WordPress ${ versionMatch[ 1 ] } in ${ versionFilePath }.`
		);
	}

	return versionMatch[ 1 ];
}

/**
 * Returns the latest stable version of WordPress by requesting the stable-check
 * endpoint on WordPress.org.
 *
 * @return {string} The latest stable version of WordPress, like "6.0.1"
 */
let CACHED_WP_VERSION;
async function getLatestWordPressVersion() {
	// Avoid extra network requests.
	if ( CACHED_WP_VERSION ) {
		return CACHED_WP_VERSION;
	}

	const versions = await got(
		'https://api.wordpress.org/core/stable-check/1.0/'
	).json();

	for ( const [ version, status ] of Object.entries( versions ) ) {
		if ( status === 'latest' ) {
			CACHED_WP_VERSION = version;
			return version;
		}
	}
}

module.exports = {
	hasSameCoreSource,
	checkDatabaseConnection,
	configureWordPress,
	resetDatabase,
	setupWordPressDirectories,
	readWordPressVersion,
	getLatestWordPressVersion,
};
