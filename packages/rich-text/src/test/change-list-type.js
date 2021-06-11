/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */

import { changeListType } from '../change-list-type';
import { getSparseArrayLength } from './helpers';
import { LINE_SEPARATOR } from '../special-characters';

describe( 'changeListType', () => {
	const ul = { type: 'ul' };
	const ol = { type: 'ol' };

	it( 'should only change list type if list item is indented', () => {
		const record = {
			replacements: [ , ],
			text: '1',
			start: 1,
			end: 1,
		};
		const result = changeListType( deepFreeze( record ), ul );

		expect( result ).toEqual( record );
		expect( result ).toBe( record );
		expect( getSparseArrayLength( result.replacements ) ).toBe( 0 );
	} );

	it( 'should change list type', () => {
		const record = {
			replacements: [ , [ ul ] ],
			text: `1${ LINE_SEPARATOR }`,
			start: 2,
			end: 2,
		};
		const expected = {
			...record,
			replacements: [ , [ ol ] ],
		};
		const result = changeListType( deepFreeze( record ), ol );

		expect( result ).toEqual( expected );
		expect( result ).not.toBe( record );
		expect( getSparseArrayLength( result.replacements ) ).toBe( 1 );
	} );

	it( 'should outdent with multiple lines selected', () => {
		// As we're testing list formats, the text should remain the same.
		const text = `a${ LINE_SEPARATOR }1${ LINE_SEPARATOR }2${ LINE_SEPARATOR }i${ LINE_SEPARATOR }3${ LINE_SEPARATOR }4${ LINE_SEPARATOR }b`;

		const record = {
			replacements: [
				,
				[ ul ],
				,
				[ ul ],
				,
				[ ul, ul ],
				,
				[ ul ],
				,
				[ ul ],
				,
				,
				,
				[ ul ],
				,
			],
			text,
			start: 4,
			end: 9,
		};
		const expected = {
			...record,
			replacements: [
				,
				[ ol ],
				,
				[ ol ],
				,
				[ ol, ul ],
				,
				[ ol ],
				,
				[ ol ],
				,
				,
				,
				[ ul ],
				,
			],
		};
		const result = changeListType( deepFreeze( record ), ol );

		expect( result ).toEqual( expected );
		expect( result ).not.toBe( record );
		expect( getSparseArrayLength( result.replacements ) ).toBe( 6 );
	} );
} );
