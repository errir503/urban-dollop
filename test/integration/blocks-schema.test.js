/**
 * External dependencies
 */
import Ajv from 'ajv-draft-04';
import glob from 'fast-glob';
import path from 'path';

/**
 * Internal dependencies
 */
import blockSchema from '../../schemas/json/block.json';

describe( 'block.json schema', () => {
	const blockFolders = glob.sync( 'packages/block-library/src/*', {
		onlyDirectories: true,
		ignore: [ 'packages/block-library/src/utils' ],
	} );
	const testData = blockFolders.map( ( blockFolder ) => [
		'core/' + path.basename( blockFolder ),
		path.join( blockFolder, 'block.json' ),
	] );
	const ajv = new Ajv();

	test( 'strictly adheres to the draft-04 meta schema', () => {
		// Use ajv.compile instead of ajv.validateSchema to validate the schema
		// because validateSchema only checks syntax, whereas, compile checks
		// if the schema is semantically correct with strict mode.
		// See https://github.com/ajv-validator/ajv/issues/1434#issuecomment-822982571
		const result = ajv.compile( blockSchema );

		expect( result.errors ).toBe( null );
	} );

	test( 'found block folders', () => {
		expect( blockFolders.length ).toBeGreaterThan( 0 );
	} );

	test.each( testData )(
		'validates schema for `%s`',
		( blockName, filepath ) => {
			// We want to validate the block.json file using the local schema.
			const { $schema, ...blockMetadata } = require( filepath );

			expect( $schema ).toBe( 'https://schemas.wp.org/trunk/block.json' );

			const result =
				ajv.validate( blockSchema, blockMetadata ) || ajv.errors;

			expect( result ).toBe( true );
		}
	);
} );
