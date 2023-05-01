'use strict';
/* eslint-disable jest/no-conditional-expect */
/**
 * External dependencies
 */
const path = require( 'path' );

/**
 * Internal dependencies
 */
const { parseConfig } = require( '../parse-config' );
const readRawConfigFile = require( '../read-raw-config-file' );
const { getLatestWordPressVersion } = require( '../../wordpress' );
const { ValidationError } = require( '../validate-config' );
const detectDirectoryType = require( '../detect-directory-type' );

jest.mock( 'got', () => jest.fn() );
jest.mock( '../read-raw-config-file', () => jest.fn() );
jest.mock( '../detect-directory-type', () => jest.fn() );
jest.mock( '../../wordpress', () => ( {
	getLatestWordPressVersion: jest.fn(),
} ) );

/**
 * Since our configurations are merged, we will want to refer to the parsed default config frequently.
 */
const DEFAULT_CONFIG = {
	port: 8888,
	testsPort: 8889,
	phpVersion: null,
	coreSource: {
		type: 'git',
		url: 'https://github.com/WordPress/WordPress.git',
		ref: '100.0.0',
		path: '/cache/WordPress',
		clonePath: '/cache/WordPress',
		basename: 'WordPress',
		testsPath: '/cache/tests-WordPress',
	},
	pluginSources: [],
	themeSources: [],
	config: {
		WP_DEBUG: true,
		SCRIPT_DEBUG: true,
		WP_ENVIRONMENT_TYPE: 'local',
		WP_PHP_BINARY: 'php',
		WP_TESTS_EMAIL: 'admin@example.org',
		WP_TESTS_TITLE: 'Test Blog',
		WP_TESTS_DOMAIN: 'localhost',
		WP_SITEURL: 'http://localhost',
		WP_HOME: 'http://localhost',
	},
	mappings: {},
	env: {
		development: {},
		tests: {
			config: {
				WP_DEBUG: false,
				SCRIPT_DEBUG: false,
			},
		},
	},
};

