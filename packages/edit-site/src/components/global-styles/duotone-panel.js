/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	__experimentalToolsPanel as ToolsPanel,
	DuotonePicker,
} from '@wordpress/components';
import {
	privateApis as blockEditorPrivateApis,
	useSetting,
} from '@wordpress/block-editor';
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { unlock } from '../../private-apis';
const { useGlobalStyle } = unlock( blockEditorPrivateApis );

const EMPTY_ARRAY = [];

function useMultiOriginPresets( { presetSetting, defaultSetting } ) {
	const disableDefault = ! useSetting( defaultSetting );
	const userPresets =
		useSetting( `${ presetSetting }.custom` ) || EMPTY_ARRAY;
	const themePresets =
		useSetting( `${ presetSetting }.theme` ) || EMPTY_ARRAY;
	const defaultPresets =
		useSetting( `${ presetSetting }.default` ) || EMPTY_ARRAY;
	return useMemo(
		() => [
			...userPresets,
			...themePresets,
			...( disableDefault ? EMPTY_ARRAY : defaultPresets ),
		],
		[ disableDefault, userPresets, themePresets, defaultPresets ]
	);
}

function DuotonePanel( { name } ) {
	const [ themeDuotone, setThemeDuotone ] = useGlobalStyle(
		'filter.duotone',
		name
	);

	const duotonePalette = useMultiOriginPresets( {
		presetSetting: 'color.duotone',
		defaultSetting: 'color.defaultDuotone',
	} );
	const colorPalette = useMultiOriginPresets( {
		presetSetting: 'color.palette',
		defaultSetting: 'color.defaultPalette',
	} );

	if ( duotonePalette?.length === 0 ) {
		return null;
	}
	return (
		<>
			<ToolsPanel label={ __( 'Duotone' ) }>
				<span className="span-columns">
					{ __(
						'Create a two-tone color effect without losing your original image.'
					) }
				</span>
				<div className="span-columns">
					<DuotonePicker
						colorPalette={ colorPalette }
						duotonePalette={ duotonePalette }
						disableCustomColors={ true }
						disableCustomDuotone={ true }
						value={ themeDuotone }
						onChange={ setThemeDuotone }
					/>
				</div>
			</ToolsPanel>
		</>
	);
}

export default DuotonePanel;
