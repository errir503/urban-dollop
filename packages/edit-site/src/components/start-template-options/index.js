/**
 * WordPress dependencies
 */
import { Modal, Flex, FlexItem, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useMemo } from '@wordpress/element';
import { __experimentalBlockPatternsList as BlockPatternsList } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useAsyncList } from '@wordpress/compose';
import { store as preferencesStore } from '@wordpress/preferences';
import { parse } from '@wordpress/blocks';
import { store as coreStore, useEntityBlockEditor } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import { store as editSiteStore } from '../../store';
import { TEMPLATE_POST_TYPE } from '../../utils/constants';

function useFallbackTemplateContent( slug, isCustom = false ) {
	return useSelect(
		( select ) => {
			const { getEntityRecord, getDefaultTemplateId } =
				select( coreStore );
			const templateId = getDefaultTemplateId( {
				slug,
				is_custom: isCustom,
				ignore_empty: true,
			} );
			return templateId
				? getEntityRecord( 'postType', TEMPLATE_POST_TYPE, templateId )
						?.content?.raw
				: undefined;
		},
		[ slug, isCustom ]
	);
}

function useStartPatterns( fallbackContent ) {
	const { slug, patterns } = useSelect( ( select ) => {
		const { getEditedPostType, getEditedPostId } = select( editSiteStore );
		const { getEntityRecord, getBlockPatterns } = select( coreStore );
		const postId = getEditedPostId();
		const postType = getEditedPostType();
		const record = getEntityRecord( 'postType', postType, postId );
		return {
			slug: record.slug,
			patterns: getBlockPatterns(),
		};
	}, [] );

	const currentThemeStylesheet = useSelect(
		( select ) => select( coreStore ).getCurrentTheme().stylesheet
	);

	// Duplicated from packages/block-library/src/pattern/edit.js.
	function injectThemeAttributeInBlockTemplateContent( block ) {
		if (
			block.innerBlocks.find(
				( innerBlock ) => innerBlock.name === 'core/template-part'
			)
		) {
			block.innerBlocks = block.innerBlocks.map( ( innerBlock ) => {
				if (
					innerBlock.name === 'core/template-part' &&
					innerBlock.attributes.theme === undefined
				) {
					innerBlock.attributes.theme = currentThemeStylesheet;
				}
				return innerBlock;
			} );
		}

		if (
			block.name === 'core/template-part' &&
			block.attributes.theme === undefined
		) {
			block.attributes.theme = currentThemeStylesheet;
		}
		return block;
	}

	return useMemo( () => {
		// filter patterns that are supposed to be used in the current template being edited.
		return [
			{
				name: 'fallback',
				blocks: parse( fallbackContent ),
				title: __( 'Fallback content' ),
			},
			...patterns
				.filter( ( pattern ) => {
					return (
						Array.isArray( pattern.templateTypes ) &&
						pattern.templateTypes.some( ( templateType ) =>
							slug.startsWith( templateType )
						)
					);
				} )
				.map( ( pattern ) => {
					return {
						...pattern,
						blocks: parse( pattern.content ).map( ( block ) =>
							injectThemeAttributeInBlockTemplateContent( block )
						),
					};
				} ),
		];
	}, [ fallbackContent, slug, patterns ] );
}

function PatternSelection( { fallbackContent, onChoosePattern, postType } ) {
	const [ , , onChange ] = useEntityBlockEditor( 'postType', postType );
	const blockPatterns = useStartPatterns( fallbackContent );
	const shownBlockPatterns = useAsyncList( blockPatterns );
	return (
		<BlockPatternsList
			blockPatterns={ blockPatterns }
			shownPatterns={ shownBlockPatterns }
			onClickPattern={ ( pattern, blocks ) => {
				onChange( blocks, { selection: undefined } );
				onChoosePattern();
			} }
		/>
	);
}

function StartModal( { slug, isCustom, onClose, postType } ) {
	const fallbackContent = useFallbackTemplateContent( slug, isCustom );
	if ( ! fallbackContent ) {
		return null;
	}
	return (
		<Modal
			className="edit-site-start-template-options__modal"
			title={ __( 'Choose a pattern' ) }
			closeLabel={ __( 'Cancel' ) }
			focusOnMount="firstElement"
			onRequestClose={ onClose }
			isFullScreen={ true }
		>
			<div className="edit-site-start-template-options__modal-content">
				<PatternSelection
					fallbackContent={ fallbackContent }
					slug={ slug }
					isCustom={ isCustom }
					postType={ postType }
					onChoosePattern={ () => {
						onClose();
					} }
				/>
			</div>
			<Flex
				className="edit-site-start-template-options__modal__actions"
				justify="flex-end"
				expanded={ false }
			>
				<FlexItem>
					<Button variant="tertiary" onClick={ onClose }>
						{ __( 'Skip' ) }
					</Button>
				</FlexItem>
			</Flex>
		</Modal>
	);
}

const START_TEMPLATE_MODAL_STATES = {
	INITIAL: 'INITIAL',
	CLOSED: 'CLOSED',
};

export default function StartTemplateOptions() {
	const [ modalState, setModalState ] = useState(
		START_TEMPLATE_MODAL_STATES.INITIAL
	);
	const { shouldOpenModal, slug, isCustom, postType } = useSelect(
		( select ) => {
			const { getEditedPostType, getEditedPostId } =
				select( editSiteStore );
			const _postType = getEditedPostType();
			const postId = getEditedPostId();
			const { getEditedEntityRecord, hasEditsForEntityRecord } =
				select( coreStore );
			const templateRecord = getEditedEntityRecord(
				'postType',
				_postType,
				postId
			);
			const hasEdits = hasEditsForEntityRecord(
				'postType',
				_postType,
				postId
			);

			return {
				shouldOpenModal:
					! hasEdits &&
					'' === templateRecord.content &&
					TEMPLATE_POST_TYPE === _postType &&
					! select( preferencesStore ).get(
						'core/edit-site',
						'welcomeGuide'
					),
				slug: templateRecord.slug,
				isCustom: templateRecord.is_custom,
				postType: _postType,
			};
		},
		[]
	);

	if (
		( modalState === START_TEMPLATE_MODAL_STATES.INITIAL &&
			! shouldOpenModal ) ||
		modalState === START_TEMPLATE_MODAL_STATES.CLOSED
	) {
		return null;
	}

	return (
		<StartModal
			slug={ slug }
			isCustom={ isCustom }
			postType={ postType }
			onClose={ () =>
				setModalState( START_TEMPLATE_MODAL_STATES.CLOSED )
			}
		/>
	);
}
