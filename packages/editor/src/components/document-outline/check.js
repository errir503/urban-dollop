/**
 * External dependencies
 */
import { filter } from 'lodash';

/**
 * WordPress dependencies
 */
import { withSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

function DocumentOutlineCheck( { blocks, children } ) {
	const headings = filter(
		blocks,
		( block ) => block.name === 'core/heading'
	);

	if ( headings.length < 1 ) {
		return null;
	}

	return children;
}

export default withSelect( ( select ) => ( {
	blocks: select( blockEditorStore ).getBlocks(),
} ) )( DocumentOutlineCheck );
