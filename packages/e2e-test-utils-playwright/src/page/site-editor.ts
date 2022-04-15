/**
 * External dependencies
 */
/**
 * WordPress dependencies
 */
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import type { PageUtils } from './index';

const VISUAL_EDITOR_SELECTOR = 'iframe[title="Editor canvas"i]';

interface SiteEditorQueryParams {
	postId: string | number;
	postType: string;
}

/**
 * Visits the Site Editor main page
 *
 * By default, it also skips the welcome guide. The option can be disabled if need be.
 *
 * @param  this
 * @param  query            Query params to be serialized as query portion of URL.
 * @param  skipWelcomeGuide Whether to skip the welcome guide as part of the navigation.
 */
export async function visitSiteEditor(
	this: PageUtils,
	query: SiteEditorQueryParams,
	skipWelcomeGuide = true
) {
	const path = addQueryArgs( '', {
		page: 'gutenberg-edit-site',
		...query,
	} ).slice( 1 );

	await this.visitAdminPage( 'themes.php', path );
	await this.page.waitForSelector( VISUAL_EDITOR_SELECTOR );

	if ( skipWelcomeGuide ) {
		await this.page.evaluate( () => {
			// TODO, type `window.wp`.
			// @ts-ignore
			window.wp.data
				.dispatch( 'core/preferences' )
				.set( 'core/edit-site', 'welcomeGuide', false );

			// @ts-ignore
			window.wp.data
				.dispatch( 'core/preferences' )
				.toggle( 'core/edit-site', 'welcomeGuideStyles', false );
		} );
	}
}
