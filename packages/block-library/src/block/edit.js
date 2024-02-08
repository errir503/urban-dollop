/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useRegistry, useSelect, useDispatch } from '@wordpress/data';
import { useRef, useMemo, useEffect } from '@wordpress/element';
import { useEntityRecord, store as coreStore } from '@wordpress/core-data';
import {
	Placeholder,
	Spinner,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	useInnerBlocksProps,
	RecursionProvider,
	useHasRecursion,
	InnerBlocks,
	useBlockProps,
	Warning,
	privateApis as blockEditorPrivateApis,
	store as blockEditorStore,
	BlockControls,
} from '@wordpress/block-editor';
import { privateApis as patternsPrivateApis } from '@wordpress/patterns';
import { parse, cloneBlock } from '@wordpress/blocks';
import { RichTextData } from '@wordpress/rich-text';

/**
 * Internal dependencies
 */
import { name as patternBlockName } from './index';
import { unlock } from '../lock-unlock';

const { useLayoutClasses } = unlock( blockEditorPrivateApis );
const { PARTIAL_SYNCING_SUPPORTED_BLOCKS } = unlock( patternsPrivateApis );

const fullAlignments = [ 'full', 'wide', 'left', 'right' ];

const useInferredLayout = ( blocks, parentLayout ) => {
	const initialInferredAlignmentRef = useRef();

	return useMemo( () => {
		// Exit early if the pattern's blocks haven't loaded yet.
		if ( ! blocks?.length ) {
			return {};
		}

		let alignment = initialInferredAlignmentRef.current;

		// Only track the initial alignment so that temporarily removed
		// alignments can be reapplied.
		if ( alignment === undefined ) {
			const isConstrained = parentLayout?.type === 'constrained';
			const hasFullAlignment = blocks.some( ( block ) =>
				fullAlignments.includes( block.attributes.align )
			);

			alignment = isConstrained && hasFullAlignment ? 'full' : null;
			initialInferredAlignmentRef.current = alignment;
		}

		const layout = alignment ? parentLayout : undefined;

		return { alignment, layout };
	}, [ blocks, parentLayout ] );
};

function hasOverridableAttributes( block ) {
	return (
		Object.keys( PARTIAL_SYNCING_SUPPORTED_BLOCKS ).includes(
			block.name
		) &&
		!! block.attributes.metadata?.bindings &&
		Object.values( block.attributes.metadata.bindings ).some(
			( binding ) => binding.source === 'core/pattern-overrides'
		)
	);
}

function hasOverridableBlocks( blocks ) {
	return blocks.some( ( block ) => {
		if ( hasOverridableAttributes( block ) ) return true;
		return hasOverridableBlocks( block.innerBlocks );
	} );
}

function getOverridableAttributes( block ) {
	return Object.entries( block.attributes.metadata.bindings )
		.filter(
			( [ , binding ] ) => binding.source === 'core/pattern-overrides'
		)
		.map( ( [ attributeKey ] ) => attributeKey );
}

function applyInitialContentValuesToInnerBlocks(
	blocks,
	content = {},
	defaultValues
) {
	return blocks.map( ( block ) => {
		const innerBlocks = applyInitialContentValuesToInnerBlocks(
			block.innerBlocks,
			content,
			defaultValues
		);
		const blockId = block.attributes.metadata?.id;
		if ( ! hasOverridableAttributes( block ) || ! blockId )
			return { ...block, innerBlocks };
		const attributes = getOverridableAttributes( block );
		const newAttributes = { ...block.attributes };
		for ( const attributeKey of attributes ) {
			defaultValues[ blockId ] ??= {};
			defaultValues[ blockId ][ attributeKey ] =
				block.attributes[ attributeKey ];

			const contentValues = content[ blockId ]?.values;
			if ( contentValues?.[ attributeKey ] !== undefined ) {
				newAttributes[ attributeKey ] = contentValues[ attributeKey ];
			}
		}
		return {
			...block,
			attributes: newAttributes,
			innerBlocks,
		};
	} );
}

function isAttributeEqual( attribute1, attribute2 ) {
	if (
		attribute1 instanceof RichTextData &&
		attribute2 instanceof RichTextData
	) {
		return attribute1.toString() === attribute2.toString();
	}
	return attribute1 === attribute2;
}