describe( 'parseConfig', () => {
	beforeEach( () => {
		readRawConfigFile.mockResolvedValue( null );
		detectDirectoryType.mockResolvedValue( null );
		getLatestWordPressVersion.mockResolvedValue( '100.0.0' );
	} );

	afterEach( () => {
		jest.clearAllMocks();
		delete process.env.WP_ENV_PORT;
		delete process.env.WP_ENV_TESTS_PORT;
		delete process.env.WP_ENV_CORE;
		delete process.env.WP_ENV_PHP_VERSION;
	} );

	it( 'should return default config', async () => {
		const parsed = await parseConfig( './', '/cache' );

		expect( parsed ).toEqual( DEFAULT_CONFIG );
	} );

	it( 'should infer a core mounting default when ran from a WordPress directory', async () => {
		detectDirectoryType.mockResolvedValue( 'core' );

		const parsed = await parseConfig( './', '/cache' );

		expect( parsed ).toEqual( {
			...DEFAULT_CONFIG,
			coreSource: {
				basename: 'gutenberg',
				path: path.resolve( '.' ),
				testsPath: '/cache/tests-gutenberg',
				type: 'local',
			},
		} );
	} );

	it( 'should infer a plugin mounting default when ran from a plugin directory', async () => {
		detectDirectoryType.mockResolvedValue( 'plugin' );

		const parsed = await parseConfig( './', '/cache' );

		expect( parsed ).toEqual( {
			...DEFAULT_CONFIG,
			pluginSources: [
				{
					basename: 'gutenberg',
					path: path.resolve( '.' ),
					type: 'local',
				},
			],
		} );
	} );

	it( 'should infer a theme mounting default when ran from a theme directory', async () => {
		detectDirectoryType.mockResolvedValue( 'theme' );

		const parsed = await parseConfig( './', '/cache' );

		expect( parsed ).toEqual( {
			...DEFAULT_CONFIG,
			themeSources: [
				{
					basename: 'gutenberg',
					path: path.resolve( '.' ),
					type: 'local',
				},
			],
		} );
	} );

	it( 'should merge configs with precedence', async () => {
		readRawConfigFile.mockImplementation( async ( configFile ) => {
			if ( configFile === path.resolve( './.wp-env.json' ) ) {
				return {
					core: 'WordPress/WordPress#Test',
					phpVersion: '1.0',
					env: {
						development: {
							port: 1234,
						},
						tests: {
							port: 5678,
						},
					},
				};
			}

			if ( configFile === path.resolve( './.wp-env.override.json' ) ) {
				return {
					phpVersion: '2.0',
					env: {
						tests: {
							port: 1011,
						},
					},
				};
			}

			throw new Error( 'Invalid File: ' + configFile );
		} );

		const parsed = await parseConfig( './', '/cache' );

		const expected = {
			...DEFAULT_CONFIG,
			coreSource: {
				basename: 'WordPress',
				path: '/cache/WordPress',
				clonePath: '/cache/WordPress',
				ref: 'Test',
				testsPath: '/cache/tests-WordPress',
				url: 'https://github.com/WordPress/WordPress.git',
				type: 'git',
			},
			phpVersion: '2.0',
			env: {
				development: {
					...DEFAULT_CONFIG.env.development,
					port: 1234,
				},
				tests: {
					...DEFAULT_CONFIG.env.tests,
					port: 1011,
				},
			},
		};
		expect( parsed ).toEqual( expected );
	} );

	it( 'should parse core, plugin, theme, and mapping sources', async () => {
		readRawConfigFile.mockImplementation( async ( configFile ) => {
			if ( configFile === path.resolve( '.', './.wp-env.json' ) ) {
				return {
					core: 'WordPress/WordPress#Test',
					plugins: [ 'WordPress/TestPlugin#Test' ],
					themes: [ 'WordPress/TestTheme#Test' ],
					mappings: {
						'/var/www/html/wp-content/plugins/test-mapping':
							'WordPress/TestMapping#Test',
					},
				};
			}

			if (
				configFile === path.resolve( '.', './.wp-env.override.json' )
			) {
				return {};
			}

			throw new Error( 'Invalid File: ' + configFile );
		} );

		const parsed = await parseConfig( './', '/cache' );

		expect( parsed ).toEqual( {
			...DEFAULT_CONFIG,
			coreSource: {
				basename: 'WordPress',
				path: '/cache/WordPress',
				clonePath: '/cache/WordPress',
				ref: 'Test',
				testsPath: '/cache/tests-WordPress',
				url: 'https://github.com/WordPress/WordPress.git',
				type: 'git',
			},
			pluginSources: [
				{
					basename: 'TestPlugin',
					path: '/cache/TestPlugin',
					clonePath: '/cache/TestPlugin',
					ref: 'Test',
					url: 'https://github.com/WordPress/TestPlugin.git',
					type: 'git',
				},
			],
			themeSources: [
				{
					basename: 'TestTheme',
					path: '/cache/TestTheme',
					clonePath: '/cache/TestTheme',
					ref: 'Test',
					url: 'https://github.com/WordPress/TestTheme.git',
					type: 'git',
				},
			],
			mappings: {
				'/var/www/html/wp-content/plugins/test-mapping': {
					basename: 'TestMapping',
					path: '/cache/TestMapping',
					clonePath: '/cache/TestMapping',
					ref: 'Test',
					url: 'https://github.com/WordPress/TestMapping.git',
					type: 'git',
				},
			},
		} );
	} );

	it( 'should override with environment variables', async () => {
		process.env.WP_ENV_PORT = 123;
		process.env.WP_ENV_TESTS_PORT = 456;
		process.env.WP_ENV_CORE = 'WordPress/WordPress#test';
		process.env.WP_ENV_PHP_VERSION = '3.0';

		const parsed = await parseConfig( './', '/cache' );

		expect( parsed ).toEqual( {
			...DEFAULT_CONFIG,
			port: 123,
			testsPort: 456,
			coreSource: {
				basename: 'WordPress',
				path: '/cache/WordPress',
				clonePath: '/cache/WordPress',
				ref: 'test',
				testsPath: '/cache/tests-WordPress',
				url: 'https://github.com/WordPress/WordPress.git',
				type: 'git',
			},
			phpVersion: '3.0',
			env: {
				development: {
					port: 123,
					phpVersion: '3.0',
					coreSource: {
						basename: 'WordPress',
						path: '/cache/WordPress',
						clonePath: '/cache/WordPress',
						ref: 'test',
						testsPath: '/cache/tests-WordPress',
						url: 'https://github.com/WordPress/WordPress.git',
						type: 'git',
					},
				},
				tests: {
					port: 456,
					phpVersion: '3.0',
					coreSource: {
						basename: 'WordPress',
						path: '/cache/WordPress',
						clonePath: '/cache/WordPress',
						ref: 'test',
						testsPath: '/cache/tests-WordPress',
						url: 'https://github.com/WordPress/WordPress.git',
						type: 'git',
					},
					config: {
						WP_DEBUG: false,
						SCRIPT_DEBUG: false,
					},
				},
			},
		} );
	} );

	it( 'throws when latest WordPress version needed but not found', async () => {
		getLatestWordPressVersion.mockResolvedValue( null );

		expect.assertions( 1 );
		try {
			await parseConfig( './', '/cache' );
		} catch ( e ) {
			expect( e ).toEqual(
				new ValidationError(
					'Could not find the latest WordPress version. There may be a network issue.'
				)
			);
		}
	} );
} );
/* eslint-enable jest/no-conditional-expect */
