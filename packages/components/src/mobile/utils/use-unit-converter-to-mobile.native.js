/**
 * External dependencies
 */
import { Dimensions } from 'react-native';

/**
 * WordPress dependencies
 */
import {
	useContext,
	useEffect,
	useState,
	useMemo,
	useCallback,
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import GlobalStylesContext from '../global-styles-context';

const getValueAndUnit = ( value, unit ) => {
	const regex = /(\d+\.?\d*)(.*)/;

	const splitValue = `${ value }`
		?.match( regex )
		?.filter( ( v ) => v !== '' );

	if ( splitValue ) {
		return {
			valueToConvert: splitValue[ 1 ],
			valueUnit: unit || splitValue[ 2 ],
		};
	}
	return undefined;
};

const convertUnitToMobile = ( containerSize, globalStyles, value, unit ) => {
	const { width, height } = containerSize;
	const { valueToConvert, valueUnit } = getValueAndUnit( value, unit ) || {};
	const { fontSize = 16 } = globalStyles || {};

	switch ( valueUnit ) {
		case 'rem':
		case 'em':
			return valueToConvert * fontSize;
		case '%':
			return Number( valueToConvert / 100 ) * width;
		case 'px':
			return Number( valueToConvert );
		case 'vw':
			const vw = width / 100;
			return Math.round( valueToConvert * vw );
		case 'vh':
			const vh = height / 100;
			return Math.round( valueToConvert * vh );
		default:
			return Number( valueToConvert / 100 ) * width;
	}
};

const useConvertUnitToMobile = ( value, unit ) => {
	const { globalStyles: styles } = useContext( GlobalStylesContext );
	const [ windowSizes, setWindowSizes ] = useState(
		Dimensions.get( 'window' )
	);

	useEffect( () => {
		Dimensions.addEventListener( 'change', onDimensionsChange );

		return () => {
			Dimensions.removeEventListener( 'change', onDimensionsChange );
		};
	}, [] );

	const onDimensionsChange = useCallback( ( { window } ) => {
		setWindowSizes( window );
	}, [] );

	return useMemo( () => {
		const { valueToConvert, valueUnit } = getValueAndUnit( value, unit );

		return convertUnitToMobile(
			windowSizes,
			styles,
			valueToConvert,
			valueUnit
		);
	}, [ windowSizes, value, unit ] );
};

export { convertUnitToMobile, useConvertUnitToMobile, getValueAndUnit };
