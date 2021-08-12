/**
 * External dependencies
 */
import { pick } from 'lodash';

/**
 * WordPress dependencies
 */
import { createContext, useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	BLOCK_STYLE_ATTRIBUTES,
	getBlockPaddings,
	getBlockColors,
} from './utils';

const GlobalStylesContext = createContext( { style: {} } );

GlobalStylesContext.BLOCK_STYLE_ATTRIBUTES = BLOCK_STYLE_ATTRIBUTES;

export const getMergedGlobalStyles = (
	baseGlobalStyles,
	globalStyle,
	wrapperPropsStyle,
	blockAttributes,
	defaultColors,
	blockName
) => {
	const baseGlobalColors = {
		baseColors: baseGlobalStyles || {},
	};
	const blockStyleAttributes = pick(
		blockAttributes,
		BLOCK_STYLE_ATTRIBUTES
	);
	const mergedStyle = {
		...baseGlobalColors,
		...globalStyle,
		...wrapperPropsStyle,
	};
	const blockColors = getBlockColors(
		blockStyleAttributes,
		defaultColors,
		blockName,
		baseGlobalStyles
	);
	const blockPaddings = getBlockPaddings(
		mergedStyle,
		wrapperPropsStyle,
		blockStyleAttributes,
		blockColors
	);

	return { ...mergedStyle, ...blockPaddings, ...blockColors };
};

export const useGlobalStyles = () => {
	const globalStyles = useContext( GlobalStylesContext );

	return globalStyles;
};

export const withGlobalStyles = ( WrappedComponent ) => ( props ) => (
	<GlobalStylesContext.Consumer>
		{ ( globalStyles ) => (
			<WrappedComponent { ...props } globalStyles={ globalStyles } />
		) }
	</GlobalStylesContext.Consumer>
);

export default GlobalStylesContext;
