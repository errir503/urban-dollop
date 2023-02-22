/**
 * Internal dependencies
 */
import type { Editor } from './index';

/**
 * Returns a promise which resolves with the edited post content (HTML string).
 *
 * @param this
 *
 * @return Promise resolving with post content markup.
 */
export async function getEditedPostContent( this: Editor ) {
	return await this.page.evaluate( () =>
		window.wp.data.select( 'core/editor' ).getEditedPostContent()
	);
}