function getContentValuesFromInnerBlocks( blocks, defaultValues ) {
	/** @type {Record<string, { values: Record<string, unknown>}>} */
	const content = {};
	for ( const block of blocks ) {
		if ( block.name === patternBlockName ) continue;
		Object.assign(
			content,
			getContentValuesFromInnerBlocks( block.innerBlocks, defaultValues )
		);
		const blockId = block.attributes.metadata?.id;
		if ( ! hasOverridableAttributes( block ) || ! blockId ) continue;
		const attributes = getOverridableAttributes( block );
		for ( const attributeKey of attributes ) {
			if (
				! isAttributeEqual(
					block.attributes[ attributeKey ],
					defaultValues[ blockId ][ attributeKey ]
				)
			) {
				content[ blockId ] ??= { values: {}, blockName: block.name };
				// TODO: We need a way to represent `undefined` in the serialized overrides.
				// Also see: https://github.com/WordPress/gutenberg/pull/57249#discussion_r1452987871
				content[ blockId ].values[ attributeKey ] =
					block.attributes[ attributeKey ] === undefined
						? // TODO: We use an empty string to represent undefined for now until
						  // we support a richer format for overrides and the block binding API.
						  // Currently only the `linkTarget` attribute of `core/button` is affected.
						  ''
						: block.attributes[ attributeKey ];
			}
		}
	}
	return Object.keys( content ).length > 0 ? content : undefined;
}

function setBlockEditMode( setEditMode, blocks, mode ) {
	blocks.forEach( ( block ) => {
		const editMode =
			mode ||
			( hasOverridableAttributes( block ) ? 'contentOnly' : 'disabled' );
		setEditMode( block.clientId, editMode );

		setBlockEditMode(
			setEditMode,
			block.innerBlocks,
			// Disable editing for nested patterns.
			block.name === patternBlockName ? 'disabled' : mode
		);
	} );
}

