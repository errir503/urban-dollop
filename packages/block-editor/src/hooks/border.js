/**
 * WordPress dependencies
 */
import { getBlockSupport } from '@wordpress/blocks';
import { __experimentalToolsPanelItem as ToolsPanelItem } from '@wordpress/components';
import { Platform } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	BorderColorEdit,
	hasBorderColorValue,
	resetBorderColor,
} from './border-color';
import {
	BorderRadiusEdit,
	hasBorderRadiusValue,
	resetBorderRadius,
} from './border-radius';
import {
	BorderStyleEdit,
	hasBorderStyleValue,
	resetBorderStyle,
} from './border-style';
import {
	BorderWidthEdit,
	hasBorderWidthValue,
	resetBorderWidth,
} from './border-width';
import InspectorControls from '../components/inspector-controls';
import useSetting from '../components/use-setting';
import { cleanEmptyObject } from './utils';

export const BORDER_SUPPORT_KEY = '__experimentalBorder';

export function BorderPanel( props ) {
	const { clientId } = props;

	const isColorSupported =
		useSetting( 'border.color' ) && hasBorderSupport( props.name, 'color' );

	const isRadiusSupported =
		useSetting( 'border.radius' ) &&
		hasBorderSupport( props.name, 'radius' );

	const isStyleSupported =
		useSetting( 'border.style' ) && hasBorderSupport( props.name, 'style' );

	const isWidthSupported =
		useSetting( 'border.width' ) && hasBorderSupport( props.name, 'width' );

	const isDisabled = [
		! isColorSupported,
		! isRadiusSupported,
		! isStyleSupported,
		! isWidthSupported,
	].every( Boolean );

	if ( isDisabled ) {
		return null;
	}

	const defaultBorderControls = getBlockSupport( props.name, [
		BORDER_SUPPORT_KEY,
		'__experimentalDefaultControls',
	] );

	const createResetAllFilter = (
		borderAttribute,
		topLevelAttributes = {}
	) => ( newAttributes ) => ( {
		...newAttributes,
		...topLevelAttributes,
		style: {
			...newAttributes.style,
			border: {
				...newAttributes.style?.border,
				[ borderAttribute ]: undefined,
			},
		},
	} );

	return (
		<InspectorControls __experimentalGroup="border">
			{ isWidthSupported && (
				<ToolsPanelItem
					className="single-column"
					hasValue={ () => hasBorderWidthValue( props ) }
					label={ __( 'Width' ) }
					onDeselect={ () => resetBorderWidth( props ) }
					isShownByDefault={ defaultBorderControls?.width }
					resetAllFilter={ createResetAllFilter( 'width' ) }
					panelId={ clientId }
				>
					<BorderWidthEdit { ...props } />
				</ToolsPanelItem>
			) }
			{ isStyleSupported && (
				<ToolsPanelItem
					className="single-column"
					hasValue={ () => hasBorderStyleValue( props ) }
					label={ __( 'Style' ) }
					onDeselect={ () => resetBorderStyle( props ) }
					isShownByDefault={ defaultBorderControls?.style }
					resetAllFilter={ createResetAllFilter( 'style' ) }
					panelId={ clientId }
				>
					<BorderStyleEdit { ...props } />
				</ToolsPanelItem>
			) }
			{ isColorSupported && (
				<ToolsPanelItem
					hasValue={ () => hasBorderColorValue( props ) }
					label={ __( 'Color' ) }
					onDeselect={ () => resetBorderColor( props ) }
					isShownByDefault={ defaultBorderControls?.color }
					resetAllFilter={ createResetAllFilter( 'color', {
						borderColor: undefined,
					} ) }
					panelId={ clientId }
				>
					<BorderColorEdit { ...props } />
				</ToolsPanelItem>
			) }
			{ isRadiusSupported && (
				<ToolsPanelItem
					hasValue={ () => hasBorderRadiusValue( props ) }
					label={ __( 'Radius' ) }
					onDeselect={ () => resetBorderRadius( props ) }
					isShownByDefault={ defaultBorderControls?.radius }
					resetAllFilter={ createResetAllFilter( 'radius' ) }
					panelId={ clientId }
				>
					<BorderRadiusEdit { ...props } />
				</ToolsPanelItem>
			) }
		</InspectorControls>
	);
}

/**
 * Determine whether there is block support for border properties.
 *
 * @param {string} blockName Block name.
 * @param {string} feature   Border feature to check support for.
 *
 * @return {boolean} Whether there is support.
 */
export function hasBorderSupport( blockName, feature = 'any' ) {
	if ( Platform.OS !== 'web' ) {
		return false;
	}

	const support = getBlockSupport( blockName, BORDER_SUPPORT_KEY );

	if ( support === true ) {
		return true;
	}

	if ( feature === 'any' ) {
		return !! (
			support?.color ||
			support?.radius ||
			support?.width ||
			support?.style
		);
	}

	return !! support?.[ feature ];
}

/**
 * Returns a new style object where the specified border attribute has been
 * removed.
 *
 * @param {Object} style     Styles from block attributes.
 * @param {string} attribute The border style attribute to clear.
 *
 * @return {Object} Style object with the specified attribute removed.
 */
export function removeBorderAttribute( style, attribute ) {
	return cleanEmptyObject( {
		...style,
		border: {
			...style?.border,
			[ attribute ]: undefined,
		},
	} );
}
