/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { addFilter } from '@wordpress/hooks';
import { hasBlockSupport } from '@wordpress/blocks';

/**
 * Filters registered block settings, extending attributes with anchor using ID
 * of the first node.
 *
 * @param {Object} settings Original block settings.
 *
 * @return {Object} Filtered block settings.
 */
export function addAttribute( settings ) {
	if ( hasBlockSupport( settings, 'customClassName', true ) ) {
		// Gracefully handle if settings.attributes is undefined.
		settings.attributes = {
			...settings.attributes,
			className: {
				type: 'string',
			},
		};
	}

	return settings;
}

/**
 * Override props assigned to save component to inject anchor ID, if block
 * supports anchor. This is only applied if the block's save result is an
 * element and not a markup string.
 *
 * @param {Object} extraProps Additional props applied to save element.
 * @param {Object} blockType  Block type.
 * @param {Object} attributes Current block attributes.
 *
 * @return {Object} Filtered props applied to save element.
 */
export function addSaveProps( extraProps, blockType, attributes ) {
	if (
		hasBlockSupport( blockType, 'customClassName', true ) &&
		attributes.className
	) {
		extraProps.className = classnames(
			extraProps.className,
			attributes.className
		);
	}

	return extraProps;
}

addFilter(
	'blocks.registerBlockType',
	'core/custom-class-name/attribute',
	addAttribute
);
addFilter(
	'blocks.getSaveContent.extraProps',
	'core/custom-class-name/save-props',
	addSaveProps
);
