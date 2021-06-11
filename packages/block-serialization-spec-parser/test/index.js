/**
 * External dependencies
 */
import path from 'path';

/**
 * Internal dependencies
 */
import { parse } from '../';
import { jsTester, phpTester } from '../shared-tests';

describe( 'block-serialization-spec-parser-js', jsTester( parse ) ); // eslint-disable-line jest/valid-describe

phpTester(
	'block-serialization-spec-parser-php',
	path.join( __dirname, 'test-parser.php' )
);
