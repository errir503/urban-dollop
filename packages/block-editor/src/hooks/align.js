/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { createHigherOrderComponent, pure } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import {
	getBlockSupport,
	getBlockType,
	hasBlockSupport,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { BlockControls, BlockAlignmentControl } from '../components';
import useAvailableAlignments from '../components/block-alignment-control/use-available-alignments';
import { useBlockEditingMode } from '../components/block-editing-mode';

/**
 * An array which includes all possible valid alignments,
 * used to validate if an alignment is valid or not.
 *
 * @constant
 * @type {string[]}
 */
const ALL_ALIGNMENTS = [ 'left', 'center', 'right', 'wide', 'full' ];

/**
 * An array which includes all wide alignments.
 * In order for this alignments to be valid they need to be supported by the block,
 * and by the theme.
 *
 * @constant
 * @type {string[]}
 */
const WIDE_ALIGNMENTS = [ 'wide', 'full' ];

/**
 * Returns the valid alignments.
 * Takes into consideration the aligns supported by a block, if the block supports wide controls or not and if theme supports wide controls or not.
 * Exported just for testing purposes, not exported outside the module.
 *
 * @param {?boolean|string[]} blockAlign          Aligns supported by the block.
 * @param {?boolean}          hasWideBlockSupport True if block supports wide alignments. And False otherwise.
 * @param {?boolean}          hasWideEnabled      True if theme supports wide alignments. And False otherwise.
 *
 * @return {string[]} Valid alignments.
 */
export function getValidAlignments(
	blockAlign,
	hasWideBlockSupport = true,
	hasWideEnabled = true
) {
	let validAlignments;
	if ( Array.isArray( blockAlign ) ) {
		validAlignments = ALL_ALIGNMENTS.filter( ( value ) =>
			blockAlign.includes( value )
		);
	} else if ( blockAlign === true ) {
		// `true` includes all alignments...
		validAlignments = [ ...ALL_ALIGNMENTS ];
	} else {
		validAlignments = [];
	}

	if (
		! hasWideEnabled ||
		( blockAlign === true && ! hasWideBlockSupport )
	) {
		return validAlignments.filter(
			( alignment ) => ! WIDE_ALIGNMENTS.includes( alignment )
		);
	}

	return validAlignments;
}

/**
 * Filters registered block settings, extending attributes to include `align`.
 *
 * @param {Object} settings Original block settings.
 *
 * @return {Object} Filtered block settings.
 */
export function addAttribute( settings ) {
	// Allow blocks to specify their own attribute definition with default values if needed.
	if ( 'type' in ( settings.attributes?.align ?? {} ) ) {
		return settings;
	}
	if ( hasBlockSupport( settings, 'align' ) ) {
		// Gracefully handle if settings.attributes is undefined.
		settings.attributes = {
			...settings.attributes,
			align: {
				type: 'string',
				// Allow for '' since it is used by the `updateAlignment` function
				// in toolbar controls for special cases with defined default values.
				enum: [ ...ALL_ALIGNMENTS, '' ],
			},
		};
	}

	return settings;
}

function BlockEditAlignmentToolbarControlsPure( {
	blockName,
	align,
	setAttributes,
} ) {
	// Compute the block valid alignments by taking into account,
	// if the theme supports wide alignments or not and the layout's
	// available alignments. We do that for conditionally rendering
	// Slot.
	const blockAllowedAlignments = getValidAlignments(
		getBlockSupport( blockName, 'align' ),
		hasBlockSupport( blockName, 'alignWide', true )
	);

	const validAlignments = useAvailableAlignments(
		blockAllowedAlignments
	).map( ( { name } ) => name );
	const blockEditingMode = useBlockEditingMode();
	if ( ! validAlignments.length || blockEditingMode !== 'default' ) {
		return null;
	}

	const updateAlignment = ( nextAlign ) => {
		if ( ! nextAlign ) {
			const blockType = getBlockType( blockName );
			const blockDefaultAlign = blockType?.attributes?.align?.default;
			if ( blockDefaultAlign ) {
				nextAlign = '';
			}
		}
		setAttributes( { align: nextAlign } );
	};

	return (
		<BlockControls group="block" __experimentalShareWithChildBlocks>
			<BlockAlignmentControl
				value={ align }
				onChange={ updateAlignment }
				controls={ validAlignments }
			/>
		</BlockControls>
	);
}

// We don't want block controls to re-render when typing inside a block. `pure`
// will prevent re-renders unless props change, so only pass the needed props
// and not the whole attributes object.
const BlockEditAlignmentToolbarControls = pure(
	BlockEditAlignmentToolbarControlsPure
);

/**
 * Override the default edit UI to include new toolbar controls for block
 * alignment, if block defines support.
 *
 * @param {Function} BlockEdit Original component.
 *
 * @return {Function} Wrapped component.
 */
export const withAlignmentControls = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const hasAlignmentSupport = hasBlockSupport(
			props.name,
			'align',
			false
		);

		return (
			<>
				{ hasAlignmentSupport && (
					<BlockEditAlignmentToolbarControls
						blockName={ props.name }
						// This component is pure, so only pass needed props!
						align={ props.attributes.align }
						setAttributes={ props.setAttributes }
					/>
				) }
				<BlockEdit key="edit" { ...props } />
			</>
		);
	},
	'withAlignmentControls'
);

