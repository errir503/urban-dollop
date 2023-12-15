/**
 * Internal dependencies
 */
import {
	isSavingMetaBoxes,
	metaBoxLocations,
	blockInserterPanel,
	listViewPanel,
} from '../reducer';

import { setIsInserterOpened } from '../actions';

describe( 'state', () => {
	describe( 'isSavingMetaBoxes', () => {
		it( 'should return default state', () => {
			const actual = isSavingMetaBoxes( undefined, {} );
			expect( actual ).toBe( false );
		} );

		it( 'should set saving flag to true', () => {
			const action = {
				type: 'REQUEST_META_BOX_UPDATES',
			};
			const actual = isSavingMetaBoxes( false, action );

			expect( actual ).toBe( true );
		} );

		it( 'should set saving flag to false', () => {
			const action = {
				type: 'META_BOX_UPDATES_SUCCESS',
			};
			const actual = isSavingMetaBoxes( true, action );

			expect( actual ).toBe( false );
		} );
	} );

	describe( 'metaBoxLocations()', () => {
		it( 'should return default state', () => {
			const state = metaBoxLocations( undefined, {} );

			expect( state ).toEqual( {} );
		} );

		it( 'should set the active meta box locations', () => {
			const action = {
				type: 'SET_META_BOXES_PER_LOCATIONS',
				metaBoxesPerLocation: {
					normal: [ { id: 'postcustom' } ],
				},
			};

			const state = metaBoxLocations( undefined, action );

			expect( state ).toEqual( {
				normal: [ { id: 'postcustom' } ],
			} );
		} );

		it( 'should merge new meta box locations into the existing ones', () => {
			const oldState = {
				normal: [
					{ id: 'a', title: 'A' },
					{ id: 'b', title: 'B' },
				],
				side: [ { id: 's', title: 'S' } ],
			};
			const action = {
				type: 'SET_META_BOXES_PER_LOCATIONS',
				metaBoxesPerLocation: {
					normal: [
						{ id: 'b', title: 'B-updated' },
						{ id: 'c', title: 'C' },
					],
					advanced: [ { id: 'd', title: 'D' } ],
				},
			};
			const newState = metaBoxLocations( oldState, action );
			expect( newState ).toEqual( {
				normal: [
					{ id: 'a', title: 'A' },
					{ id: 'b', title: 'B-updated' },
					{ id: 'c', title: 'C' },
				],
				advanced: [ { id: 'd', title: 'D' } ],
				side: [ { id: 's', title: 'S' } ],
			} );
		} );
	} );

	describe( 'blockInserterPanel()', () => {
		it( 'should apply default state', () => {
			expect( blockInserterPanel( undefined, {} ) ).toEqual( false );
		} );

		it( 'should default to returning the same state', () => {
			expect( blockInserterPanel( true, {} ) ).toBe( true );
		} );

		it( 'should set the open state of the inserter panel', () => {
			expect(
				blockInserterPanel( false, setIsInserterOpened( true ) )
			).toBe( true );
			expect(
				blockInserterPanel( true, setIsInserterOpened( false ) )
			).toBe( false );
		} );

		it( 'should close the inserter when opening the list view panel', () => {
			expect(
				blockInserterPanel( true, {
					type: 'SET_IS_LIST_VIEW_OPENED',
					isOpen: true,
				} )
			).toBe( false );
		} );

		it( 'should not change the state when closing the list view panel', () => {
			expect(
				blockInserterPanel( true, {
					type: 'SET_IS_LIST_VIEW_OPENED',
					isOpen: false,
				} )
			).toBe( true );
		} );
	} );

	describe( 'listViewPanel()', () => {
		it( 'should apply default state', () => {
			expect( listViewPanel( undefined, {} ) ).toEqual( false );
		} );

		it( 'should default to returning the same state', () => {
			expect( listViewPanel( true, {} ) ).toBe( true );
		} );

		it( 'should set the open state of the list view panel', () => {
			expect(
				listViewPanel( false, {
					type: 'SET_IS_LIST_VIEW_OPENED',
					isOpen: true,
				} )
			).toBe( true );
			expect(
				listViewPanel( true, {
					type: 'SET_IS_LIST_VIEW_OPENED',
					isOpen: false,
				} )
			).toBe( false );
		} );

		it( 'should close the list view when opening the inserter panel', () => {
			expect( listViewPanel( true, setIsInserterOpened( true ) ) ).toBe(
				false
			);
		} );

		it( 'should not change the state when closing the inserter panel', () => {
			expect( listViewPanel( true, setIsInserterOpened( false ) ) ).toBe(
				true
			);
		} );
	} );
} );
