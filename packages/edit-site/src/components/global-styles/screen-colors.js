/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useGlobalStylesContext } from '../editor/global-styles-provider';
import ColorPanel from './color-panel';
import ScreenHeader from './header';

function ScreenColors( { name } ) {
	const { root, blocks, getStyle, setStyle } = useGlobalStylesContext();
	const context = name === undefined ? root : blocks[ name ];
	const parentMenu = name === undefined ? '' : '/blocks/' + name;

	return (
		<>
			<ScreenHeader
				back={ parentMenu ? parentMenu : '/' }
				title={ __( 'Colors' ) }
				description={ __(
					'Manage color palettes and how they affect the different elements of the site.'
				) }
			/>
			<ColorPanel
				context={ context }
				getStyle={ getStyle }
				setStyle={ setStyle }
			/>
		</>
	);
}

export default ScreenColors;
