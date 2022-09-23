/**
 * External dependencies
 */
// eslint-disable-next-line no-restricted-imports
import type { MotionProps } from 'framer-motion';
import type { ReferenceType } from '@floating-ui/react-dom';

/**
 * Internal dependencies
 */
import type {
	PopoverProps,
	PopoverAnchorRefReference,
	PopoverAnchorRefTopBottom,
} from './types';

/**
 * Converts the `Popover`'s legacy "position" prop to the new "placement" prop
 * (used by `floating-ui`).
 *
 * @param  position The legacy position
 * @return The corresponding placement
 */
export const positionToPlacement = (
	position: NonNullable< PopoverProps[ 'position' ] >
): NonNullable< PopoverProps[ 'placement' ] > => {
	const [ x, y, z ] = position.split( ' ' );

	if ( [ 'top', 'bottom' ].includes( x ) ) {
		let suffix = '';
		if ( ( !! z && z === 'left' ) || y === 'right' ) {
			suffix = '-start';
		} else if ( ( !! z && z === 'right' ) || y === 'left' ) {
			suffix = '-end';
		}

		return ( x + suffix ) as NonNullable< PopoverProps[ 'placement' ] >;
	}

	return y as NonNullable< PopoverProps[ 'placement' ] >;
};

/**
 * @typedef AnimationOrigin
 * @type {Object}
 * @property {number} originX A number between 0 and 1 (in CSS logical properties jargon, 0 is "start", 0.5 is "center", and 1 is "end")
 * @property {number} originY A number between 0 and 1 (0 is top, 0.5 is center, and 1 is bottom)
 */

const PLACEMENT_TO_ANIMATION_ORIGIN: Record<
	NonNullable< PopoverProps[ 'placement' ] >,
	{ originX: number; originY: number }
> = {
	top: { originX: 0.5, originY: 1 }, // open from bottom, center
	'top-start': { originX: 0, originY: 1 }, // open from bottom, left
	'top-end': { originX: 1, originY: 1 }, // open from bottom, right
	right: { originX: 0, originY: 0.5 }, // open from middle, left
	'right-start': { originX: 0, originY: 0 }, // open from top, left
	'right-end': { originX: 0, originY: 1 }, // open from bottom, left
	bottom: { originX: 0.5, originY: 0 }, // open from top, center
	'bottom-start': { originX: 0, originY: 0 }, // open from top, left
	'bottom-end': { originX: 1, originY: 0 }, // open from top, right
	left: { originX: 1, originY: 0.5 }, // open from middle, right
	'left-start': { originX: 1, originY: 0 }, // open from top, right
	'left-end': { originX: 1, originY: 1 }, // open from bottom, right
};

/**
 * Given the floating-ui `placement`, compute the framer-motion props for the
 * popover's entry animation.
 *
 * @param  placement A placement string from floating ui
 * @return The object containing the motion props
 */
export const placementToMotionAnimationProps = (
	placement: NonNullable< PopoverProps[ 'placement' ] >
): MotionProps => {
	const translateProp =
		placement.startsWith( 'top' ) || placement.startsWith( 'bottom' )
			? 'translateY'
			: 'translateX';
	const translateDirection =
		placement.startsWith( 'top' ) || placement.startsWith( 'left' )
			? 1
			: -1;

	return {
		style: PLACEMENT_TO_ANIMATION_ORIGIN[ placement ],
		initial: {
			opacity: 0,
			scale: 0,
			[ translateProp ]: `${ 2 * translateDirection }em`,
		},
		animate: { opacity: 1, scale: 1, [ translateProp ]: 0 },
		transition: { duration: 0.1, ease: [ 0, 0, 0.2, 1 ] },
	};
};

/**
 * Returns the offset of a document's frame element.
 *
 * @param  document The iframe's owner document.
 *
 * @return The offset of the document's frame element, or undefined if the
 * document has no frame element.
 */
export const getFrameOffset = (
	document?: Document
): { x: number; y: number } | undefined => {
	const frameElement = document?.defaultView?.frameElement;
	if ( ! frameElement ) {
		return;
	}
	const iframeRect = frameElement.getBoundingClientRect();
	return { x: iframeRect.left, y: iframeRect.top };
};

