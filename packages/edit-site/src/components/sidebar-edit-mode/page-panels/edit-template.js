/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { BlockContextProvider, BlockPreview } from '@wordpress/block-editor';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { store as coreStore } from '@wordpress/core-data';
import { parse } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { store as editSiteStore } from '../../../store';

export default function EditTemplate() {
	const { context, hasResolved, template } = useSelect( ( select ) => {
		const { getEditedPostContext, getEditedPostType, getEditedPostId } =
			select( editSiteStore );
		const { getEditedEntityRecord, hasFinishedResolution } =
			select( coreStore );
		const _context = getEditedPostContext();
		const queryArgs = [
			'postType',
			getEditedPostType(),
			getEditedPostId(),
		];
		return {
			context: _context,
			hasResolved: hasFinishedResolution(
				'getEditedEntityRecord',
				queryArgs
			),
			template: getEditedEntityRecord( ...queryArgs ),
		};
	}, [] );

	const { setHasPageContentFocus } = useDispatch( editSiteStore );

	const blockContext = useMemo(
		() => ( { ...context, postType: null, postId: null } ),
		[ context ]
	);

	const blocks = useMemo(
		() =>
			template.blocks ??
			( template.content && typeof template.content !== 'function'
				? parse( template.content )
				: [] ),
		[ template.blocks, template.content ]
	);

	if ( ! hasResolved ) {
		return null;
	}

	return (
		<VStack>
			<div>{ decodeEntities( template.title ) }</div>
			<div className="edit-site-page-panels__edit-template-preview">
				<BlockContextProvider value={ blockContext }>
					<BlockPreview viewportWidth={ 1024 } blocks={ blocks } />
				</BlockContextProvider>
			</div>
			<Button
				className="edit-site-page-panels__edit-template-button"
				variant="secondary"
				onClick={ () => setHasPageContentFocus( false ) }
			>
				{ __( 'Edit template' ) }
			</Button>
		</VStack>
	);
}
