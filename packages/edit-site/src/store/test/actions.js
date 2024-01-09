/**
 * WordPress dependencies
 */
import { store as blockEditorStore } from '@wordpress/block-editor';
import { store as coreStore } from '@wordpress/core-data';
import { createRegistry } from '@wordpress/data';
import { store as interfaceStore } from '@wordpress/interface';
import { store as noticesStore } from '@wordpress/notices';
import { store as preferencesStore } from '@wordpress/preferences';
import { store as editorStore } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import { store as editSiteStore } from '..';

function createRegistryWithStores() {
	// create a registry
	const registry = createRegistry();

	// register stores
	registry.register( editorStore );
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

			// Should start as undefined.
			expect(
				registry
					.select( preferencesStore )
					.get( 'core/edit-site', 'name' )
			).toBe( undefined );

			// Toggle on.
			registry.dispatch( editSiteStore ).toggleFeature( 'name' );
			expect(
				registry
					.select( preferencesStore )
					.get( 'core/edit-site', 'name' )
			).toBe( true );

			// Toggle off again.
			registry.dispatch( editSiteStore ).toggleFeature( 'name' );
			expect(
				registry
					.select( preferencesStore )
					.get( 'core/edit-site', 'name' )
			).toBe( false );

			// Expect a deprecation warning.
			expect( console ).toHaveWarned();
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

	describe( 'openGeneralSidebar', () => {
		it( 'should turn off distraction free mode when opening a general sidebar', () => {
			const registry = createRegistryWithStores();
			registry
				.dispatch( preferencesStore )
				.set( 'core', 'distractionFree', true );
			registry
				.dispatch( editSiteStore )
				.openGeneralSidebar( 'edit-site/global-styles' );
			expect(
				registry
					.select( preferencesStore )
					.get( 'core', 'distractionFree' )
			).toBe( false );
		} );
	} );

	describe( 'switchEditorMode', () => {
		it( 'should turn off distraction free mode when switching to code editor', () => {
			const registry = createRegistryWithStores();
			registry
				.dispatch( preferencesStore )
				.set( 'core', 'distractionFree', true );
			registry.dispatch( editSiteStore ).switchEditorMode( 'visual' );
			expect(
				registry
					.select( preferencesStore )
					.get( 'core', 'distractionFree' )
			).toBe( true );
			registry.dispatch( editSiteStore ).switchEditorMode( 'text' );
			expect(
				registry
					.select( preferencesStore )
					.get( 'core', 'distractionFree' )
			).toBe( false );
		} );
	} );

	describe( 'toggleDistractionFree', () => {
		it( 'should properly update settings to prevent layout corruption when enabling distraction free mode', () => {
			const registry = createRegistryWithStores();
			// Enable everything that shouldn't be enabled in distraction free mode.
			registry
				.dispatch( preferencesStore )
				.set( 'core', 'fixedToolbar', true );
			registry.dispatch( editorStore ).setIsListViewOpened( true );
			registry
				.dispatch( editSiteStore )
				.openGeneralSidebar( 'edit-site/global-styles' );
			// Initial state is falsy.
			registry.dispatch( editSiteStore ).toggleDistractionFree();
			expect(
				registry
					.select( preferencesStore )
					.get( 'core', 'fixedToolbar' )
			).toBe( true );
			expect( registry.select( editorStore ).isListViewOpened() ).toBe(
				false
			);
			expect( registry.select( editorStore ).isInserterOpened() ).toBe(
				false
			);
			expect(
				registry
					.select( interfaceStore )
					.getActiveComplementaryArea( editSiteStore.name )
			).toBeNull();
			expect(
				registry
					.select( preferencesStore )
					.get( 'core', 'distractionFree' )
			).toBe( true );
		} );
	} );
} );
