/**
 * Internal dependencies
 */
import { getQueryParts } from '../get-query-parts';

describe( 'getQueryParts', () => {
	it( 'parses out pagination data', () => {
		const parts = getQueryParts( { page: 2, per_page: 2 } );

		expect( parts ).toEqual( {
			page: 2,
			perPage: 2,
			stableKey: '',
			fields: null,
			include: null,
		} );
	} );

	it( 'parses out `include` ID filtering', () => {
		const parts = getQueryParts( { include: [ 1 ] } );

		expect( parts ).toEqual( {
			page: 1,
			perPage: 10,
			stableKey: '',
			fields: null,
			include: [ 1 ],
		} );
	} );

	it( 'encodes stable string key', () => {
		const first = getQueryParts( { '?': '&', b: 2 } );
		const second = getQueryParts( { b: 2, '?': '&' } );

		expect( first ).toEqual( second );
		expect( first ).toEqual( {
			page: 1,
			perPage: 10,
			stableKey: '%3F=%26&b=2',
			fields: null,
			include: null,
		} );
	} );

	it( 'encodes deep values', () => {
		const parts = getQueryParts( { a: [ 1, 2 ] } );

		expect( parts ).toEqual( {
			page: 1,
			perPage: 10,
			stableKey: 'a%5B0%5D=1&a%5B1%5D=2',
			fields: null,
			include: null,
		} );
	} );

	it( 'encodes stable string key with page data normalized to number', () => {
		const first = getQueryParts( { b: 2, page: 1, per_page: 10 } );
		const second = getQueryParts( { b: 2, page: '1', per_page: '10' } );

		expect( first ).toEqual( second );
		expect( first ).toEqual( {
			page: 1,
			perPage: 10,
			stableKey: 'b=2',
			fields: null,
			include: null,
		} );
	} );

	it( 'returns -1 for unlimited queries', () => {
		const parts = getQueryParts( { b: 2, page: 1, per_page: -1 } );

		expect( parts ).toEqual( {
			page: 1,
			perPage: -1,
			stableKey: 'b=2',
			fields: null,
			include: null,
		} );
	} );

	it( 'encodes stable string key with fields parameters', () => {
		const parts = getQueryParts( { _fields: [ 'id', 'title' ] } );

		expect( parts ).toEqual( {
			page: 1,
			perPage: 10,
			stableKey: '_fields=id%2Ctitle',
			fields: [ 'id', 'title' ],
			include: null,
		} );
	} );
} );
