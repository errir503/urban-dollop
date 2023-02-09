/**
 * WordPress dependencies
 */
import {
	__experimentalItemGroup as ItemGroup,
	FlexItem,
	__experimentalHStack as HStack,
	__experimentalZStack as ZStack,
	__experimentalVStack as VStack,
	ColorIndicator,
	Button,
} from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { shuffle } from '@wordpress/icons';
import { useMemo } from '@wordpress/element';
import { experiments as blockEditorExperiments } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import Subtitle from './subtitle';
import { NavigationButtonAsItem } from './navigation-button';
import { useColorRandomizer } from './hooks';
import ColorIndicatorWrapper from './color-indicator-wrapper';
import { unlock } from '../../experiments';

const { useGlobalSetting } = unlock( blockEditorExperiments );

const EMPTY_COLORS = [];

function Palette( { name } ) {
	const [ customColors ] = useGlobalSetting( 'color.palette.custom' );
	const [ themeColors ] = useGlobalSetting( 'color.palette.theme' );
	const [ defaultColors ] = useGlobalSetting( 'color.palette.default' );

	const [ defaultPaletteEnabled ] = useGlobalSetting(
		'color.defaultPalette',
		name
	);

	const [ randomizeThemeColors ] = useColorRandomizer();

	const colors = useMemo(
		() => [
			...( customColors || EMPTY_COLORS ),
			...( themeColors || EMPTY_COLORS ),
			...( defaultColors && defaultPaletteEnabled
				? defaultColors
				: EMPTY_COLORS ),
		],
		[ customColors, themeColors, defaultColors, defaultPaletteEnabled ]
	);

	const screenPath = ! name
		? '/colors/palette'
		: '/blocks/' + encodeURIComponent( name ) + '/colors/palette';
	const paletteButtonText =
		colors.length > 0
			? sprintf(
					// Translators: %d: Number of palette colors.
					_n( '%d color', '%d colors', colors.length ),
					colors.length
			  )
			: __( 'Add custom colors' );

	return (
		<VStack spacing={ 3 }>
			<Subtitle level={ 3 }>{ __( 'Palette' ) }</Subtitle>
			<ItemGroup isBordered isSeparated>
				<NavigationButtonAsItem
					path={ screenPath }
					aria-label={ __( 'Color palettes' ) }
				>
					<HStack
						direction={
							colors.length === 0 ? 'row-reverse' : 'row'
						}
					>
						<ZStack isLayered={ false } offset={ -8 }>
							{ colors
								.slice( 0, 5 )
								.map( ( { color }, index ) => (
									<ColorIndicatorWrapper
										key={ `${ color }-${ index }` }
									>
										<ColorIndicator colorValue={ color } />
									</ColorIndicatorWrapper>
								) ) }
						</ZStack>
						<FlexItem>{ paletteButtonText }</FlexItem>
					</HStack>
				</NavigationButtonAsItem>
			</ItemGroup>
			{ randomizeThemeColors && (
				<Button
					variant="secondary"
					icon={ shuffle }
					onClick={ randomizeThemeColors }
				>
					{ __( 'Randomize colors' ) }
				</Button>
			) }
		</VStack>
	);
}

export default Palette;