export default function ReusableBlockEdit( {
	name,
	attributes: { ref, content },
	__unstableParentLayout: parentLayout,
	clientId: patternClientId,
	setAttributes,
} ) {
	const registry = useRegistry();
	const hasAlreadyRendered = useHasRecursion( ref );
	const { record, editedRecord, hasResolved } = useEntityRecord(
		'postType',
		'wp_block',
		ref
	);
	const isMissing = hasResolved && ! record;

	// The initial value of the `content` attribute.
	const initialContent = useRef( content );

	// The default content values from the original pattern for overridable attributes.
	// Set by the `applyInitialContentValuesToInnerBlocks` function.
	const defaultContent = useRef( {} );

	const {
		replaceInnerBlocks,
		__unstableMarkNextChangeAsNotPersistent,
		setBlockEditingMode,
	} = useDispatch( blockEditorStore );
	const { syncDerivedUpdates } = unlock( useDispatch( blockEditorStore ) );

	const {
		innerBlocks,
		userCanEdit,
		getBlockEditingMode,
		onNavigateToEntityRecord,
		editingMode,
	} = useSelect(
		( select ) => {
			const { canUser } = select( coreStore );
			const {
				getBlocks,
				getSettings,
				getBlockEditingMode: _getBlockEditingMode,
			} = select( blockEditorStore );
			const blocks = getBlocks( patternClientId );
			const canEdit = canUser( 'update', 'blocks', ref );

			// For editing link to the site editor if the theme and user permissions support it.
			return {
				innerBlocks: blocks,
				userCanEdit: canEdit,
				getBlockEditingMode: _getBlockEditingMode,
				onNavigateToEntityRecord:
					getSettings().onNavigateToEntityRecord,
				editingMode: _getBlockEditingMode( patternClientId ),
			};
		},
		[ patternClientId, ref ]
	);

	// Sync the editing mode of the pattern block with the inner blocks.
	useEffect( () => {
		setBlockEditMode(
			setBlockEditingMode,
			innerBlocks,
			// Disable editing if the pattern itself is disabled.
			editingMode === 'disabled' ? 'disabled' : undefined
		);
	}, [ editingMode, innerBlocks, setBlockEditingMode ] );

	const canOverrideBlocks = useMemo(
		() => hasOverridableBlocks( innerBlocks ),
		[ innerBlocks ]
	);

	const initialBlocks = useMemo(
		() =>
			// Clone the blocks to generate new client IDs.
			editedRecord.blocks?.map( ( block ) => cloneBlock( block ) ) ??
			( editedRecord.content && typeof editedRecord.content !== 'function'
				? parse( editedRecord.content )
				: [] ),
		[ editedRecord.blocks, editedRecord.content ]
	);

	// Apply the initial overrides from the pattern block to the inner blocks.
	useEffect( () => {
		defaultContent.current = {};
		const originalEditingMode = getBlockEditingMode( patternClientId );
		// Replace the contents of the blocks with the overrides.
		registry.batch( () => {
			setBlockEditingMode( patternClientId, 'default' );
			syncDerivedUpdates( () => {
				replaceInnerBlocks(
					patternClientId,
					applyInitialContentValuesToInnerBlocks(
						initialBlocks,
						initialContent.current,
						defaultContent.current
					)
				);
			} );
			setBlockEditingMode( patternClientId, originalEditingMode );
		} );
	}, [
		__unstableMarkNextChangeAsNotPersistent,
		patternClientId,
		initialBlocks,
		replaceInnerBlocks,
		registry,
		getBlockEditingMode,
		setBlockEditingMode,
		syncDerivedUpdates,
	] );

	const { alignment, layout } = useInferredLayout(
		innerBlocks,
		parentLayout
	);
	const layoutClasses = useLayoutClasses( { layout }, name );

	const blockProps = useBlockProps( {
		className: classnames(
			'block-library-block__reusable-block-container',
			layout && layoutClasses,
			{ [ `align${ alignment }` ]: alignment }
		),
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		templateLock: 'all',
		layout,
		renderAppender: innerBlocks?.length
			? undefined
			: InnerBlocks.ButtonBlockAppender,
	} );

	// Sync the `content` attribute from the updated blocks to the pattern block.
	// `syncDerivedUpdates` is used here to avoid creating an additional undo level.
	useEffect( () => {
		const { getBlocks } = registry.select( blockEditorStore );
		let prevBlocks = getBlocks( patternClientId );
		return registry.subscribe( () => {
			const blocks = getBlocks( patternClientId );
			if ( blocks !== prevBlocks ) {
				prevBlocks = blocks;
				syncDerivedUpdates( () => {
					setAttributes( {
						content: getContentValuesFromInnerBlocks(
							blocks,
							defaultContent.current
						),
					} );
				} );
			}
		}, blockEditorStore );
	}, [ syncDerivedUpdates, patternClientId, registry, setAttributes ] );

	const handleEditOriginal = () => {
		onNavigateToEntityRecord( {
			postId: ref,
			postType: 'wp_block',
		} );
	};

	const resetContent = () => {
		if ( content ) {
			replaceInnerBlocks( patternClientId, initialBlocks );
		}
	};

	let children = null;

	if ( hasAlreadyRendered ) {
		children = (
			<Warning>
				{ __( 'Block cannot be rendered inside itself.' ) }
			</Warning>
		);
	}

	if ( isMissing ) {
		children = (
			<Warning>
				{ __( 'Block has been deleted or is unavailable.' ) }
			</Warning>
		);
	}

	if ( ! hasResolved ) {
		children = (
			<Placeholder>
				<Spinner />
			</Placeholder>
		);
	}

	return (
		<RecursionProvider uniqueId={ ref }>
			{ userCanEdit && onNavigateToEntityRecord && (
				<BlockControls>
					<ToolbarGroup>
						<ToolbarButton onClick={ handleEditOriginal }>
							{ __( 'Edit original' ) }
						</ToolbarButton>
					</ToolbarGroup>
				</BlockControls>
			) }

			{ canOverrideBlocks && (
				<BlockControls>
					<ToolbarGroup>
						<ToolbarButton
							onClick={ resetContent }
							disabled={ ! content }
							__experimentalIsFocusable
						>
							{ __( 'Reset' ) }
						</ToolbarButton>
					</ToolbarGroup>
				</BlockControls>
			) }

			{ children === null ? (
				<div { ...innerBlocksProps } />
			) : (
				<div { ...blockProps }>{ children }</div>
			) }
		</RecursionProvider>
	);
}
