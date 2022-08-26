/**
 * Internal dependencies
 */
import {
	getAllUnit,
	getAllValue,
	hasMixedValues,
	hasDefinedValues,
	mode,
} from '../utils';

const defaultUnitSelections = {
	flat: undefined,
	topLeft: '%',
	topRight: 'rem',
	bottomLeft: 'rem',
	bottomRight: 'vw',
};

describe( 'getAllUnit', () => {
	it( 'should return flat radius unit when selected', () => {
		const selectedUnits = { ...defaultUnitSelections, flat: 'em' };
		expect( getAllUnit( selectedUnits ) ).toBe( 'em' );
	} );

	it( 'should return most common corner unit', () => {
		expect( getAllUnit( defaultUnitSelections ) ).toBe( 'rem' );
	} );

	it( 'should return a real unit when the most common is undefined', () => {
		expect( getAllUnit( { bottomRight: '%' } ) ).toBe( '%' );
	} );

	it( 'should return most common corner unit when some are unselected', () => {
		const selectedUnits = { ...defaultUnitSelections, topLeft: undefined };
		expect( getAllUnit( selectedUnits ) ).toBe( 'rem' );
	} );

	it( 'should fallback to px when all values are undefined', () => {
		expect( getAllUnit( {} ) ).toBe( 'px' );
	} );
} );

describe( 'getAllValue', () => {
	describe( 'when provided string based values', () => {
		it( 'should return valid value + unit when passed a valid unit', () => {
			expect( getAllValue( '32em' ) ).toBe( '32em' );
		} );

		it( 'should return string as-is without parsing it', () => {
			expect( getAllValue( '32apples' ) ).toBe( '32apples' );
		} );
	} );

	describe( 'when provided object based values', () => {
		it( 'should return undefined if values are mixed', () => {
			const values = {
				bottomLeft: '2em',
				bottomRight: '2em',
				topLeft: '0',
				topRight: '2px',
			};
			expect( getAllValue( values ) ).toBe( undefined );
		} );

		it( 'should return the common value + unit when all values are the same', () => {
			const values = {
				bottomLeft: '1em',
				bottomRight: '1em',
				topLeft: '1em',
				topRight: '1em',
			};
			expect( getAllValue( values ) ).toBe( '1em' );
		} );

		it( 'should return the common value + most common unit when same values but different units', () => {
			const values = {
				bottomLeft: '1em',
				bottomRight: '1em',
				topLeft: '1px',
				topRight: '1rem',
			};
			expect( getAllValue( values ) ).toBe( '1em' );
		} );

		it( 'should fall back to undefined when values are undefined', () => {
			const values = {
				bottomLeft: undefined,
				bottomRight: undefined,
				topLeft: undefined,
				topRight: undefined,
			};
			expect( getAllValue( values ) ).toBe( undefined );
		} );
	} );

	describe( 'when provided invalid values', () => {
		it( 'should return undefined when passed an array', () => {
			expect( getAllValue( [] ) ).toBe( undefined );
		} );
		it( 'should return undefined when passed a boolean', () => {
			expect( getAllValue( false ) ).toBe( undefined );
		} );
		it( 'should return undefined when passed undefined', () => {
			expect( getAllValue( undefined ) ).toBe( undefined );
		} );
	} );
} );

describe( 'hasMixedValues', () => {
	it( 'should return false when passed a string value', () => {
		expect( hasMixedValues( '2px' ) ).toBe( false );
	} );

	it( 'should return false when passed a string value containing a unit with no quantity', () => {
		expect( hasMixedValues( 'em' ) ).toBe( false );
	} );

	it( 'should return true when passed mixed values', () => {
		const values = {
			bottomLeft: '1em',
			bottomRight: '1px',
			topLeft: '2px',
			topRight: '2em',
		};
		expect( hasMixedValues( values ) ).toBe( true );
	} );

	it( 'should return false when passed a common value', () => {
		const values = {
			bottomLeft: '1em',
			bottomRight: '1em',
			topLeft: '1em',
			topRight: '1em',
		};
		expect( hasMixedValues( values ) ).toBe( false );
	} );
} );

describe( 'hasDefinedValues', () => {
	it( 'should return false when passed a falsy value', () => {
		expect( hasDefinedValues( undefined ) ).toBe( false );
		expect( hasDefinedValues( null ) ).toBe( false );
		expect( hasDefinedValues( '' ) ).toBe( false );
	} );

	it( 'should return true when passed a non empty string value', () => {
		expect( hasDefinedValues( '1px' ) ).toBe( true );
	} );

	it( 'should return false when passed an object with empty values', () => {
		const values = {
			bottomLeft: undefined,
			bottomRight: undefined,
			topLeft: undefined,
			topRight: undefined,
		};
		expect( hasDefinedValues( values ) ).toBe( false );
	} );

	it( 'should return true when passed an object with at least one real value', () => {
		const values = {
			bottomLeft: undefined,
			bottomRight: '1px',
			topLeft: undefined,
			topRight: undefined,
		};
		expect( hasDefinedValues( values ) ).toBe( true );
	} );
} );

describe( 'mode', () => {
	it( 'should return the most common value', () => {
		const values = [ 'a', 'z', 'z', 'b', undefined ];
		expect( mode( values ) ).toBe( 'z' );
	} );

	it( 'should return the most common real value', () => {
		const values = [ undefined, 'a', undefined, undefined, undefined ];
		expect( mode( values ) ).toBe( 'a' );
	} );
} );
