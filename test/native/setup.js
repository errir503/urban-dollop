/**
 * External dependencies
 */
import { NativeModules as RNNativeModules } from 'react-native';

RNNativeModules.UIManager = RNNativeModules.UIManager || {};
RNNativeModules.UIManager.RCTView = RNNativeModules.UIManager.RCTView || {};
RNNativeModules.RNGestureHandlerModule = RNNativeModules.RNGestureHandlerModule || {
	State: { BEGAN: 'BEGAN', FAILED: 'FAILED', ACTIVE: 'ACTIVE', END: 'END' },
	attachGestureHandler: jest.fn(),
	createGestureHandler: jest.fn(),
	dropGestureHandler: jest.fn(),
	updateGestureHandler: jest.fn(),
};
RNNativeModules.PlatformConstants = RNNativeModules.PlatformConstants || {
	forceTouchAvailable: false,
};

// Mock component to render with props rather than merely a string name so that
// we may assert against it. ...args is used avoid warnings about ignoring
// forwarded refs if React.forwardRef happens to be used.
const mockComponent = ( element ) => ( ...args ) => {
	const [ props ] = args;
	const React = require( 'react' );
	return React.createElement( element, props, props.children );
};

jest.mock( '@wordpress/element', () => {
	return {
		__esModule: true,
		...jest.requireActual( '@wordpress/element' ),
		render: jest.fn(),
	};
} );

jest.mock( '@wordpress/api-fetch', () => jest.fn() );

jest.mock( '@wordpress/react-native-bridge', () => {
	return {
		addEventListener: jest.fn(),
		mediaUploadSync: jest.fn(),
		removeEventListener: jest.fn(),
		requestFocalPointPickerTooltipShown: jest.fn( () => true ),
		subscribeParentToggleHTMLMode: jest.fn(),
		subscribeSetTitle: jest.fn(),
		subscribeSetFocusOnTitle: jest.fn(),
		subscribeUpdateHtml: jest.fn(),
		subscribeFeaturedImageIdNativeUpdated: jest.fn(),
		subscribeMediaAppend: jest.fn(),
		subscribeAndroidModalClosed: jest.fn(),
		subscribeUpdateEditorSettings: jest.fn(),
		subscribePreferredColorScheme: () => 'light',
		subscribeUpdateCapabilities: jest.fn(),
		subscribeShowNotice: jest.fn(),
		subscribeParentGetHtml: jest.fn(),
		subscribeShowEditorHelp: jest.fn(),
		editorDidMount: jest.fn(),
		editorDidAutosave: jest.fn(),
		subscribeMediaUpload: jest.fn(),
		subscribeMediaSave: jest.fn(),
		getOtherMediaOptions: jest.fn(),
		provideToNative_Html: jest.fn(),
		requestMediaEditor: jest.fn(),
		requestMediaPicker: jest.fn(),
		requestUnsupportedBlockFallback: jest.fn(),
		subscribeReplaceBlock: jest.fn(),
		mediaSources: {
			deviceLibrary: 'DEVICE_MEDIA_LIBRARY',
			deviceCamera: 'DEVICE_CAMERA',
			siteMediaLibrary: 'SITE_MEDIA_LIBRARY',
		},
		fetchRequest: jest.fn(),
	};
} );

jest.mock( 'react-native-dark-mode', () => {
	return {
		initialMode: 'light',
		eventEmitter: {
			on: jest.fn(),
		},
		useDarkModeContext: () => 'light',
	};
} );

jest.mock( 'react-native-modal', () => ( props ) =>
	props.isVisible ? mockComponent( 'Modal' )( props ) : null
);

jest.mock( 'react-native-hr', () => () => 'Hr' );

jest.mock( 'react-native-svg', () => {
	return {
		Svg: () => 'Svg',
		Path: () => 'Path',
		Circle: () => 'Circle',
		G: () => 'G',
		Polygon: () => 'Polygon',
		Rect: () => 'Rect',
	};
} );

jest.mock( 'react-native-safe-area', () => {
	const addEventListener = jest.fn();
	addEventListener.mockReturnValue( { remove: () => {} } );
	return {
		getSafeAreaInsetsForRootView: () => {
			return new Promise( ( accept ) => {
				accept( { safeAreaInsets: { bottom: 34 } } );
			} );
		},
		addEventListener,
		removeEventListener: jest.fn(),
	};
} );

jest.mock(
	'@react-native-community/slider',
	() => {
		const { forwardRef } = require( 'react' );
		return forwardRef( mockComponent( 'Slider' ) );
	},
	{ virtual: true }
);

if ( ! global.window.matchMedia ) {
	global.window.matchMedia = () => ( {
		matches: false,
		addListener: () => {},
		removeListener: () => {},
	} );
}

jest.mock( 'react-native-linear-gradient', () => () => 'LinearGradient', {
	virtual: true,
} );

jest.mock( 'react-native-hsv-color-picker', () => () => 'HsvColorPicker', {
	virtual: true,
} );

jest.mock( '@react-native-community/blur', () => () => 'BlurView', {
	virtual: true,
} );

jest.mock( 'react-native-reanimated', () => {
	const Reanimated = require( 'react-native-reanimated/mock' );

	// The mock for `call` immediately calls the callback which is incorrect
	// So we override it with a no-op
	Reanimated.default.call = () => {};

	return Reanimated;
} );

// Silence the warning: Animated: `useNativeDriver` is not supported because the
// native animated module is missing. This was added per React Navigation docs.
// https://reactnavigation.org/docs/testing/#mocking-native-modules
jest.mock( 'react-native/Libraries/Animated/NativeAnimatedHelper' );

// We currently reference TextStateInput (a private module) within
// react-native-aztec/src/AztecView. Doing so requires that we mock it via its
// internal path to avoid "TypeError: Cannot read property 'Commands' of
// undefined." The private module referenced could possibly be replaced with
// a React ref instead. We could then remove this internal mock.
jest.mock( 'react-native/Libraries/Components/TextInput/TextInputState' );

// Mock native modules incompatible with testing environment
jest.mock( 'react-native/Libraries/LayoutAnimation/LayoutAnimation' );
jest.mock(
	'react-native/Libraries/Components/AccessibilityInfo/AccessibilityInfo',
	() => ( {
		addEventListener: jest.fn(),
		announceForAccessibility: jest.fn(),
		removeEventListener: jest.fn(),
		isScreenReaderEnabled: jest.fn( () => Promise.resolve( false ) ),
		fetch: jest.fn( () => ( {
			done: jest.fn(),
		} ) ),
	} )
);

// Silences the warning: dispatchCommand was called with a ref that isn't a native
// component. Use React.forwardRef to get access to the underlying native component.
// This is a known bug of react-native-testing-library package:
// https://github.com/callstack/react-native-testing-library/issues/329#issuecomment-737307473
jest.mock( 'react-native/Libraries/Components/Switch/Switch', () => {
	const jestMockComponent = require( 'react-native/jest/mockComponent' );
	return jestMockComponent(
		'react-native/Libraries/Components/Switch/Switch'
	);
} );
