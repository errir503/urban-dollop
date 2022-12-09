/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import ServerSideRender from './server-side-render';

/**
 * Constants
 */
const EMPTY_OBJECT = {};

const ExportedServerSideRender = withSelect( ( select ) => {
	// FIXME: @wordpress/server-side-render should not depend on @wordpress/editor.
	// It is used by blocks that can be loaded into a *non-post* block editor.
	// eslint-disable-next-line @wordpress/data-no-store-string-literals
	const coreEditorSelect = select( 'core/editor' );
	if ( coreEditorSelect ) {
		const currentPostId = coreEditorSelect.getCurrentPostId();
		// For templates and template parts we use a custom ID format.
		// Since they aren't real posts, we don't want to use their ID
		// for server-side rendering. Since they use a string based ID,
		// we can assume real post IDs are numbers.
		if ( currentPostId && typeof currentPostId === 'number' ) {
			return {
				currentPostId,
			};
		}
	}
	return EMPTY_OBJECT;
} )( ( { urlQueryArgs = EMPTY_OBJECT, currentPostId, ...props } ) => {
	const newUrlQueryArgs = useMemo( () => {
		if ( ! currentPostId ) {
			return urlQueryArgs;
		}
		return {
			post_id: currentPostId,
			...urlQueryArgs,
		};
	}, [ currentPostId, urlQueryArgs ] );

	return <ServerSideRender urlQueryArgs={ newUrlQueryArgs } { ...props } />;
} );

export default ExportedServerSideRender;
