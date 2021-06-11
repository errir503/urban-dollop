/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { ExternalLink, TextareaControl } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

function PostExcerpt( { excerpt, onUpdateExcerpt } ) {
	return (
		<div className="editor-post-excerpt">
			<TextareaControl
				label={ __( 'Write an excerpt (optional)' ) }
				className="editor-post-excerpt__textarea"
				onChange={ ( value ) => onUpdateExcerpt( value ) }
				value={ excerpt }
			/>
			<ExternalLink
				href={ __( 'https://wordpress.org/support/article/excerpt/' ) }
			>
				{ __( 'Learn more about manual excerpts' ) }
			</ExternalLink>
		</div>
	);
}

export default compose( [
	withSelect( ( select ) => {
		return {
			excerpt: select( 'core/editor' ).getEditedPostAttribute(
				'excerpt'
			),
		};
	} ),
	withDispatch( ( dispatch ) => ( {
		onUpdateExcerpt( excerpt ) {
			dispatch( 'core/editor' ).editPost( { excerpt } );
		},
	} ) ),
] )( PostExcerpt );
