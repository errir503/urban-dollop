/**
 * External dependencies
 */
import colorize, { ColorFormats } from 'tinycolor2';

/**
 * WordPress dependencies
 */
import { useCopyToClipboard } from '@wordpress/compose';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { Text } from '../../text';
import { Flex, FlexItem } from '../../flex';
import { Tooltip } from '../tooltip';
import type { ColorType } from './types';
import { space } from '../utils/space';

interface ColorDisplayProps {
	color: ColorFormats.HSLA;
	colorType: ColorType;
	enableAlpha: boolean;
}

interface DisplayProps {
	color: ColorFormats.HSLA;
	enableAlpha: boolean;
}

type Values = [ number, string ][];

interface ValueDisplayProps {
	values: Values;
}

const ValueDisplay = ( { values }: ValueDisplayProps ) => (
	<>
		{ values.map( ( [ value, abbreviation ] ) => {
			return (
				<FlexItem key={ abbreviation } isBlock display="flex">
					<Text color="blue">{ abbreviation }</Text>
					<Text>{ value }</Text>
				</FlexItem>
			);
		} ) }
	</>
);

const HslDisplay = ( { color, enableAlpha }: DisplayProps ) => {
	const { h, s, l, a } = colorize( color ).toHsl();

	const values: Values = [
		[ Math.floor( h ), 'H' ],
		[ Math.round( s * 100 ), 'S' ],
		[ Math.round( l * 100 ), 'L' ],
	];
	if ( enableAlpha ) {
		values.push( [ Math.round( a * 100 ), 'A' ] );
	}

	return <ValueDisplay values={ values } />;
};

const RgbDisplay = ( { color, enableAlpha }: DisplayProps ) => {
	const { r, g, b, a } = colorize( color ).toRgb();

	const values: Values = [
		[ r, 'R' ],
		[ g, 'G' ],
		[ b, 'B' ],
	];

	if ( enableAlpha ) {
		values.push( [ Math.round( a * 100 ), 'A' ] );
	}

	return <ValueDisplay values={ values } />;
};

const HexDisplay = ( { color, enableAlpha }: DisplayProps ) => {
	const colorized = colorize( color );
	const colorWithoutHash = ( enableAlpha
		? colorized.toHex8String()
		: colorized.toHexString()
	)
		.slice( 1 )
		.toUpperCase();
	return (
		<FlexItem>
			<Text color="blue">#</Text>
			<Text>{ colorWithoutHash }</Text>
		</FlexItem>
	);
};

const getComponent = ( colorType: ColorType ) => {
	switch ( colorType ) {
		case 'hsl':
			return HslDisplay;
		case 'rgb':
			return RgbDisplay;
		default:
		case 'hex':
			return HexDisplay;
	}
};

export const ColorDisplay = ( {
	color,
	colorType,
	enableAlpha,
}: ColorDisplayProps ) => {
	const [ copiedColor, setCopiedColor ] = useState< string | null >( null );
	const props = { color, enableAlpha };
	const Component = getComponent( colorType );
	const copyRef = useCopyToClipboard< HTMLDivElement >(
		() => {
			switch ( colorType ) {
				case 'hsl': {
					return colorize( color ).toHslString();
				}
				case 'rgb': {
					return colorize( color ).toRgbString();
				}
				default:
				case 'hex': {
					const colorized = colorize( color );
					return enableAlpha
						? colorized.toHex8String()
						: colorized.toHexString();
				}
			}
		},
		() => setCopiedColor( colorize( color ).toHex8String() )
	);
	return (
		<Tooltip
			content={
				<Text color="white">
					{ copiedColor === colorize( color ).toHex8String()
						? __( 'Copied!' )
						: __( 'Copy' ) }
				</Text>
			}
		>
			<Flex justify="flex-start" gap={ space( 1 ) } ref={ copyRef }>
				<Component { ...props } />
			</Flex>
		</Tooltip>
	);
};
