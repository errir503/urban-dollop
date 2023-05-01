/**
 * Internal dependencies
 */
const {
	ValidationError,
	checkPort,
	checkStringArray,
	checkObjectWithValues,
	checkVersion,
	checkValidURL,
} = require( '../validate-config' );

describe( 'validate-config', () => {
	describe( 'checkPort', () => {
		it( 'does nothing for undefined values', () => {
			expect( () =>
				checkPort( 'test.json', 'test', undefined )
			).not.toThrow();
		} );

		it( 'throws when not a number', () => {
			expect( () => checkPort( 'test.json', 'test', 'test' ) ).toThrow(
				new ValidationError(
					'Invalid test.json: "test" must be an integer.'
				)
			);

			expect( () =>
				checkPort( 'test.json', 'test', { test: 'test' } )
			).toThrow(
				new ValidationError(
					'Invalid test.json: "test" must be an integer.'
				)
			);
		} );

		it( 'throws when port out of range', () => {
			expect( () => checkPort( 'test.json', 'test', -1 ) ).toThrow(
				new ValidationError(
					'Invalid test.json: "test" must be a valid port.'
				)
			);

			expect( () => checkPort( 'test.json', 'test', 99999999 ) ).toThrow(
				new ValidationError(
					'Invalid test.json: "test" must be a valid port.'
				)
			);
		} );

		it( 'passes for valid port', () => {
			expect( () =>
				checkPort( 'test.json', 'test', 8888 )
			).not.toThrow();
		} );
	} );

	describe( 'checkStringArray', () => {
		it( 'does nothing for undefined values', () => {
			expect( () =>
				checkStringArray( 'test.json', 'test', undefined )
			).not.toThrow();
		} );

		it( 'throws when not an array', () => {
			expect( () =>
				checkStringArray( 'test.json', 'test', 'test' )
			).toThrow(
				new ValidationError(
					'Invalid test.json: "test" must be an array.'
				)
			);

			expect( () =>
				checkStringArray( 'test.json', 'test', { test: 'test' } )
			).toThrow(
				new ValidationError(
					'Invalid test.json: "test" must be an array.'
				)
			);
		} );

		it( 'throws when array contains non-strings', () => {
			expect( () =>
				checkStringArray( 'test.json', 'test', [ 12 ] )
			).toThrow(
				new ValidationError(
					'Invalid test.json: "test" must be an array of strings.'
				)
			);

			expect( () =>
				checkStringArray( 'test.json', 'test', [ 'test', 12 ] )
			).toThrow(
				new ValidationError(
					'Invalid test.json: "test" must be an array of strings.'
				)
			);
		} );

		it( 'passes for string arrays', () => {
			expect( () =>
				checkStringArray( 'test.json', 'test', [] )
			).not.toThrow();
			expect( () =>
				checkStringArray( 'test.json', 'test', [ 'test' ] )
			).not.toThrow();
		} );
	} );

	describe( 'checkObjectWithValues', () => {
		it( 'does nothing for undefined values', () => {
			expect( () =>
				checkObjectWithValues( 'test.json', 'test', undefined, [
					'string',
				] )
			).not.toThrow();
		} );

		it( 'throws when not an object', () => {
			expect( () =>
				checkObjectWithValues( 'test.json', 'test', 'test', [] )
			).toThrow(
				new ValidationError(
					'Invalid test.json: "test" must be an object.'
				)
			);

			expect( () =>
				checkObjectWithValues( 'test.json', 'test', [ 'test' ], [] )
			).toThrow(
				new ValidationError(
					'Invalid test.json: "test" must be an object.'
				)
			);
		} );

		it( 'throws when no allowed types are given', () => {
			expect( () =>
				checkObjectWithValues(
					'test.json',
					'test',
					{ test: 'test' },
					[]
				)
			).toThrow(
				new ValidationError(
					'Invalid test.json: "test.test" must be a .'
				)
			);
		} );

		it( 'throws when type is not allowed', () => {
			expect( () =>
				checkObjectWithValues( 'test.json', 'test', { test: 'test' }, [
					'number',
				] )
			).toThrow(
				new ValidationError(
					'Invalid test.json: "test.test" must be a number.'
				)
			);

			expect( () =>
				checkObjectWithValues( 'test.json', 'test', { test: 1 }, [
					'string',
				] )
			).toThrow(
				new ValidationError(
					'Invalid test.json: "test.test" must be a string.'
				)
			);

			expect( () =>
				checkObjectWithValues(
					'test.json',
					'test',
					{ test: [ 'test' ] },
					[ 'object', 'string' ]
				)
			).toThrow(
				new ValidationError(
					'Invalid test.json: "test.test" must be a object or string.'
				)
			);
		} );

		it( 'passes when type is allowed', () => {
			expect( () =>
				checkObjectWithValues( 'test.json', 'test', { test: 'test' }, [
					'string',
				] )
			).not.toThrow();
			expect( () =>
				checkObjectWithValues( 'test.json', 'test', { test: 1 }, [
					'number',
				] )
			).not.toThrow();
			expect( () =>
				checkObjectWithValues(
					'test.json',
					'test',
					{ test: { nested: 'test' } },
					[ 'object' ]
				)
			).not.toThrow();
			expect( () =>
				checkObjectWithValues(
					'test.json',
					'test',
					{ test: [ 'test' ] },
					[ 'array' ]
				)
			).not.toThrow();
		} );
	} );

	describe( 'checkVersion', () => {
		it( 'does nothing for undefined values', () => {
			expect( () =>
				checkVersion( 'test.json', 'test', undefined )
			).not.toThrow();
		} );

		it( 'throws for invalid input', () => {
			expect( () => checkVersion( 'test.json', 'test', 'test' ) ).toThrow(
				new ValidationError(
					'Invalid test.json: "test" must be a string of the format "X", "X.X", or "X.X.X".'
				)
			);

			expect( () => checkVersion( 'test.json', 'test', 123 ) ).toThrow(
				new ValidationError(
					'Invalid test.json: "test" must be a string.'
				)
			);
		} );

		it( 'passes for different version formats', () => {
			expect( () =>
				checkVersion( 'test.json', 'test', '1' )
			).not.toThrow();
			expect( () =>
				checkVersion( 'test.json', 'test', '1.1' )
			).not.toThrow();
			expect( () =>
				checkVersion( 'test.json', 'test', '1.1.1' )
			).not.toThrow();
			expect( () =>
				checkVersion( 'test.json', 'test', '15.7.2' )
			).not.toThrow();
			expect( () =>
				checkVersion( 'test.json', 'test', '26634543' )
			).not.toThrow();
		} );
	} );

	describe( 'checkValidURL', () => {
		it( 'does nothing for undefined values', () => {
			expect( () =>
				checkValidURL( 'test.json', 'test', undefined )
			).not.toThrow();
		} );

		it( 'throws for invaid URLs', () => {
			expect( () =>
				checkValidURL( 'test.json', 'test', 'localhost' )
			).toThrow(
				new ValidationError(
					'Invalid test.json: "test" must be a valid URL.'
				)
			);

			expect( () => checkValidURL( 'test.json', 'test', '' ) ).toThrow(
				new ValidationError(
					'Invalid test.json: "test" must be a valid URL.'
				)
			);

			expect( () => checkValidURL( 'test.json', 'test', 123 ) ).toThrow(
				new ValidationError(
					'Invalid test.json: "test" must be a valid URL.'
				)
			);
		} );

		it( 'passes for valid URLs', () => {
			expect( () =>
				checkValidURL( 'test.json', 'test', 'http://test.com' )
			).not.toThrow();
			expect( () =>
				checkValidURL( 'test.json', 'test', 'https://test.com' )
			).not.toThrow();
			expect( () =>
				checkValidURL( 'test.json', 'test', 'http://test' )
			).not.toThrow();
			expect( () =>
				checkValidURL(
					'test.json',
					'test',
					'http://test/test?test=test'
				)
			).not.toThrow();
			expect( () =>
				checkValidURL( 'test.json', 'test', 'http://test.co.uk' )
			).not.toThrow();
			expect( () =>
				checkValidURL( 'test.json', 'test', 'https://test.co.uk:8888' )
			).not.toThrow();
			expect( () =>
				checkValidURL(
					'test.json',
					'test',
					'http://test.co.uk:8888/test?test=test#test'
				)
			).not.toThrow();
		} );
	} );
} );
