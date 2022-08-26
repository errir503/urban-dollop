// @ts-nocheck
/**
 * External dependencies
 */
import classnames from 'classnames';
import {
	useFloating,
	flip,
	shift,
	autoUpdate,
	arrow,
	offset as offsetMiddleware,
	limitShift,
	size,
} from '@floating-ui/react-dom';
// eslint-disable-next-line no-restricted-imports
import { motion, useReducedMotion } from 'framer-motion';

/**
 * WordPress dependencies
 */
import {
	useRef,
	useLayoutEffect,
	forwardRef,
	createContext,
	useContext,
	useMemo,
	useEffect,
} from '@wordpress/element';
import {
	useViewportMatch,
	useMergeRefs,
	__experimentalUseDialog as useDialog,
} from '@wordpress/compose';
import { close } from '@wordpress/icons';
import deprecated from '@wordpress/deprecated';
import { Path, SVG } from '@wordpress/primitives';

/**
 * Internal dependencies
 */
import Button from '../button';
import ScrollLock from '../scroll-lock';
import { Slot, Fill, useSlot } from '../slot-fill';
import {
	getFrameOffset,
	positionToPlacement,
	placementToMotionAnimationProps,
} from './utils';

/**
 * Name of slot in which popover should fill.
 *
 * @type {string}
 */
const SLOT_NAME = 'Popover';

// An SVG displaying a triangle facing down, filled with a solid
// color and bordered in such a way to create an arrow-like effect.
// Keeping the SVG's viewbox squared simplify the arrow positioning
// calculations.
const ArrowTriangle = ( props ) => (
	<SVG
		{ ...props }
		xmlns="http://www.w3.org/2000/svg"
		viewBox={ `0 0 100 100` }
		className="components-popover__triangle"
		role="presentation"
	>
		<Path
			className="components-popover__triangle-bg"
			d="M 0 0 L 50 50 L 100 0"
		/>
		<Path
			className="components-popover__triangle-border"
			d="M 0 0 L 50 50 L 100 0"
			vectorEffect="non-scaling-stroke"
		/>
	</SVG>
);

const MaybeAnimatedWrapper = forwardRef(
	(
		{
			style: receivedInlineStyles,
			placement,
			shouldAnimate = false,
			...props
		},
		forwardedRef
	) => {
		const shouldReduceMotion = useReducedMotion();

		const { style: motionInlineStyles, ...otherMotionProps } = useMemo(
			() => placementToMotionAnimationProps( placement ),
			[ placement ]
		);

		if ( shouldAnimate && ! shouldReduceMotion ) {
			return (
				<motion.div
					style={ {
						...motionInlineStyles,
						...receivedInlineStyles,
					} }
					{ ...otherMotionProps }
					{ ...props }
					ref={ forwardedRef }
				/>
			);
		}

		return (
			<div
				style={ receivedInlineStyles }
				{ ...props }
				ref={ forwardedRef }
			/>
		);
	}
);

const slotNameContext = createContext();

