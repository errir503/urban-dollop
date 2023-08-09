/**
 * External dependencies
 */
import type { ForwardedRef } from 'react';
// eslint-disable-next-line no-restricted-imports
import type { MotionProps } from 'framer-motion';
// eslint-disable-next-line no-restricted-imports
import { motion } from 'framer-motion';
import { css } from '@emotion/react';

/**
 * WordPress dependencies
 */
import { focus } from '@wordpress/dom';
import {
	useContext,
	useEffect,
	useMemo,
	useRef,
	useId,
} from '@wordpress/element';
import { useReducedMotion, useMergeRefs } from '@wordpress/compose';
import { isRTL } from '@wordpress/i18n';
import { escapeAttribute } from '@wordpress/escape-html';

/**
 * Internal dependencies
 */
import type { WordPressComponentProps } from '../../ui/context';
import { contextConnect, useContextSystem } from '../../ui/context';
import { useCx } from '../../utils/hooks/use-cx';
import { View } from '../../view';
import { NavigatorContext } from '../context';
import type { NavigatorScreenProps } from '../types';

const animationEnterDelay = 0;
const animationEnterDuration = 0.14;
const animationExitDuration = 0.14;
const animationExitDelay = 0;

// Props specific to `framer-motion` can't be currently passed to `NavigatorScreen`,
// as some of them would overlap with HTML props (e.g. `onAnimationStart`, ...)
type Props = Omit<
	WordPressComponentProps< NavigatorScreenProps, 'div', false >,
	Exclude< keyof MotionProps, 'style' | 'children' >
>;

function UnconnectedNavigatorScreen(
	props: Props,
	forwardedRef: ForwardedRef< any >
) {
	const screenId = useId();
	const { children, className, path, ...otherProps } = useContextSystem(
		props,
		'NavigatorScreen'
	);

	const prefersReducedMotion = useReducedMotion();
	const { location, match, addScreen, removeScreen } =
		useContext( NavigatorContext );
	const isMatch = match === screenId;
	const wrapperRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		const screen = {
			id: screenId,
			path: escapeAttribute( path ),
		};
		addScreen( screen );
		return () => removeScreen( screen );
	}, [ screenId, path, addScreen, removeScreen ] );

	const cx = useCx();
	const classes = useMemo(
		() =>
			cx(
				css( {
					// Ensures horizontal overflow is visually accessible.
					overflowX: 'auto',
					// In case the root has a height, it should not be exceeded.
					maxHeight: '100%',
				} ),
				className
			),
		[ className, cx ]
	);

	const locationRef = useRef( location );

	useEffect( () => {
		locationRef.current = location;
	}, [ location ] );

	// Focus restoration
	const isInitialLocation = location.isInitial && ! location.isBack;
	useEffect( () => {
		// Only attempt to restore focus:
		// - if the current location is not the initial one (to avoid moving focus on page load)
		// - when the screen becomes visible
		// - if the wrapper ref has been assigned
		// - if focus hasn't already been restored for the current location
		// - if the `skipFocus` option is not set to `true`. This is useful when we trigger the navigation outside of NavigatorScreen.
		if (
			isInitialLocation ||
			! isMatch ||
			! wrapperRef.current ||
			locationRef.current.hasRestoredFocus ||
			location.skipFocus
		) {
			return;
		}

		const activeElement = wrapperRef.current.ownerDocument.activeElement;

		// If an element is already focused within the wrapper do not focus the
		// element. This prevents inputs or buttons from losing focus unnecessarily.
		if ( wrapperRef.current.contains( activeElement ) ) {
			return;
		}

		let elementToFocus: HTMLElement | null = null;

		// When navigating back, if a selector is provided, use it to look for the
		// target element (assumed to be a node inside the current NavigatorScreen)
		if ( location.isBack && location?.focusTargetSelector ) {
			elementToFocus = wrapperRef.current.querySelector(
				location.focusTargetSelector
			);
		}

		// If the previous query didn't run or find any element to focus, fallback
		// to the first tabbable element in the screen (or the screen itself).
		if ( ! elementToFocus ) {
			const firstTabbable = (
				focus.tabbable.find( wrapperRef.current ) as HTMLElement[]
			 )[ 0 ];
			elementToFocus = firstTabbable ?? wrapperRef.current;
		}

		locationRef.current.hasRestoredFocus = true;
		elementToFocus.focus();
	}, [
		isInitialLocation,
		isMatch,
		location.isBack,
		location.focusTargetSelector,
		location.skipFocus,
	] );

	const mergedWrapperRef = useMergeRefs( [ forwardedRef, wrapperRef ] );

	if ( ! isMatch ) {
		return null;
	}

	if ( prefersReducedMotion ) {
		return (
			<View
				ref={ mergedWrapperRef }
				className={ classes }
				{ ...otherProps }
			>
				{ children }
			</View>
		);
	}

	const animate = {
		opacity: 1,
		transition: {
			delay: animationEnterDelay,
			duration: animationEnterDuration,
			ease: 'easeInOut',
		},
		x: 0,
	};
	// Disable the initial animation if the screen is the very first screen to be
	// rendered within the current `NavigatorProvider`.
	const initial =
		location.isInitial && ! location.isBack
			? false
			: {
					opacity: 0,
					x:
						( isRTL() && location.isBack ) ||
						( ! isRTL() && ! location.isBack )
							? 50
							: -50,
			  };
	const exit = {
		delay: animationExitDelay,
		opacity: 0,
		x:
			( ! isRTL() && location.isBack ) || ( isRTL() && ! location.isBack )
				? 50
				: -50,
		transition: {
			duration: animationExitDuration,
			ease: 'easeInOut',
		},
	};

	const animatedProps = {
		animate,
		exit,
		initial,
	};

	return (
		<motion.div
			ref={ mergedWrapperRef }
			className={ classes }
			{ ...otherProps }
			{ ...animatedProps }
		>
			{ children }
		</motion.div>
	);
}

/**
 * The `NavigatorScreen` component represents a single view/screen/panel and
 * should be used in combination with the `NavigatorProvider`, the
 * `NavigatorButton` and the `NavigatorBackButton` components (or the `useNavigator`
 * hook).
 *
 * @example
 * ```jsx
 * import {
 *   __experimentalNavigatorProvider as NavigatorProvider,
 *   __experimentalNavigatorScreen as NavigatorScreen,
 *   __experimentalNavigatorButton as NavigatorButton,
 *   __experimentalNavigatorBackButton as NavigatorBackButton,
 * } from '@wordpress/components';
 *
 * const MyNavigation = () => (
 *   <NavigatorProvider initialPath="/">
 *     <NavigatorScreen path="/">
 *       <p>This is the home screen.</p>
 *        <NavigatorButton path="/child">
 *          Navigate to child screen.
 *       </NavigatorButton>
 *     </NavigatorScreen>
 *
 *     <NavigatorScreen path="/child">
 *       <p>This is the child screen.</p>
 *       <NavigatorBackButton>
 *         Go back
 *       </NavigatorBackButton>
 *     </NavigatorScreen>
 *   </NavigatorProvider>
 * );
 * ```
 */
export const NavigatorScreen = contextConnect(
	UnconnectedNavigatorScreen,
	'NavigatorScreen'
);

export default NavigatorScreen;
