/**
 * External dependencies
 */
import { View, Text, TouchableWithoutFeedback } from 'react-native';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState, useContext } from '@wordpress/element';
import { usePreferredColorSchemeStyle } from '@wordpress/compose';
import {
	ColorControl,
	PanelBody,
	BottomSheetContext,
} from '@wordpress/components';
import { useRoute, useNavigation } from '@react-navigation/native';
/**
 * Internal dependencies
 */
import ColorPalette from '../../color-palette';
import ColorIndicator from '../../color-indicator';
import NavBar from '../bottom-sheet/nav-bar';
import SegmentedControls from '../segmented-control';
import { colorsUtils } from './utils';

import styles from './style.scss';

const HIT_SLOP = { top: 22, bottom: 22, left: 22, right: 22 };

const PaletteScreen = () => {
	const route = useRoute();
	const navigation = useNavigation();
	const { shouldEnableBottomSheetScroll } = useContext( BottomSheetContext );
	const {
		label,
		onColorChange,
		onGradientChange,
		colorValue,
		defaultSettings,
	} = route.params || {};
	const { segments, isGradient } = colorsUtils;
	const [ currentValue, setCurrentValue ] = useState( colorValue );
	const isGradientColor = isGradient( currentValue );
	const selectedSegmentIndex = isGradientColor ? 1 : 0;

	const [ currentSegment, setCurrentSegment ] = useState(
		segments[ selectedSegmentIndex ]
	);

	const horizontalSeparatorStyle = usePreferredColorSchemeStyle(
		styles.horizontalSeparator,
		styles.horizontalSeparatorDark
	);
	const clearButtonStyle = usePreferredColorSchemeStyle(
		styles.clearButton,
		styles.clearButtonDark
	);
	const selectedColorTextStyle = usePreferredColorSchemeStyle(
		styles.colorText,
		styles.colorTextDark
	);

	const isSolidSegment = currentSegment === segments[ 0 ];
	const isCustomGadientShown = ! isSolidSegment && isGradientColor;

	const setColor = ( color ) => {
		setCurrentValue( color );
		if ( isSolidSegment && onColorChange && onGradientChange ) {
			onColorChange( color );
			onGradientChange( '' );
		} else if ( isSolidSegment && onColorChange ) {
			onColorChange( color );
		} else if ( ! isSolidSegment && onGradientChange ) {
			onGradientChange( color );
			onColorChange( '' );
		}
	};

	function onClear() {
		setCurrentValue( undefined );
		if ( isSolidSegment ) {
			onColorChange( '' );
		} else {
			onGradientChange( '' );
		}
	}

	function onCustomPress() {
		if ( isSolidSegment ) {
			navigation.navigate( colorsUtils.screens.picker, {
				currentValue,
				setColor,
			} );
		} else {
			navigation.navigate( colorsUtils.screens.gradientPicker, {
				setColor,
				isGradientColor,
				currentValue,
			} );
		}
	}

	function getClearButton() {
		return (
			<TouchableWithoutFeedback onPress={ onClear } hitSlop={ HIT_SLOP }>
				<View style={ styles.clearButtonContainer }>
					<Text style={ clearButtonStyle }>{ __( 'Reset' ) }</Text>
				</View>
			</TouchableWithoutFeedback>
		);
	}

	function getFooter() {
		if ( onGradientChange ) {
			return (
				<SegmentedControls
					segments={ segments }
					segmentHandler={ setCurrentSegment }
					selectedIndex={ segments.indexOf( currentSegment ) }
					addonLeft={
						currentValue && (
							<ColorIndicator
								color={ currentValue }
								style={ styles.colorIndicator }
							/>
						)
					}
					addonRight={ currentValue && getClearButton() }
				/>
			);
		}
		return (
			<View style={ styles.footer }>
				<View style={ styles.flex }>
					{ currentValue && (
						<ColorIndicator
							color={ currentValue }
							style={ styles.colorIndicator }
						/>
					) }
				</View>
				{ currentValue ? (
					<Text
						style={ selectedColorTextStyle }
						maxFontSizeMultiplier={ 2 }
						selectable
					>
						{ currentValue.toUpperCase() }
					</Text>
				) : (
					<Text
						style={ styles.selectColorText }
						maxFontSizeMultiplier={ 2 }
					>
						{ __( 'Select a color above' ) }
					</Text>
				) }
				<View style={ styles.flex }>
					{ currentValue && getClearButton() }
				</View>
			</View>
		);
	}
	return (
		<View>
			<NavBar>
				<NavBar.BackButton onPress={ navigation.goBack } />
				<NavBar.Heading>{ label } </NavBar.Heading>
			</NavBar>
			<ColorPalette
				setColor={ setColor }
				activeColor={ currentValue }
				isGradientColor={ isGradientColor }
				currentSegment={ currentSegment }
				onCustomPress={ onCustomPress }
				shouldEnableBottomSheetScroll={ shouldEnableBottomSheetScroll }
				defaultSettings={ defaultSettings }
			/>
			{ isCustomGadientShown && (
				<>
					<View style={ horizontalSeparatorStyle } />
					<PanelBody>
						<ColorControl
							label={ __( 'Customize Gradient' ) }
							onPress={ onCustomPress }
							withColorIndicator={ false }
						/>
					</PanelBody>
				</>
			) }
			<View style={ horizontalSeparatorStyle } />
			{ getFooter() }
		</View>
	);
};

export default PaletteScreen;