function BlockListBlockWithDataAlign( { block: BlockListBlock, props } ) {
	const { name, attributes } = props;
	const { align } = attributes;
	const blockAllowedAlignments = getValidAlignments(
		getBlockSupport( name, 'align' ),
		hasBlockSupport( name, 'alignWide', true )
	);
	const validAlignments = useAvailableAlignments( blockAllowedAlignments );

	let wrapperProps = props.wrapperProps;
	if ( validAlignments.some( ( alignment ) => alignment.name === align ) ) {
		wrapperProps = { ...wrapperProps, 'data-align': align };
	}

	return <BlockListBlock { ...props } wrapperProps={ wrapperProps } />;
}

/**
 * Override the default block element to add alignment wrapper props.
 *
 * @param {Function} BlockListBlock Original component.
 *
 * @return {Function} Wrapped component.
 */
export const withDataAlign = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => {
		// If an alignment is not assigned, there's no need to go through the
		// effort to validate or assign its value.
		if ( props.attributes.align === undefined ) {
			return <BlockListBlock { ...props } />;
		}

		return (
			<BlockListBlockWithDataAlign
				block={ BlockListBlock }
				props={ props }
			/>
		);
	},
	'withDataAlign'
);

/**
 * Override props assigned to save component to inject alignment class name if
 * block supports it.
 *
 * @param {Object} props      Additional props applied to save element.
 * @param {Object} blockType  Block type.
 * @param {Object} attributes Block attributes.
 *
 * @return {Object} Filtered props applied to save element.
 */
export function addAssignedAlign( props, blockType, attributes ) {
	const { align } = attributes;
	const blockAlign = getBlockSupport( blockType, 'align' );
	const hasWideBlockSupport = hasBlockSupport( blockType, 'alignWide', true );

	// Compute valid alignments without taking into account if
	// the theme supports wide alignments or not.
	// This way changing themes does not impact the block save.
	const isAlignValid = getValidAlignments(
		blockAlign,
		hasWideBlockSupport
	).includes( align );
	if ( isAlignValid ) {
		props.className = classnames( `align${ align }`, props.className );
	}

	return props;
}

addFilter(
	'blocks.registerBlockType',
	'core/editor/align/addAttribute',
	addAttribute
);
addFilter(
	'editor.BlockListBlock',
	'core/editor/align/with-data-align',
	withDataAlign
);
addFilter(
	'editor.BlockEdit',
	'core/editor/align/with-toolbar-controls',
	withAlignmentControls
);
addFilter(
	'blocks.getSaveContent.extraProps',
	'core/editor/align/addAssignedAlign',
	addAssignedAlign
);