const Popover = (
	{
		range,
		animate = true,
		headerTitle,
		onClose,
		children,
		className,
		noArrow = true,
		isAlternate,
		position,
		placement: placementProp = 'bottom-start',
		offset: offsetProp = 0,
		focusOnMount = 'firstElement',
		anchorRef,
		anchorRect,
		getAnchorRect,
		expandOnMobile,
		onFocusOutside,
		__unstableSlotName = SLOT_NAME,
		__unstableObserveElement,
		__unstableForcePosition = false,
		__unstableShift = false,
		...contentProps
	},
	forwardedRef
) => {
	if ( range ) {
		deprecated( 'range prop in Popover component', {
			since: '6.1',
			version: '6.3',
		} );
	}

	const arrowRef = useRef( null );
	const anchorRefFallback = useRef( null );

	const isMobileViewport = useViewportMatch( 'medium', '<' );
	const isExpanded = expandOnMobile && isMobileViewport;
	const hasArrow = ! isExpanded && ! noArrow;
	const normalizedPlacementFromProps = position
		? positionToPlacement( position )
		: placementProp;

	const referenceOwnerDocument = useMemo( () => {
		let documentToReturn;

		if ( anchorRef?.top ) {
			documentToReturn = anchorRef?.top.ownerDocument;
		} else if ( anchorRef?.startContainer ) {
			documentToReturn = anchorRef.startContainer.ownerDocument;
		} else if ( anchorRef?.current ) {
			documentToReturn = anchorRef.current.ownerDocument;
		} else if ( anchorRef ) {
			// This one should be deprecated.
			documentToReturn = anchorRef.ownerDocument;
		} else if ( anchorRect && anchorRect?.ownerDocument ) {
			documentToReturn = anchorRect.ownerDocument;
		} else if ( getAnchorRect ) {
			documentToReturn = getAnchorRect(
				anchorRefFallback.current
			)?.ownerDocument;
		}

		return documentToReturn ?? document;
	}, [ anchorRef, anchorRect, getAnchorRect ] );

	/**
	 * Offsets the position of the popover when the anchor is inside an iframe.
	 *
	 * Store the offset in a ref, due to constraints with floating-ui:
	 * https://floating-ui.com/docs/react-dom#variables-inside-middleware-functions.
	 */
	const frameOffsetRef = useRef( getFrameOffset( referenceOwnerDocument ) );
	/**
	 * Store the offset prop in a ref, due to constraints with floating-ui:
	 * https://floating-ui.com/docs/react-dom#variables-inside-middleware-functions.
	 */
	const offsetRef = useRef( offsetProp );

	const middleware = [
		offsetMiddleware( ( { placement: currentPlacement } ) => {
			if ( ! frameOffsetRef.current ) {
				return offsetRef.current;
			}

			const isTopBottomPlacement =
				currentPlacement.includes( 'top' ) ||
				currentPlacement.includes( 'bottom' );

			// The main axis should represent the gap between the
			// floating element and the reference element. The cross
			// axis is always perpendicular to the main axis.
			const mainAxis = isTopBottomPlacement ? 'y' : 'x';
			const crossAxis = mainAxis === 'x' ? 'y' : 'x';

			// When the popover is before the reference, subtract the offset,
			// of the main axis else add it.
			const hasBeforePlacement =
				currentPlacement.includes( 'top' ) ||
				currentPlacement.includes( 'left' );
			const mainAxisModifier = hasBeforePlacement ? -1 : 1;

			return {
				mainAxis:
					offsetRef.current +
					frameOffsetRef.current[ mainAxis ] * mainAxisModifier,
				crossAxis: frameOffsetRef.current[ crossAxis ],
			};
		} ),
		__unstableForcePosition ? undefined : flip(),
		__unstableForcePosition
			? undefined
			: size( {
					apply( sizeProps ) {
						const { availableHeight } = sizeProps;
						if ( ! refs.floating.current ) return;
						// Reduce the height of the popover to the available space.
						Object.assign( refs.floating.current.firstChild.style, {
							maxHeight: `${ availableHeight }px`,
							overflow: 'auto',
						} );
					},
			  } ),
		__unstableShift
			? shift( {
					crossAxis: true,
					limiter: limitShift(),
					padding: 1, // Necessary to avoid flickering at the edge of the viewport.
			  } )
			: undefined,
		hasArrow ? arrow( { element: arrowRef } ) : undefined,
	].filter( ( m ) => !! m );
	const slotName = useContext( slotNameContext ) || __unstableSlotName;
	const slot = useSlot( slotName );

	let onDialogClose;

	if ( onClose || onFocusOutside ) {
		onDialogClose = ( type, event ) => {
			// Ideally the popover should have just a single onClose prop and
			// not three props that potentially do the same thing.
			if ( type === 'focus-outside' && onFocusOutside ) {
				onFocusOutside( event );
			} else if ( onClose ) {
				onClose();
			}
		};
	}

	const [ dialogRef, dialogProps ] = useDialog( {
		focusOnMount,
		__unstableOnClose: onDialogClose,
		onClose: onDialogClose,
	} );

	const {
		// Positioning coordinates
		x,
		y,
		// Callback refs (not regular refs). This allows the position to be updated.
		// when either elements change.
		reference,
		floating,
		// Object with "regular" refs to both "reference" and "floating"
		refs,
		// Type of CSS position property to use (absolute or fixed)
		strategy,
		update,
		placement: computedPlacement,
		middlewareData: { arrow: arrowData = {} },
	} = useFloating( { placement: normalizedPlacementFromProps, middleware } );

	useEffect( () => {
		offsetRef.current = offsetProp;
		update();
	}, [ offsetProp, update ] );

	// Update the `reference`'s ref.
	//
	// In floating-ui's terms:
	// - "reference" refers to the popover's anchor element.
	// - "floating" refers the floating popover's element.
	// A floating element can also be positioned relative to a virtual element,
	// instead of a real one. A virtual element is represented by an object
	// with the `getBoundingClientRect()` function (like real elements).
	// See https://floating-ui.com/docs/virtual-elements for more info.
	useLayoutEffect( () => {
		let resultingReferenceRef;

		if ( anchorRef?.top ) {
			// Create a virtual element for the ref. The expectation is that
			// if anchorRef.top is defined, then anchorRef.bottom is defined too.
			resultingReferenceRef = {
				getBoundingClientRect() {
					const topRect = anchorRef.top.getBoundingClientRect();
					const bottomRect = anchorRef.bottom.getBoundingClientRect();
					return new window.DOMRect(
						topRect.x,
						topRect.y,
						topRect.width,
						bottomRect.bottom - topRect.top
					);
				},
			};
		} else if ( anchorRef?.current ) {
			// Standard React ref.
			resultingReferenceRef = anchorRef.current;
		} else if ( anchorRef ) {
			// If `anchorRef` holds directly the element's value (no `current` key)
			// This is a weird scenario and should be deprecated.
			resultingReferenceRef = anchorRef;
		} else if ( anchorRect ) {
			// Create a virtual element for the ref.
			resultingReferenceRef = {
				getBoundingClientRect() {
					return anchorRect;
				},
			};
		} else if ( getAnchorRect ) {
			// Create a virtual element for the ref.
			resultingReferenceRef = {
				getBoundingClientRect() {
					const rect = getAnchorRect( anchorRefFallback.current );
					return new window.DOMRect(
						rect.x ?? rect.left,
						rect.y ?? rect.top,
						rect.width ?? rect.right - rect.left,
						rect.height ?? rect.bottom - rect.top
					);
				},
			};
		} else if ( anchorRefFallback.current ) {
			// If no explicit ref is passed via props, fall back to
			// anchoring to the popover's parent node.
			resultingReferenceRef = anchorRefFallback.current.parentNode;
		}

		if ( ! resultingReferenceRef ) {
			return;
		}

		reference( resultingReferenceRef );

		if ( ! refs.floating.current ) {
			return;
		}

		return autoUpdate(
			resultingReferenceRef,
			refs.floating.current,
			update
		);
		// 'reference' and 'refs.floating' are refs and don't need to be listed
		// as dependencies (see https://github.com/WordPress/gutenberg/pull/41612)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ anchorRef, anchorRect, getAnchorRect, update ] );

	// This is only needed for a smooth transition when moving blocks.
	useLayoutEffect( () => {
		if ( ! __unstableObserveElement ) {
			return;
		}
		const observer = new window.MutationObserver( update );
		observer.observe( __unstableObserveElement, { attributes: true } );

		return () => {
			observer.disconnect();
		};
	}, [ __unstableObserveElement, update ] );

	// If the reference element is in a different ownerDocument (e.g. iFrame),
	// we need to manually update the floating's position as the reference's owner
	// document scrolls. Also update the frame offset if the view resizes.
	useLayoutEffect( () => {
		if ( referenceOwnerDocument === document ) {
			frameOffsetRef.current = undefined;
			return;
		}

		const { defaultView } = referenceOwnerDocument;

		referenceOwnerDocument.addEventListener( 'scroll', update );

		let updateFrameOffset;
		const hasFrameElement =
			!! referenceOwnerDocument?.defaultView?.frameElement;
		if ( hasFrameElement ) {
			updateFrameOffset = () => {
				frameOffsetRef.current = getFrameOffset(
					referenceOwnerDocument
				);
				update();
			};
			updateFrameOffset();
			defaultView.addEventListener( 'resize', updateFrameOffset );
		}

		return () => {
			referenceOwnerDocument.removeEventListener( 'scroll', update );

			if ( updateFrameOffset ) {
				defaultView.removeEventListener( 'resize', updateFrameOffset );
			}
		};
	}, [ referenceOwnerDocument, update ] );

	const mergedFloatingRef = useMergeRefs( [
		floating,
		dialogRef,
		forwardedRef,
	] );

	// Disable reason: We care to capture the _bubbled_ events from inputs
	// within popover as inferring close intent.

	let content = (
		// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
		// eslint-disable-next-line jsx-a11y/no-static-element-interactions
		<MaybeAnimatedWrapper
			shouldAnimate={ animate && ! isExpanded }
			placement={ computedPlacement }
			className={ classnames( 'components-popover', className, {
				'is-expanded': isExpanded,
				'is-alternate': isAlternate,
			} ) }
			{ ...contentProps }
			ref={ mergedFloatingRef }
			{ ...dialogProps }
			tabIndex="-1"
			style={
				isExpanded
					? undefined
					: {
							position: strategy,
							left: Number.isNaN( x ) ? 0 : x,
							top: Number.isNaN( y ) ? 0 : y,
					  }
			}
		>
			{ /* Prevents scroll on the document */ }
			{ isExpanded && <ScrollLock /> }
			{ isExpanded && (
				<div className="components-popover__header">
					<span className="components-popover__header-title">
						{ headerTitle }
					</span>
					<Button
						className="components-popover__close"
						icon={ close }
						onClick={ onClose }
					/>
				</div>
			) }
			<div className="components-popover__content">{ children }</div>
			{ hasArrow && (
				<div
					ref={ arrowRef }
					className={ [
						'components-popover__arrow',
						`is-${ computedPlacement.split( '-' )[ 0 ] }`,
					].join( ' ' ) }
					style={ {
						left: Number.isFinite( arrowData?.x )
							? `${ arrowData.x }px`
							: '',
						top: Number.isFinite( arrowData?.y )
							? `${ arrowData.y }px`
							: '',
					} }
				>
					<ArrowTriangle />
				</div>
			) }
		</MaybeAnimatedWrapper>
	);

	if ( slot.ref ) {
		content = <Fill name={ slotName }>{ content }</Fill>;
	}

	if ( anchorRef || anchorRect ) {
		return content;
	}

	return <span ref={ anchorRefFallback }>{ content }</span>;
};

const PopoverContainer = forwardRef( Popover );

function PopoverSlot( { name = SLOT_NAME }, ref ) {
	return (
		<Slot
			bubblesVirtually
			name={ name }
			className="popover-slot"
			ref={ ref }
		/>
	);
}

PopoverContainer.Slot = forwardRef( PopoverSlot );
PopoverContainer.__unstableSlotNameProvider = slotNameContext.Provider;

export default PopoverContainer;
