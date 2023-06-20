/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';
import { createRegistry } from '@wordpress/data';
import { store as interfaceStore } from '@wordpress/interface';
import { store as noticesStore } from '@wordpress/notices';
import { store as preferencesStore } from '@wordpress/preferences';

/**
 * Internal dependencies
 */
import { store as editSiteStore } from '..';
import { setHasPageContentFocus } from '../actions';

const ENTITY_TYPES = {
	wp_template: {
		description: 'Templates to include in your theme.',
		hierarchical: false,
		name: 'Templates',
		rest_base: 'templates',
		rest_namespace: 'wp/v2',
		slug: 'wp_template',
		taxonomies: [],
	},
};

function createRegistryWithStores() {
	// create a registry
	const registry = createRegistry();

	// register stores
	registry.register( blockEditorStore );
	registry.register( coreStore );
	registry.register( editSiteStore );
	registry.register( interfaceStore );
	registry.register( noticesStore );
	registry.register( preferencesStore );

	return registry;
}

describe( 'actions', () => {
	describe( 'toggleFeature', () => {
		it( 'should toggle a feature flag', () => {
			const registry = createRegistryWithStores();

			// Should default to false.
			expect(
				registry.select( editSiteStore ).isFeatureActive( 'name' )
			).toBe( false );

			// Toggle on.
			registry.dispatch( editSiteStore ).toggleFeature( 'name' );
			expect(
				registry.select( editSiteStore ).isFeatureActive( 'name' )
			).toBe( true );

			// Toggle off again.
			registry.dispatch( editSiteStore ).toggleFeature( 'name' );
			expect(
				registry.select( editSiteStore ).isFeatureActive( 'name' )
			).toBe( false );

			// Expect a deprecation warning.
			expect( console ).toHaveWarned();
		} );
	} );

	describe( 'setTemplate', () => {
		const ID = 1;
		const SLUG = 'archive';

		it( 'should set the template when slug is provided', async () => {
			const registry = createRegistryWithStores();

			await registry.dispatch( editSiteStore ).setTemplate( ID, SLUG );

			const select = registry.select( editSiteStore );
			expect( select.getEditedPostId() ).toBe( ID );
			expect( select.getEditedPostContext().templateSlug ).toBe( SLUG );
		} );

		it( 'should set the template by fetching the template slug', async () => {
			const registry = createRegistryWithStores();

			apiFetch.setFetchHandler( async ( options ) => {
				const { method = 'GET', path } = options;
				if ( method === 'GET' ) {
					if ( path.startsWith( '/wp/v2/types' ) ) {
						return ENTITY_TYPES;
					}

					if ( path.startsWith( `/wp/v2/templates/${ ID }` ) ) {
						return { id: ID, slug: SLUG };
					}
				}

				throw {
					code: 'unknown_path',
					message: `Unknown path: ${ method } ${ path }`,
				};
			} );

			await registry.dispatch( editSiteStore ).setTemplate( ID );

			const select = registry.select( editSiteStore );
			expect( select.getEditedPostId() ).toBe( ID );
			expect( select.getEditedPostContext().templateSlug ).toBe( SLUG );
		} );
	} );

	describe( 'addTemplate', () => {
		it( 'should issue a REST request to create the template and then set it', async () => {
			const registry = createRegistryWithStores();

			const ID = 1;
			const SLUG = 'index';

			apiFetch.setFetchHandler( async ( options ) => {
				const { method = 'GET', path, data } = options;

				if ( method === 'GET' && path.startsWith( '/wp/v2/types' ) ) {
					return ENTITY_TYPES;
				}

				if (
					method === 'POST' &&
					path.startsWith( '/wp/v2/templates' )
				) {
					return { id: ID, slug: data.slug };
				}

				throw {
					code: 'unknown_path',
					message: `Unknown path: ${ method } ${ path }`,
				};
			} );

			await registry
				.dispatch( editSiteStore )
				.addTemplate( { slug: SLUG } );

			const select = registry.select( editSiteStore );
			expect( select.getEditedPostId() ).toBe( ID );
			expect( select.getEditedPostContext().templateSlug ).toBe( SLUG );
		} );
	} );

	describe( 'setTemplatePart', () => {
		it( 'should set template part', () => {
			const registry = createRegistryWithStores();

			const ID = 1;
			registry.dispatch( editSiteStore ).setTemplatePart( ID );

			const select = registry.select( editSiteStore );
			expect( select.getEditedPostId() ).toBe( ID );
			expect( select.getEditedPostType() ).toBe( 'wp_template_part' );
		} );
	} );

	describe( 'setPage', () => {
		it( 'should find the template and then set the page', async () => {
			const registry = createRegistryWithStores();

			const ID = 'emptytheme//single';
			const SLUG = 'single';

			apiFetch.setFetchHandler( async ( options ) => {
				const { method = 'GET', path, url } = options;

				// Called with url arg in `__experimentalGetTemplateForLink`
				if ( url ) {
					return { data: { id: ID, slug: SLUG } };
				}

				if ( method === 'GET' ) {
					if ( path.startsWith( '/wp/v2/types' ) ) {
						return ENTITY_TYPES;
					}

					if ( path.startsWith( `/wp/v2/templates/${ ID }` ) ) {
						return { id: ID, slug: SLUG };
					}
				}

				throw {
					code: 'unknown_path',
					message: `Unknown path: ${ method } ${ path }`,
				};
			} );

			await registry.dispatch( editSiteStore ).setPage( { path: '/' } );

			const select = registry.select( editSiteStore );
			expect( select.getEditedPostId() ).toBe( 'emptytheme//single' );
			expect( select.getEditedPostType() ).toBe( 'wp_template' );
		} );
	} );

	describe( 'setIsListViewOpened', () => {
		it( 'should set the list view opened state', () => {
			const registry = createRegistryWithStores();

			registry.dispatch( editSiteStore ).setIsListViewOpened( true );
			expect( registry.select( editSiteStore ).isListViewOpened() ).toBe(
				true
			);

			registry.dispatch( editSiteStore ).setIsListViewOpened( false );
			expect( registry.select( editSiteStore ).isListViewOpened() ).toBe(
				false
			);
		} );
	} );

	describe( 'setHasPageContentFocus', () => {
		it( 'toggles the page content lock on', () => {
			const dispatch = jest.fn();
			const clearSelectedBlock = jest.fn();
			const registry = {
				dispatch: () => ( { clearSelectedBlock } ),
			};
			setHasPageContentFocus( true )( { dispatch, registry } );
			expect( clearSelectedBlock ).toHaveBeenCalled();
			expect( dispatch ).toHaveBeenCalledWith( {
				type: 'SET_HAS_PAGE_CONTENT_FOCUS',
				hasPageContentFocus: true,
			} );
		} );

		it( 'toggles the page content lock off', () => {
			const dispatch = jest.fn();
			const clearSelectedBlock = jest.fn();
			const registry = {
				dispatch: () => ( { clearSelectedBlock } ),
			};
			setHasPageContentFocus( false )( { dispatch, registry } );
			expect( clearSelectedBlock ).not.toHaveBeenCalled();
			expect( dispatch ).toHaveBeenCalledWith( {
				type: 'SET_HAS_PAGE_CONTENT_FOCUS',
				hasPageContentFocus: false,
			} );
		} );
	} );
} );
