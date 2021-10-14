/**
 * External dependencies
 */
import classnames from 'classnames';
import { includes, pick } from 'lodash';

/**
 * WordPress dependencies
 */
import { isBlobURL } from '@wordpress/blob';
import { useEffect, useState, useRef } from '@wordpress/element';
import { __, isRTL } from '@wordpress/i18n';
import {
	MenuItem,
	PanelBody,
	RangeControl,
	ResizableBox,
	Spinner,
	ToggleControl,
	ToolbarButton,
	Placeholder,
	Button,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import {
	BlockControls,
	InspectorControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	useBlockProps,
	store as blockEditorStore,
	__experimentalImageEditor as ImageEditor,
	__experimentalImageEditingProvider as ImageEditingProvider,
} from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { crop, upload } from '@wordpress/icons';
import { SVG, Path } from '@wordpress/primitives';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import useClientWidth from '../image/use-client-width';

/**
 * Module constants
 */
import { MIN_SIZE } from '../image/constants';

const ALLOWED_MEDIA_TYPES = [ 'image' ];
const ACCEPT_MEDIA_STRING = 'image/*';

const SiteLogo = ( {
	alt,
	attributes: { align, width, height, isLink, linkTarget },
	containerRef,
	isSelected,
	setAttributes,
	setLogo,
	logoUrl,
	siteUrl,
	logoId,
} ) => {
	const clientWidth = useClientWidth( containerRef, [ align ] );
	const isLargeViewport = useViewportMatch( 'medium' );
	const isWideAligned = includes( [ 'wide', 'full' ], align );
	const isResizable = ! isWideAligned && isLargeViewport;
	const [ { naturalWidth, naturalHeight }, setNaturalSize ] = useState( {} );
	const [ isEditingImage, setIsEditingImage ] = useState( false );
	const { toggleSelection } = useDispatch( blockEditorStore );
	const classes = classnames( 'custom-logo-link', {
		'is-transient': isBlobURL( logoUrl ),
	} );
	const { imageEditing, maxWidth, title } = useSelect( ( select ) => {
		const { getSettings } = select( blockEditorStore );
		const siteEntities = select( coreStore ).getEditedEntityRecord(
			'root',
			'site'
		);
		return {
			title: siteEntities.title,
			...pick( getSettings(), [ 'imageEditing', 'maxWidth' ] ),
		};
	}, [] );

	useEffect( () => {
		if ( ! isSelected ) {
			setIsEditingImage( false );
		}
	}, [ isSelected ] );

	function onResizeStart() {
		toggleSelection( false );
	}

	function onResizeStop() {
		toggleSelection( true );
	}

	const img = (
		<img
			className="custom-logo"
			src={ logoUrl }
			alt={ alt }
			onLoad={ ( event ) => {
				setNaturalSize(
					pick( event.target, [ 'naturalWidth', 'naturalHeight' ] )
				);
			} }
		/>
	);

	let imgWrapper = img;

	// Disable reason: Image itself is not meant to be interactive, but
	// should direct focus to block.
	if ( isLink ) {
		imgWrapper = (
			/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */
			<a
				href={ siteUrl }
				className={ classes }
				rel="home"
				title={ title }
				onClick={ ( event ) => event.preventDefault() }
			>
				{ img }
			</a>
			/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */
		);
	}

	let imageWidthWithinContainer;

	if ( clientWidth && naturalWidth && naturalHeight ) {
		const exceedMaxWidth = naturalWidth > clientWidth;
		imageWidthWithinContainer = exceedMaxWidth ? clientWidth : naturalWidth;
	}

	if ( ! isResizable || ! imageWidthWithinContainer ) {
		return <div style={ { width, height } }>{ imgWrapper }</div>;
	}

	const currentWidth = width || imageWidthWithinContainer;
	const ratio = naturalWidth / naturalHeight;
	const currentHeight = currentWidth / ratio;
	const minWidth = naturalWidth < naturalHeight ? MIN_SIZE : MIN_SIZE * ratio;
	const minHeight =
		naturalHeight < naturalWidth ? MIN_SIZE : MIN_SIZE / ratio;

	// With the current implementation of ResizableBox, an image needs an
	// explicit pixel value for the max-width. In absence of being able to
	// set the content-width, this max-width is currently dictated by the
	// vanilla editor style. The following variable adds a buffer to this
	// vanilla style, so 3rd party themes have some wiggleroom. This does,
	// in most cases, allow you to scale the image beyond the width of the
	// main column, though not infinitely.
	// @todo It would be good to revisit this once a content-width variable
	// becomes available.
	const maxWidthBuffer = maxWidth * 2.5;

	// Set the default width to a responsible size.
	// Note that this width is also set in the attached CSS file.
	const defaultWidth = 120;

	let showRightHandle = false;
	let showLeftHandle = false;

	/* eslint-disable no-lonely-if */
	// See https://github.com/WordPress/gutenberg/issues/7584.
	if ( align === 'center' ) {
		// When the image is centered, show both handles.
		showRightHandle = true;
		showLeftHandle = true;
	} else if ( isRTL() ) {
		// In RTL mode the image is on the right by default.
		// Show the right handle and hide the left handle only when it is
		// aligned left. Otherwise always show the left handle.
		if ( align === 'left' ) {
			showRightHandle = true;
		} else {
			showLeftHandle = true;
		}
	} else {
		// Show the left handle and hide the right handle only when the
		// image is aligned right. Otherwise always show the right handle.
		if ( align === 'right' ) {
			showLeftHandle = true;
		} else {
			showRightHandle = true;
		}
	}
	/* eslint-enable no-lonely-if */

	const canEditImage =
		logoId && naturalWidth && naturalHeight && imageEditing;

	const imgEdit =
		canEditImage && isEditingImage ? (
			<ImageEditingProvider
				id={ logoId }
				url={ logoUrl }
				naturalWidth={ naturalWidth }
				naturalHeight={ naturalHeight }
				clientWidth={ clientWidth }
				onSaveImage={ ( imageAttributes ) => {
					setLogo( imageAttributes.id );
				} }
				isEditing={ isEditingImage }
				onFinishEditing={ () => setIsEditingImage( false ) }
			>
				<ImageEditor
					url={ logoUrl }
					width={ currentWidth }
					height={ currentHeight }
					clientWidth={ clientWidth }
					naturalHeight={ naturalHeight }
					naturalWidth={ naturalWidth }
				/>
			</ImageEditingProvider>
		) : (
			<ResizableBox
				size={ {
					width: currentWidth,
					height: currentHeight,
				} }
				showHandle={ isSelected }
				minWidth={ minWidth }
				maxWidth={ maxWidthBuffer }
				minHeight={ minHeight }
				maxHeight={ maxWidthBuffer / ratio }
				lockAspectRatio
				enable={ {
					top: false,
					right: showRightHandle,
					bottom: true,
					left: showLeftHandle,
				} }
				onResizeStart={ onResizeStart }
				onResizeStop={ ( event, direction, elt, delta ) => {
					onResizeStop();
					setAttributes( {
						width: parseInt( currentWidth + delta.width, 10 ),
						height: parseInt( currentHeight + delta.height, 10 ),
					} );
				} }
			>
				{ imgWrapper }
			</ResizableBox>
		);

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Settings' ) }>
					<RangeControl
						label={ __( 'Image width' ) }
						onChange={ ( newWidth ) =>
							setAttributes( { width: newWidth } )
						}
						min={ minWidth }
						max={ maxWidthBuffer }
						initialPosition={ Math.min(
							defaultWidth,
							maxWidthBuffer
						) }
						value={ width || '' }
						disabled={ ! isResizable }
					/>
					<ToggleControl
						label={ __( 'Link image to home' ) }
						onChange={ () => setAttributes( { isLink: ! isLink } ) }
						checked={ isLink }
					/>
					{ isLink && (
						<>
							<ToggleControl
								label={ __( 'Open in new tab' ) }
								onChange={ ( value ) =>
									setAttributes( {
										linkTarget: value ? '_blank' : '_self',
									} )
								}
								checked={ linkTarget === '_blank' }
							/>
						</>
					) }
				</PanelBody>
			</InspectorControls>
			<BlockControls group="block">
				{ canEditImage && ! isEditingImage && (
					<ToolbarButton
						onClick={ () => setIsEditingImage( true ) }
						icon={ crop }
						label={ __( 'Crop' ) }
					/>
				) }
			</BlockControls>
			{ imgEdit }
		</>
	);
};

