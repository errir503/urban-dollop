/**
 * WordPress dependencies
 */
import { sprintf, _n } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { withSelect } from '@wordpress/data';
import { backup } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import PostLastRevisionCheck from './check';
import { getWPAdminURL } from '../../utils/url';

function LastRevision( { lastRevisionId, revisionsCount } ) {
	return (
		<PostLastRevisionCheck>
			<Button
				href={ getWPAdminURL( 'revision.php', {
					revision: lastRevisionId,
					gutenberg: true,
				} ) }
				className="editor-post-last-revision__title"
				icon={ backup }
			>
				{ sprintf(
					/* translators: %d: number of revisions */
					_n( '%d Revision', '%d Revisions', revisionsCount ),
					revisionsCount
				) }
			</Button>
		</PostLastRevisionCheck>
	);
}

export default withSelect( ( select ) => {
	const {
		getCurrentPostLastRevisionId,
		getCurrentPostRevisionsCount,
	} = select( 'core/editor' );
	return {
		lastRevisionId: getCurrentPostLastRevisionId(),
		revisionsCount: getCurrentPostRevisionsCount(),
	};
} )( LastRevision );
