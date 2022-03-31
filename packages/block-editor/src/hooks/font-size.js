/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { hasBlockSupport } from '@wordpress/blocks';
import TokenList from '@wordpress/token-list';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import {
	getFontSize,
	getFontSizeClass,
	getFontSizeObjectByValue,
	FontSizePicker,
} from '../components/font-sizes';
import { TYPOGRAPHY_SUPPORT_KEY } from './typography';
import {
	cleanEmptyObject,
	transformStyles,
	shouldSkipSerialization,
} from './utils';
import useSetting from '../components/use-setting';

export const FONT_SIZE_SUPPORT_KEY = 'typography.fontSize';

/**
 * Filters registered block settings, extending attributes to include
 * `fontSize` and `fontWeight` attributes.
 *
 * @param {Object} settings Original block settings.
 *
 * @return {Object} Filtered block settings.
 */
function addAttributes( settings ) {
	if ( ! hasBlockSupport( settings, FONT_SIZE_SUPPORT_KEY ) ) {
		return settings;
	}

	// Allow blocks to specify a default value if needed.
	if ( ! settings.attributes.fontSize ) {
		Object.assign( settings.attributes, {
			fontSize: {
				type: 'string',
			},
		} );
	}

	return settings;
}

/**
 * Override props assigned to save component to inject font size.
 *
 * @param {Object} props      Additional props applied to save element.
 * @param {Object} blockType  Block type.
 * @param {Object} attributes Block attributes.
 *
 * @return {Object} Filtered props applied to save element.
 */
function addSaveProps( props, blockType, attributes ) {
	if ( ! hasBlockSupport( blockType, FONT_SIZE_SUPPORT_KEY ) ) {
		return props;
	}

	if (
		shouldSkipSerialization( blockType, TYPOGRAPHY_SUPPORT_KEY, 'fontSize' )
	) {
		return props;
	}

	// Use TokenList to dedupe classes.
	const classes = new TokenList( props.className );
	classes.add( getFontSizeClass( attributes.fontSize ) );
	const newClassName = classes.value;
	props.className = newClassName ? newClassName : undefined;

	return props;
}

/**
 * Filters registered block settings to expand the block edit wrapper
 * by applying the desired styles and classnames.
 *
 * @param {Object} settings Original block settings.
 *
 * @return {Object} Filtered block settings.
 */
function addEditProps( settings ) {
	if ( ! hasBlockSupport( settings, FONT_SIZE_SUPPORT_KEY ) ) {
		return settings;
	}

	const existingGetEditWrapperProps = settings.getEditWrapperProps;
	settings.getEditWrapperProps = ( attributes ) => {
		let props = {};
		if ( existingGetEditWrapperProps ) {
			props = existingGetEditWrapperProps( attributes );
		}
		return addSaveProps( props, settings, attributes );
	};

	return settings;
}

/**
 * Inspector control panel containing the font size related configuration
 *
 * @param {Object} props
 *
 * @return {WPElement} Font size edit element.
 */
export function FontSizeEdit( props ) {
	const {
		attributes: { fontSize, style },
		setAttributes,
	} = props;
	const fontSizes = useSetting( 'typography.fontSizes' );

	const onChange = ( value ) => {
		const fontSizeSlug = getFontSizeObjectByValue( fontSizes, value ).slug;

		setAttributes( {
			style: cleanEmptyObject( {
				...style,
				typography: {
					...style?.typography,
					fontSize: fontSizeSlug ? undefined : value,
				},
			} ),
			fontSize: fontSizeSlug,
		} );
	};

	const fontSizeObject = getFontSize(
		fontSizes,
		fontSize,
		style?.typography?.fontSize
	);

	const fontSizeValue =
		fontSizeObject?.size || style?.typography?.fontSize || fontSize;

	return (
		<FontSizePicker
			onChange={ onChange }
			value={ fontSizeValue }
			withReset={ false }
		/>
	);
}

