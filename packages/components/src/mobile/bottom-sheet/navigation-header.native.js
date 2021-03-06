/**
 * External dependencies
 */
import { View, TouchableWithoutFeedback, Text, Platform } from 'react-native';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { check, Icon, arrowLeft, close } from '@wordpress/icons';
import { usePreferredColorSchemeStyle } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import styles from './styles.scss';
import chevronBack from './chevron-back';

function BottomSheetNavigationHeader( {
	leftButtonText,
	leftButtonOnPress,
	screen,
	applyButtonOnPress,
	isFullscreen,
} ) {
	const isIOS = Platform.OS === 'ios';

	const bottomSheetHeaderTitleStyle = usePreferredColorSchemeStyle(
		styles.bottomSheetHeaderTitle,
		styles.bottomSheetHeaderTitleDark
	);
	const bottomSheetButtonTextStyle = usePreferredColorSchemeStyle(
		styles.bottomSheetButtonText,
		styles.bottomSheetButtonTextDark
	);
	const chevronLeftStyle = usePreferredColorSchemeStyle(
		styles.chevronLeftIcon,
		styles.chevronLeftIconDark
	);
	const arrowLeftStyle = usePreferredColorSchemeStyle(
		styles.arrowLeftIcon,
		styles.arrowLeftIconDark
	);
	const applyButtonStyle = usePreferredColorSchemeStyle(
		styles.applyButton,
		styles.applyButtonDark
	);

	const renderBackButton = () => {
		let backIcon;
		let backText;

		if ( isIOS ) {
			backIcon = isFullscreen ? undefined : (
				<Icon
					icon={ chevronBack }
					size={ 21 }
					style={ chevronLeftStyle }
				/>
			);
			if ( leftButtonText ) {
				backText = leftButtonText;
			} else if ( isFullscreen ) {
				backText = __( 'Cancel' );
			} else {
				backText = __( 'Back' );
			}
		} else {
			backIcon = (
				<Icon
					icon={ isFullscreen ? close : arrowLeft }
					size={ 24 }
					style={ arrowLeftStyle }
				/>
			);
		}

		return (
			<TouchableWithoutFeedback
				onPress={ leftButtonOnPress }
				accessibilityRole={ 'button' }
				accessibilityLabel={ __( 'Go back' ) }
				accessibilityHint={ __(
					'Navigates to the previous content sheet'
				) }
			>
				<View style={ styles.bottomSheetActionButton }>
					<>
						{ backIcon }
						{ backText && (
							<Text
								style={ bottomSheetButtonTextStyle }
								maxFontSizeMultiplier={ 2 }
							>
								{ backText }
							</Text>
						) }
					</>
				</View>
			</TouchableWithoutFeedback>
		);
	};

	return (
		<View style={ styles.bottomSheetHeader }>
			<View style={ styles.bottomSheetHeaderLeft }>
				{ renderBackButton() }
			</View>
			<Text
				accessibilityRole="header"
				style={ bottomSheetHeaderTitleStyle }
				maxFontSizeMultiplier={ 3 }
			>
				{ screen }
			</Text>
			<View style={ styles.bottomSheetHeaderRight }>
				{ !! applyButtonOnPress && (
					<TouchableWithoutFeedback
						onPress={ applyButtonOnPress }
						accessibilityRole={ 'button' }
						accessibilityLabel={ __( 'Apply' ) }
						accessibilityHint={ __( 'Applies the setting' ) }
					>
						<View style={ styles.bottomSheetActionButton }>
							{ isIOS ? (
								<Text
									style={ bottomSheetButtonTextStyle }
									maxFontSizeMultiplier={ 2 }
								>
									{ __( 'Apply' ) }
								</Text>
							) : (
								<Icon
									icon={ check }
									size={ 24 }
									style={ applyButtonStyle }
								/>
							) }
						</View>
					</TouchableWithoutFeedback>
				) }
			</View>
		</View>
	);
}

export default BottomSheetNavigationHeader;