export default function LogoEdit( {
	attributes,
	className,
	setAttributes,
	isSelected,
} ) {
	const { width } = attributes;
	const [ logoUrl, setLogoUrl ] = useState();
	const ref = useRef();

	const {
		siteLogoId,
		canUserEdit,
		url,
		mediaItemData,
		isRequestingMediaItem,
	} = useSelect( ( select ) => {
		const { canUser, getEntityRecord, getEditedEntityRecord } = select(
			coreStore
		);
		const siteSettings = getEditedEntityRecord( 'root', 'site' );
		const siteData = getEntityRecord( 'root', '__unstableBase' );
		const _siteLogo = siteSettings?.site_logo;
		const _readOnlyLogo = siteData?.site_logo;
		const _canUserEdit = canUser( 'update', 'settings' );
		const _siteLogoId = _canUserEdit ? _siteLogo : _readOnlyLogo;
		const mediaItem =
			_siteLogoId &&
			select( coreStore ).getMedia( _siteLogoId, {
				context: 'view',
			} );
		const _isRequestingMediaItem =
			_siteLogoId &&
			! select( coreStore ).hasFinishedResolution( 'getMedia', [
				_siteLogoId,
				{ context: 'view' },
			] );
		return {
			siteLogoId: _siteLogoId,
			canUserEdit: _canUserEdit,
			url: siteData?.url,
			mediaItemData: mediaItem && {
				id: mediaItem.id,
				url: mediaItem.source_url,
				alt: mediaItem.alt_text,
			},
			isRequestingMediaItem: _isRequestingMediaItem,
		};
	}, [] );

	const { editEntityRecord } = useDispatch( coreStore );
	const setLogo = ( newValue ) =>
		editEntityRecord( 'root', 'site', undefined, {
			site_logo: newValue,
		} );

	let alt = null;
	if ( mediaItemData ) {
		alt = mediaItemData.alt;
		if ( logoUrl !== mediaItemData.url ) {
			setLogoUrl( mediaItemData.url );
		}
	}
	const onSelectLogo = ( media ) => {
		if ( ! media ) {
			return;
		}

		if ( ! media.id && media.url ) {
			// This is a temporary blob image
			setLogo( undefined );
			setLogoUrl( media.url );
			return;
		}

		setLogo( media.id );
	};

	const onRemoveLogo = () => {
		setLogo( null );
		setLogoUrl( undefined );
	};

	const { createErrorNotice } = useDispatch( noticesStore );
	const onUploadError = ( message ) => {
		createErrorNotice( message[ 2 ], { type: 'snackbar' } );
	};

	const controls = canUserEdit && logoUrl && (
		<BlockControls group="other">
			<MediaReplaceFlow
				mediaURL={ logoUrl }
				allowedTypes={ ALLOWED_MEDIA_TYPES }
				accept={ ACCEPT_MEDIA_STRING }
				onSelect={ onSelectLogo }
				onError={ onUploadError }
			>
				<MenuItem onClick={ onRemoveLogo }>{ __( 'Reset' ) }</MenuItem>
			</MediaReplaceFlow>
		</BlockControls>
	);

	let logoImage;
	const isLoading = siteLogoId === undefined || isRequestingMediaItem;
	if ( isLoading ) {
		logoImage = <Spinner />;
	}
	if ( !! logoUrl ) {
		logoImage = (
			<SiteLogo
				alt={ alt }
				attributes={ attributes }
				className={ className }
				containerRef={ ref }
				isSelected={ isSelected }
				setAttributes={ setAttributes }
				logoUrl={ logoUrl }
				setLogo={ setLogo }
				logoId={ mediaItemData?.id || siteLogoId }
				siteUrl={ url }
			/>
		);
	}
	const placeholder = ( content ) => {
		const placeholderClassName = classnames(
			'block-editor-media-placeholder',
			className
		);

		return (
			<Placeholder
				className={ placeholderClassName }
				preview={ logoImage }
			>
				{
					<SVG
						className="components-placeholder__illustration"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 60 60"
					>
						<Path
							vectorEffect="non-scaling-stroke"
							d="m61 32.622-13.555-9.137-15.888 9.859a5 5 0 0 1-5.386-.073l-9.095-5.989L1 37.5"
						/>
					</SVG>
				}
				{ content }
			</Placeholder>
		);
	};

	const classes = classnames( className, {
		'is-default-size': ! width,
	} );

	const blockProps = useBlockProps( {
		ref,
		className: classes,
	} );

	const label = __( 'Add a site logo' );

	return (
		<div { ...blockProps }>
			{ controls }
			{ !! logoUrl && logoImage }
			{ ! logoUrl && ! canUserEdit && (
				<Placeholder className="site-logo_placeholder">
					{ isLoading && (
						<span className="components-placeholder__preview">
							<Spinner />
						</span>
					) }
				</Placeholder>
			) }
			{ ! logoUrl && canUserEdit && (
				<MediaPlaceholder
					onSelect={ onSelectLogo }
					accept={ ACCEPT_MEDIA_STRING }
					allowedTypes={ ALLOWED_MEDIA_TYPES }
					onError={ onUploadError }
					placeholder={ placeholder }
					mediaLibraryButton={ ( { open } ) => {
						return (
							<Button
								icon={ upload }
								variant="primary"
								label={ label }
								showTooltip
								tooltipPosition="top center"
								onClick={ () => {
									open();
								} }
							/>
						);
					} }
				/>
			) }
		</div>
	);
}
