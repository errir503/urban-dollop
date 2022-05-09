/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';
import { ResizableBox } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { View } from '@wordpress/primitives';

/**
 * Internal dependencies
 */
import SpacerControls from './controls';
import { MIN_SPACER_SIZE } from './constants';

const ResizableSpacer = ( {
	orientation,
	onResizeStart,
	onResize,
	onResizeStop,
	isSelected,
	isResizing,
	setIsResizing,
	...props
} ) => {
	const getCurrentSize = ( elt ) => {
		return orientation === 'horizontal'
			? elt.clientWidth
			: elt.clientHeight;
	};

	const getNextVal = ( elt ) => {
		return `${ getCurrentSize( elt ) }px`;
	};

	return (
		<ResizableBox
			className={ classnames( 'block-library-spacer__resize-container', {
				'resize-horizontal': orientation === 'horizontal',
				'is-resizing': isResizing,
				'is-selected': isSelected,
			} ) }
			onResizeStart={ ( _event, _direction, elt ) => {
				const nextVal = getNextVal( elt );
				onResizeStart( nextVal );
				onResize( nextVal );
			} }
			onResize={ ( _event, _direction, elt ) => {
				onResize( getNextVal( elt ) );
				if ( ! isResizing ) {
					setIsResizing( true );
				}
			} }
			onResizeStop={ ( _event, _direction, elt ) => {
				const nextVal = getCurrentSize( elt );
				onResizeStop( `${ nextVal }px` );
				setIsResizing( false );
			} }
			__experimentalShowTooltip={ true }
			__experimentalTooltipProps={ {
				axis: orientation === 'horizontal' ? 'x' : 'y',
				position: 'corner',
				isVisible: isResizing,
			} }
			showHandle={ isSelected }
			{ ...props }
		/>
	);
};

const SpacerEdit = ( {
	attributes,
	isSelected,
	setAttributes,
	toggleSelection,
	context,
} ) => {
	const { orientation } = context;
	const { height, width } = attributes;

	const [ isResizing, setIsResizing ] = useState( false );
	const [ temporaryHeight, setTemporaryHeight ] = useState( null );
	const [ temporaryWidth, setTemporaryWidth ] = useState( null );

	const onResizeStart = () => toggleSelection( false );
	const onResizeStop = () => toggleSelection( true );

	const handleOnVerticalResizeStop = ( newHeight ) => {
		onResizeStop();

		setAttributes( { height: newHeight } );
		setTemporaryHeight( null );
	};

	const handleOnHorizontalResizeStop = ( newWidth ) => {
		onResizeStop();
		setAttributes( { width: newWidth } );
		setTemporaryWidth( null );
	};

	const style = {
		height:
			orientation === 'horizontal'
				? 24
				: temporaryHeight || height || undefined,
		width:
			orientation === 'horizontal'
				? temporaryWidth || width || undefined
				: undefined,
	};

	const resizableBoxWithOrientation = ( blockOrientation ) => {
		if ( blockOrientation === 'horizontal' ) {
			return (
				<ResizableSpacer
					minWidth={ MIN_SPACER_SIZE }
					enable={ {
						top: false,
						right: true,
						bottom: false,
						left: false,
						topRight: false,
						bottomRight: false,
						bottomLeft: false,
						topLeft: false,
					} }
					orientation={ blockOrientation }
					onResizeStart={ onResizeStart }
					onResize={ setTemporaryWidth }
					onResizeStop={ handleOnHorizontalResizeStop }
					isSelected={ isSelected }
					isResizing={ isResizing }
					setIsResizing={ setIsResizing }
				/>
			);
		}

		return (
			<>
				<ResizableSpacer
					minHeight={ MIN_SPACER_SIZE }
					enable={ {
						top: false,
						right: false,
						bottom: true,
						left: false,
						topRight: false,
						bottomRight: false,
						bottomLeft: false,
						topLeft: false,
					} }
					orientation={ blockOrientation }
					onResizeStart={ onResizeStart }
					onResize={ setTemporaryHeight }
					onResizeStop={ handleOnVerticalResizeStop }
					isSelected={ isSelected }
					isResizing={ isResizing }
					setIsResizing={ setIsResizing }
				/>
			</>
		);
	};

	useEffect( () => {
		if ( orientation === 'horizontal' && ! width ) {
			setAttributes( {
				height: '0px',
				width: '72px',
			} );
		}
	}, [] );

	return (
		<>
			<View { ...useBlockProps( { style } ) }>
				{ resizableBoxWithOrientation( orientation ) }
			</View>
			<SpacerControls
				setAttributes={ setAttributes }
				height={ temporaryHeight || height }
				width={ temporaryWidth || width }
				orientation={ orientation }
				isResizing={ isResizing }
			/>
		</>
	);
};

export default SpacerEdit;
