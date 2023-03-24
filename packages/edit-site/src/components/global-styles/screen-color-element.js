/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	__experimentalColorGradientControl as ColorGradientControl,
	privateApis as blockEditorPrivateApis,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import ScreenHeader from './header';
import { useSupportedStyles, useColorsPerOrigin } from './hooks';
import { unlock } from '../../private-apis';

const { useGlobalSetting, useGlobalStyle } = unlock( blockEditorPrivateApis );

const elements = {
	text: {
		description: __(
			'Set the default color used for text across the site.'
		),
		title: __( 'Text' ),
	},
	caption: {
		description: __(
			'Set the default color used for captions across the site.'
		),
		title: __( 'Captions' ),
	},
	button: {
		description: __(
			'Set the default color used for buttons across the site.'
		),
		title: __( 'Buttons' ),
	},
};

function ScreenColorElement( { name, element, variation = '' } ) {
	const prefix = variation ? `variations.${ variation }.` : '';
	const supports = useSupportedStyles( name );
	const colorsPerOrigin = useColorsPerOrigin( name );
	const [ isTextEnabled ] = useGlobalSetting( 'color.text', name );
	const [ areCustomSolidsEnabled ] = useGlobalSetting( 'color.custom', name );
	let [ isBackgroundEnabled ] = useGlobalSetting( 'color.background', name );

	let textColorElementSelector = 'elements.' + element + '.color.text';
	const backgroundColorElementSelector =
		'elements.' + element + '.color.background';

	let hasElementColor =
		supports.includes( 'buttonColor' ) &&
		( colorsPerOrigin.length > 0 || areCustomSolidsEnabled );

	if ( element === 'text' ) {
		isBackgroundEnabled = false;
		textColorElementSelector = 'color.text';
		hasElementColor =
			supports.includes( 'color' ) &&
			isTextEnabled &&
			( colorsPerOrigin.length > 0 || areCustomSolidsEnabled );
	} else if ( element === 'button' ) {
		hasElementColor =
			supports.includes( 'buttonColor' ) &&
			isBackgroundEnabled &&
			( colorsPerOrigin.length > 0 || areCustomSolidsEnabled );
	} else if ( element === 'caption' ) {
		isBackgroundEnabled = false;
	}

	const [ elementTextColor, setElementTextColor ] = useGlobalStyle(
		prefix + textColorElementSelector,
		name
	);
	const [ userElementTextColor ] = useGlobalStyle(
		textColorElementSelector,
		name,
		'user'
	);

	const [ elementBgColor, setElementBgColor ] = useGlobalStyle(
		backgroundColorElementSelector,
		name
	);
	const [ userElementBgColor ] = useGlobalStyle(
		backgroundColorElementSelector,
		name,
		'user'
	);

	if ( ! hasElementColor ) {
		return null;
	}

	return (
		<>
			<ScreenHeader
				title={ elements[ element ].title }
				description={ elements[ element ].description }
			/>

			<h3 className="edit-site-global-styles-section-title">
				{ __( 'Text color' ) }
			</h3>

			<ColorGradientControl
				className="edit-site-screen-element-color__control"
				colors={ colorsPerOrigin }
				disableCustomColors={ ! areCustomSolidsEnabled }
				showTitle={ false }
				enableAlpha
				__experimentalIsRenderedInSidebar
				colorValue={ elementTextColor }
				onColorChange={ setElementTextColor }
				clearable={ elementTextColor === userElementTextColor }
				headingLevel={ 4 }
			/>
			{ isBackgroundEnabled && (
				<>
					<h3 className="edit-site-global-styles-section-title">
						{ __( 'Background color' ) }
					</h3>

					<ColorGradientControl
						className="edit-site-screen-element-color__control"
						colors={ colorsPerOrigin }
						disableCustomColors={ ! areCustomSolidsEnabled }
						showTitle={ false }
						enableAlpha
						__experimentalIsRenderedInSidebar
						colorValue={ elementBgColor }
						onColorChange={ setElementBgColor }
						clearable={ elementBgColor === userElementBgColor }
						headingLevel={ 4 }
					/>
				</>
			) }
		</>
	);
}

export default ScreenColorElement;
