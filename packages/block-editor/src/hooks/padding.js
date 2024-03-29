/**
 * WordPress dependencies
 */
import { useState, useRef, useEffect } from '@wordpress/element';
import isShallowEqual from '@wordpress/is-shallow-equal';

/**
 * Internal dependencies
 */
import BlockPopoverCover from '../components/block-popover/cover';
import { __unstableUseBlockElement as useBlockElement } from '../components/block-list/use-block-props/use-block-refs';

function getComputedCSS( element, property ) {
	return element.ownerDocument.defaultView
		.getComputedStyle( element )
		.getPropertyValue( property );
}

export function PaddingVisualizer( { clientId, value, forceShow } ) {
	const blockElement = useBlockElement( clientId );
	const [ style, setStyle ] = useState();

	const padding = value?.spacing?.padding;

	useEffect( () => {
		if (
			! blockElement ||
			null === blockElement.ownerDocument.defaultView
		) {
			return;
		}

		setStyle( {
			borderTopWidth: getComputedCSS( blockElement, 'padding-top' ),
			borderRightWidth: getComputedCSS( blockElement, 'padding-right' ),
			borderBottomWidth: getComputedCSS( blockElement, 'padding-bottom' ),
			borderLeftWidth: getComputedCSS( blockElement, 'padding-left' ),
		} );
	}, [ blockElement, padding ] );

	const [ isActive, setIsActive ] = useState( false );
	const valueRef = useRef( padding );
	const timeoutRef = useRef();

	const clearTimer = () => {
		if ( timeoutRef.current ) {
			window.clearTimeout( timeoutRef.current );
		}
	};

	useEffect( () => {
		if ( ! isShallowEqual( padding, valueRef.current ) && ! forceShow ) {
			setIsActive( true );
			valueRef.current = padding;

			timeoutRef.current = setTimeout( () => {
				setIsActive( false );
			}, 400 );
		}

		return () => {
			setIsActive( false );
			clearTimer();
		};
	}, [ padding, forceShow ] );

	if ( ! isActive && ! forceShow ) {
		return null;
	}

	return (
		<BlockPopoverCover
			clientId={ clientId }
			__unstablePopoverSlot="block-toolbar"
		>
			<div className="block-editor__padding-visualizer" style={ style } />
		</BlockPopoverCover>
	);
}