/**
 * Checks if there is a current value set for the font size block support.
 *
 * @param {Object} props Block props.
 * @return {boolean}     Whether or not the block has a font size value set.
 */
export function hasFontSizeValue( props ) {
	const { fontSize, style } = props.attributes;
	return !! fontSize || !! style?.typography?.fontSize;
}

/**
 * Resets the font size block support attribute. This can be used when
 * disabling the font size support controls for a block via a progressive
 * discovery panel.
 *
 * @param {Object} props               Block props.
 * @param {Object} props.attributes    Block's attributes.
 * @param {Object} props.setAttributes Function to set block's attributes.
 */
export function resetFontSize( { attributes = {}, setAttributes } ) {
	const { style } = attributes;

	setAttributes( {
		fontSize: undefined,
		style: cleanEmptyObject( {
			...style,
			typography: {
				...style?.typography,
				fontSize: undefined,
			},
		} ),
	} );
}

/**
 * Custom hook that checks if font-size settings have been disabled.
 *
 * @param {string} name The name of the block.
 * @return {boolean} Whether setting is disabled.
 */
export function useIsFontSizeDisabled( { name: blockName } = {} ) {
	const fontSizes = useSetting( 'typography.fontSizes' );
	const hasFontSizes = !! fontSizes?.length;

	return (
		! hasBlockSupport( blockName, FONT_SIZE_SUPPORT_KEY ) || ! hasFontSizes
	);
}

/**
 * Add inline styles for font sizes.
 * Ideally, this is not needed and themes load the font-size classes on the
 * editor.
 *
 * @param {Function} BlockListBlock Original component.
 *
 * @return {Function} Wrapped component.
 */
const withFontSizeInlineStyles = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => {
		const fontSizes = useSetting( 'typography.fontSizes' );
		const {
			name: blockName,
			attributes: { fontSize, style },
			wrapperProps,
		} = props;

		// Only add inline styles if the block supports font sizes,
		// doesn't skip serialization of font sizes,
		// doesn't already have an inline font size,
		// and does have a class to extract the font size from.
		if (
			! hasBlockSupport( blockName, FONT_SIZE_SUPPORT_KEY ) ||
			shouldSkipSerialization(
				blockName,
				TYPOGRAPHY_SUPPORT_KEY,
				'fontSize'
			) ||
			! fontSize ||
			style?.typography?.fontSize
		) {
			return <BlockListBlock { ...props } />;
		}

		const fontSizeValue = getFontSize(
			fontSizes,
			fontSize,
			style?.typography?.fontSize
		).size;

		const newProps = {
			...props,
			wrapperProps: {
				...wrapperProps,
				style: {
					fontSize: fontSizeValue,
					...wrapperProps?.style,
				},
			},
		};

		return <BlockListBlock { ...newProps } />;
	},
	'withFontSizeInlineStyles'
);

const MIGRATION_PATHS = {
	fontSize: [ [ 'fontSize' ], [ 'style', 'typography', 'fontSize' ] ],
};

export function addTransforms( result, source, index, results ) {
	const destinationBlockType = result.name;
	const activeSupports = {
		fontSize: hasBlockSupport(
			destinationBlockType,
			FONT_SIZE_SUPPORT_KEY
		),
	};
	return transformStyles(
		activeSupports,
		MIGRATION_PATHS,
		result,
		source,
		index,
		results
	);
}

addFilter(
	'blocks.registerBlockType',
	'core/font/addAttribute',
	addAttributes
);

addFilter(
	'blocks.getSaveContent.extraProps',
	'core/font/addSaveProps',
	addSaveProps
);

addFilter( 'blocks.registerBlockType', 'core/font/addEditProps', addEditProps );

addFilter(
	'editor.BlockListBlock',
	'core/font-size/with-font-size-inline-styles',
	withFontSizeInlineStyles
);

addFilter(
	'blocks.switchToBlockType.transformedBlock',
	'core/font-size/addTransforms',
	addTransforms
);
