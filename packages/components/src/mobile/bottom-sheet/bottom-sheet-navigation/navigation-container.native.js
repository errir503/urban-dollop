/**
 * External dependencies
 */
import { View, Easing } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

/**
 * WordPress dependencies
 */
import {
	useState,
	useContext,
	useMemo,
	useCallback,
	Children,
	useRef,
	cloneElement,
	Platform,
} from '@wordpress/element';

import { usePreferredColorSchemeStyle } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { performLayoutAnimation } from '../../layout-animation';
import {
	BottomSheetNavigationContext,
	BottomSheetNavigationProvider,
} from './bottom-sheet-navigation-context';

import styles from './styles.scss';

const AnimationSpec = {
	animation: 'timing',
	config: {
		duration: 200,
		easing: Easing.ease,
	},
};

const fadeConfig = ( { current } ) => {
	return {
		cardStyle: {
			opacity: current.progress,
		},
	};
};

const options = {
	transitionSpec: {
		open: AnimationSpec,
		close: AnimationSpec,
	},
	headerShown: false,
	gestureEnabled: false,
	cardStyleInterpolator: fadeConfig,
};

const ANIMATION_DURATION = 190;

function BottomSheetNavigationContainer( {
	children,
	animate,
	main,
	theme,
	style,
} ) {
	const Stack = useRef( createStackNavigator() ).current;
	const context = useContext( BottomSheetNavigationContext );
	const [ currentHeight, setCurrentHeight ] = useState(
		context.currentHeight || 1
	);

	const backgroundStyle = usePreferredColorSchemeStyle(
		styles.background,
		styles.backgroundDark
	);

	const _theme = theme || {
		...DefaultTheme,
		colors: {
			...DefaultTheme.colors,
			background: backgroundStyle.backgroundColor,
		},
	};

	const setHeight = useCallback(
		( height ) => {
			// The screen is fullHeight or changing from fullScreen to the default mode
			if (
				( typeof currentHeight === 'string' &&
					typeof height !== 'string' ) ||
				typeof height === 'string'
			) {
				// Animating the opacity for the initial modal results in the backdrop
				// provided by react-native-modal to never transition from transparent
				// to partially opaque black. The core issue was not idenfited, but it
				// may relate to the experimental state of LayoutAnimation for Android.
				// https://reactnative.dev/docs/layoutanimation
				if ( ! Platform.isAndroid || currentHeight !== 1 ) {
					performLayoutAnimation( ANIMATION_DURATION );
				}
				setCurrentHeight( height );

				return;
			}

			if ( height > 1 ) {
				if ( currentHeight === 1 ) {
					setCurrentHeight( height );
				} else if ( animate ) {
					performLayoutAnimation( ANIMATION_DURATION );
					setCurrentHeight( height );
				} else {
					setCurrentHeight( height );
				}
			}
		},
		[ currentHeight ]
	);

	const screens = useMemo( () => {
		return Children.map( children, ( child ) => {
			let screen = child;
			const { name, ...otherProps } = child.props;
			if ( ! main ) {
				screen = cloneElement( child, {
					...child.props,
					isNested: true,
				} );
			}
			return (
				<Stack.Screen
					name={ name }
					{ ...otherProps }
					children={ () => screen }
				/>
			);
		} );
	}, [ children ] );

	return useMemo( () => {
		return (
			<View style={ [ style, { height: currentHeight } ] }>
				<BottomSheetNavigationProvider
					value={ {
						setHeight,
						currentHeight,
					} }
				>
					{ main ? (
						<NavigationContainer theme={ _theme }>
							<Stack.Navigator screenOptions={ options }>
								{ screens }
							</Stack.Navigator>
						</NavigationContainer>
					) : (
						<Stack.Navigator screenOptions={ options }>
							{ screens }
						</Stack.Navigator>
					) }
				</BottomSheetNavigationProvider>
			</View>
		);
	}, [ currentHeight, _theme ] );
}

export default BottomSheetNavigationContainer;
