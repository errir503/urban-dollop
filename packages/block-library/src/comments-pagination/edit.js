/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { getBlockSupport } from '@wordpress/blocks';
import { PanelBody } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { CommentsPaginationArrowControls } from './comments-pagination-arrow-controls';

// TODO: add pagination-previous/next blocks once they are implemented.
const TEMPLATE = [ [ 'core/comments-pagination-numbers' ] ];

const getDefaultBlockLayout = ( blockTypeOrName ) => {
	const layoutBlockSupportConfig = getBlockSupport(
		blockTypeOrName,
		'__experimentalLayout'
	);
	return layoutBlockSupportConfig?.default;
};

export default function QueryPaginationEdit( {
	attributes: { paginationArrow, layout },
	setAttributes,
	clientId,
	name,
} ) {
	const usedLayout = layout || getDefaultBlockLayout( name );
	const hasNextPreviousBlocks = useSelect( ( select ) => {
		const { getBlocks } = select( blockEditorStore );
		const innerBlocks = getBlocks( clientId );
		/**
		 * Show the `paginationArrow` control only if a
		 * `QueryPaginationNext/Previous` block exists.
		 */
		return innerBlocks?.find( ( innerBlock ) => {
			return [
				'core/query-pagination-next',
				'core/query-pagination-previous',
			].includes( innerBlock.name );
		} );
	}, [] );
	const blockProps = useBlockProps();
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		allowedBlocks: [
			// TODO: add pagination-previous/next blocks once they are implemented.
			'core/comments-pagination-numbers',
		],
		__experimentalLayout: usedLayout,
	} );
	return (
		<>
			{ hasNextPreviousBlocks && (
				<InspectorControls>
					<PanelBody title={ __( 'Settings' ) }>
						<CommentsPaginationArrowControls
							value={ paginationArrow }
							onChange={ ( value ) => {
								setAttributes( { paginationArrow: value } );
							} }
						/>
					</PanelBody>
				</InspectorControls>
			) }
			<div { ...innerBlocksProps } />
		</>
	);
}
