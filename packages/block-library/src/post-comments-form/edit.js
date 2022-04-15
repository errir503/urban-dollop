/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import {
	AlignmentControl,
	BlockControls,
	Warning,
	useBlockProps,
} from '@wordpress/block-editor';
import { useEntityProp } from '@wordpress/core-data';
import { __, sprintf } from '@wordpress/i18n';

export default function PostCommentsFormEdit( {
	attributes,
	context,
	setAttributes,
} ) {
	const { textAlign } = attributes;
	const { postId, postType } = context;
	const [ commentStatus ] = useEntityProp(
		'postType',
		postType,
		'comment_status',
		postId
	);
	const blockProps = useBlockProps( {
		className: classnames( {
			[ `has-text-align-${ textAlign }` ]: textAlign,
		} ),
	} );

	const isInSiteEditor = postType === undefined || postId === undefined;

	return (
		<>
			<BlockControls group="block">
				<AlignmentControl
					value={ textAlign }
					onChange={ ( nextAlign ) => {
						setAttributes( { textAlign: nextAlign } );
					} }
				/>
			</BlockControls>
			<div { ...blockProps }>
				{ ! commentStatus && ! isInSiteEditor && (
					<Warning>
						{ __(
							'Post Comments Form block: comments are not enabled for this post type.'
						) }
					</Warning>
				) }

				{ 'open' !== commentStatus && ! isInSiteEditor && (
					<Warning>
						{ sprintf(
							/* translators: 1: Post type (i.e. "post", "page") */
							__(
								'Post Comments Form block: comments to this %s are not allowed.'
							),
							postType
						) }
					</Warning>
				) }

				{ ( 'open' === commentStatus || isInSiteEditor ) &&
					__( 'Post Comments Form' ) }
			</div>
		</>
	);
}
