/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import {
	useBlockProps,
	__experimentalUseInnerBlocksProps as useInnerBlocksProps,
	__experimentalUseEditorFeature as useEditorFeature,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useEntityBlockEditor } from '@wordpress/core-data';

function Content( { layout, postType, postId } ) {
	const themeSupportsLayout = useSelect( ( select ) => {
		const { getSettings } = select( blockEditorStore );
		return getSettings()?.supportsLayout;
	}, [] );
	const defaultLayout = useEditorFeature( 'layout' ) || {};
	const usedLayout = !! layout && layout.inherit ? defaultLayout : layout;
	const { contentSize, wideSize } = usedLayout;
	const alignments =
		contentSize || wideSize
			? [ 'wide', 'full' ]
			: [ 'left', 'center', 'right' ];
	const [ blocks, onInput, onChange ] = useEntityBlockEditor(
		'postType',
		postType,
		{ id: postId }
	);
	const props = useInnerBlocksProps(
		useBlockProps( { className: 'entry-content' } ),
		{
			value: blocks,
			onInput,
			onChange,
			__experimentalLayout: {
				type: 'default',
				// Find a way to inject this in the support flag code (hooks).
				alignments: themeSupportsLayout ? alignments : undefined,
			},
		}
	);
	return <div { ...props } />;
}

function Placeholder() {
	const blockProps = useBlockProps();
	return (
		<div { ...blockProps }>
			<div className="wp-block-post-content__placeholder">
				<span>{ __( 'This is a placeholder for post content.' ) }</span>
			</div>
		</div>
	);
}

export default function PostContentEdit( {
	context: { postId: contextPostId, postType: contextPostType },
	attributes,
} ) {
	const { layout = {} } = attributes;

	return contextPostId && contextPostType ? (
		<Content
			postType={ contextPostType }
			postId={ contextPostId }
			layout={ layout }
		/>
	) : (
		<Placeholder />
	);
}