export const getReferenceOwnerDocument = ( {
	anchor,
	anchorRef,
	anchorRect,
	getAnchorRect,
	fallbackReferenceElement,
	fallbackDocument,
}: Pick<
	PopoverProps,
	'anchorRef' | 'anchorRect' | 'getAnchorRect' | 'anchor'
> & {
	fallbackReferenceElement: Element | null;
	fallbackDocument: Document;
} ): Document => {
	// In floating-ui's terms:
	// - "reference" refers to the popover's anchor element.
	// - "floating" refers the floating popover's element.
	// A floating element can also be positioned relative to a virtual element,
	// instead of a real one. A virtual element is represented by an object
	// with the `getBoundingClientRect()` function (like real elements).
	// See https://floating-ui.com/docs/virtual-elements for more info.
	let resultingReferenceOwnerDoc;
	if ( anchor ) {
		resultingReferenceOwnerDoc = anchor.ownerDocument;
	} else if ( ( anchorRef as PopoverAnchorRefTopBottom | undefined )?.top ) {
		resultingReferenceOwnerDoc = ( anchorRef as PopoverAnchorRefTopBottom )
			?.top.ownerDocument;
	} else if ( ( anchorRef as Range | undefined )?.startContainer ) {
		resultingReferenceOwnerDoc = ( anchorRef as Range ).startContainer
			.ownerDocument;
	} else if (
		( anchorRef as PopoverAnchorRefReference | undefined )?.current
	) {
		resultingReferenceOwnerDoc = (
			( anchorRef as PopoverAnchorRefReference ).current as Element
		 ).ownerDocument;
	} else if ( anchorRef as Element | undefined ) {
		// This one should be deprecated.
		resultingReferenceOwnerDoc = ( anchorRef as Element ).ownerDocument;
	} else if ( anchorRect && anchorRect?.ownerDocument ) {
		resultingReferenceOwnerDoc = anchorRect.ownerDocument;
	} else if ( getAnchorRect ) {
		resultingReferenceOwnerDoc = getAnchorRect(
			fallbackReferenceElement
		)?.ownerDocument;
	}

	return resultingReferenceOwnerDoc ?? fallbackDocument;
};

export const getReferenceElement = ( {
	anchor,
	anchorRef,
	anchorRect,
	getAnchorRect,
	fallbackReferenceElement,
}: Pick<
	PopoverProps,
	'anchorRef' | 'anchorRect' | 'getAnchorRect' | 'anchor'
> & {
	fallbackReferenceElement: Element | null;
} ): ReferenceType | null => {
	let referenceElement = null;

	if ( anchor ) {
		referenceElement = anchor;
	} else if ( ( anchorRef as PopoverAnchorRefTopBottom | undefined )?.top ) {
		// Create a virtual element for the ref. The expectation is that
		// if anchorRef.top is defined, then anchorRef.bottom is defined too.
		// Seems to be used by the block toolbar, when multiple blocks are selected
		// (top and bottom blocks are used to calculate the resulting rect).
		referenceElement = {
			getBoundingClientRect() {
				const topRect = (
					anchorRef as PopoverAnchorRefTopBottom
				 ).top.getBoundingClientRect();
				const bottomRect = (
					anchorRef as PopoverAnchorRefTopBottom
				 ).bottom.getBoundingClientRect();
				return new window.DOMRect(
					topRect.x,
					topRect.y,
					topRect.width,
					bottomRect.bottom - topRect.top
				);
			},
		};
	} else if (
		( anchorRef as PopoverAnchorRefReference | undefined )?.current
	) {
		// Standard React ref.
		referenceElement = ( anchorRef as PopoverAnchorRefReference ).current;
	} else if ( anchorRef as Element | undefined ) {
		// If `anchorRef` holds directly the element's value (no `current` key)
		// This is a weird scenario and should be deprecated.
		referenceElement = anchorRef as Element;
	} else if ( anchorRect ) {
		// Create a virtual element for the ref.
		referenceElement = {
			getBoundingClientRect() {
				return anchorRect;
			},
		};
	} else if ( getAnchorRect ) {
		// Create a virtual element for the ref.
		referenceElement = {
			getBoundingClientRect() {
				const rect = getAnchorRect( fallbackReferenceElement );
				return new window.DOMRect(
					rect.x ?? rect.left,
					rect.y ?? rect.top,
					rect.width ?? rect.right - rect.left,
					rect.height ?? rect.bottom - rect.top
				);
			},
		};
	} else if ( fallbackReferenceElement ) {
		// If no explicit ref is passed via props, fall back to
		// anchoring to the popover's parent node.
		referenceElement = fallbackReferenceElement.parentElement;
	}

	// Convert any `undefined` value to `null`.
	return referenceElement ?? null;
};
