/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { useRef, createContext, useContext } from '@wordpress/element';
import { __unstableMotion as motion } from '@wordpress/components';
import { useReducedMotion } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import Inserter from '../inserter';
import { store as blockEditorStore } from '../../store';
import BlockPopoverInbetween from '../block-popover/inbetween';

export const InsertionPointOpenRef = createContext();

function InsertionPointPopover( {
	__unstablePopoverSlot,
	__unstableContentRef,
} ) {
	const { selectBlock, hideInsertionPoint } = useDispatch( blockEditorStore );
	const openRef = useContext( InsertionPointOpenRef );
	const ref = useRef();
	const {
		orientation,
		previousClientId,
		nextClientId,
		rootClientId,
		isInserterShown,
	} = useSelect( ( select ) => {
		const {
			getBlockOrder,
			getBlockListSettings,
			getBlockInsertionPoint,
			isBlockBeingDragged,
			getPreviousBlockClientId,
			getNextBlockClientId,
		} = select( blockEditorStore );
		const insertionPoint = getBlockInsertionPoint();
		const order = getBlockOrder( insertionPoint.rootClientId );

		if ( ! order.length ) {
			return {};
		}

		let _previousClientId = order[ insertionPoint.index - 1 ];
		let _nextClientId = order[ insertionPoint.index ];

		while ( isBlockBeingDragged( _previousClientId ) ) {
			_previousClientId = getPreviousBlockClientId( _previousClientId );
		}

		while ( isBlockBeingDragged( _nextClientId ) ) {
			_nextClientId = getNextBlockClientId( _nextClientId );
		}

		return {
			previousClientId: _previousClientId,
			nextClientId: _nextClientId,
			orientation:
				getBlockListSettings( insertionPoint.rootClientId )
					?.orientation || 'vertical',
			rootClientId: insertionPoint.rootClientId,
			isInserterShown: insertionPoint?.__unstableWithInserter,
		};
	}, [] );
	const isVertical = orientation === 'vertical';

	const disableMotion = useReducedMotion();

	function onClick( event ) {
		if ( event.target === ref.current && nextClientId ) {
			selectBlock( nextClientId, -1 );
		}
	}

	function onFocus( event ) {
		// Only handle click on the wrapper specifically, and not an event
		// bubbled from the inserter itself.
		if ( event.target !== ref.current ) {
			openRef.current = true;
		}
	}

	function maybeHideInserterPoint( event ) {
		// Only hide the inserter if it's triggered on the wrapper,
		// and the inserter is not open.
		if ( event.target === ref.current && ! openRef.current ) {
			hideInsertionPoint();
		}
	}

	// Define animation variants for the line element.
	const horizontalLine = {
		start: {
			width: 0,
			top: '50%',
			bottom: '50%',
			x: 0,
		},
		rest: {
			width: 4,
			top: 0,
			bottom: 0,
			x: -2,
		},
		hover: {
			width: 4,
			top: 0,
			bottom: 0,
			x: -2,
		},
	};
	const verticalLine = {
		start: {
			height: 0,
			left: '50%',
			right: '50%',
			y: 0,
		},
		rest: {
			height: 4,
			left: 0,
			right: 0,
			y: -2,
		},
		hover: {
			height: 4,
			left: 0,
			right: 0,
			y: -2,
		},
	};
	const lineVariants = {
		// Initial position starts from the center and invisible.
		start: {
			...( ! isVertical ? horizontalLine.start : verticalLine.start ),
			opacity: 0,
		},
		// The line expands to fill the container. If the inserter is visible it
		// is delayed so it appears orchestrated.
		rest: {
			...( ! isVertical ? horizontalLine.rest : verticalLine.rest ),
			opacity: 1,
			borderRadius: '2px',
			transition: { delay: isInserterShown ? 0.4 : 0 },
		},
		hover: {
			...( ! isVertical ? horizontalLine.hover : verticalLine.hover ),
			opacity: 1,
			borderRadius: '2px',
			transition: { delay: 0.4 },
		},
	};

	const inserterVariants = {
		start: {
			scale: disableMotion ? 1 : 0,
		},
		rest: {
			scale: 1,
			transition: { delay: 0.2 },
		},
	};

	const className = classnames(
		'block-editor-block-list__insertion-point',
		'is-' + orientation
	);

	return (
		<BlockPopoverInbetween
			previousClientId={ previousClientId }
			nextClientId={ nextClientId }
			__unstablePopoverSlot={ __unstablePopoverSlot }
			__unstableContentRef={ __unstableContentRef }
		>
			<motion.div
				layout={ ! disableMotion }
				initial={ disableMotion ? 'rest' : 'start' }
				animate="rest"
				whileHover="hover"
				whileTap="pressed"
				exit="start"
				ref={ ref }
				tabIndex={ -1 }
				onClick={ onClick }
				onFocus={ onFocus }
				className={ classnames( className, {
					'is-with-inserter': isInserterShown,
				} ) }
				onHoverEnd={ maybeHideInserterPoint }
			>
				<motion.div
					variants={ lineVariants }
					className="block-editor-block-list__insertion-point-indicator"
				/>
				{ isInserterShown && (
					<motion.div
						variants={ inserterVariants }
						className={ classnames(
							'block-editor-block-list__insertion-point-inserter'
						) }
					>
						<Inserter
							position="bottom center"
							clientId={ nextClientId }
							rootClientId={ rootClientId }
							__experimentalIsQuick
							onToggle={ ( isOpen ) => {
								openRef.current = isOpen;
							} }
							onSelectOrClose={ () => {
								openRef.current = false;
							} }
						/>
					</motion.div>
				) }
			</motion.div>
		</BlockPopoverInbetween>
	);
}

export default function InsertionPoint( { children, ...props } ) {
	const isVisible = useSelect( ( select ) => {
		return select( blockEditorStore ).isBlockInsertionPointVisible();
	}, [] );

	return (
		<InsertionPointOpenRef.Provider value={ useRef( false ) }>
			{ isVisible && <InsertionPointPopover { ...props } /> }
			{ children }
		</InsertionPointOpenRef.Provider>
	);
}
