/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { CheckboxControl } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import PostStickyCheck from './check';
import { store as editorStore } from '../../store';

export function PostSticky( { onUpdateSticky, postSticky = false } ) {
	return (
		<PostStickyCheck>
			<CheckboxControl
				__nextHasNoMarginBottom
				label={ __( 'Stick to the top of the blog' ) }
				checked={ postSticky }
				onChange={ () => onUpdateSticky( ! postSticky ) }
			/>
		</PostStickyCheck>
	);
}

export default compose( [
	withSelect( ( select ) => {
		return {
			postSticky:
				select( editorStore ).getEditedPostAttribute( 'sticky' ),
		};
	} ),
	withDispatch( ( dispatch ) => {
		return {
			onUpdateSticky( postSticky ) {
				dispatch( editorStore ).editPost( { sticky: postSticky } );
			},
		};
	} ),
] )( PostSticky );
