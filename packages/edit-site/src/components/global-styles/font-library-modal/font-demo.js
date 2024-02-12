/**
 * WordPress dependencies
 */
import { __experimentalText as Text } from '@wordpress/components';
import { useContext, useEffect, useState, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { FontLibraryContext } from './context';
import { getFacePreviewStyle } from './utils/preview-styles';

function getPreviewUrl( fontFace ) {
	if ( fontFace.preview ) {
		return fontFace.preview;
	}
	if ( fontFace.src ) {
		return Array.isArray( fontFace.src ) ? fontFace.src[ 0 ] : fontFace.src;
	}
}

function FontFaceDemo( { customPreviewUrl, fontFace, text, style = {} } ) {
	const ref = useRef( null );
	const [ isIntersecting, setIsIntersecting ] = useState( false );
	const [ isAssetLoaded, setIsAssetLoaded ] = useState( false );
	const { loadFontFaceAsset } = useContext( FontLibraryContext );

	const previewUrl = customPreviewUrl ?? getPreviewUrl( fontFace );
	const isPreviewImage =
		previewUrl && previewUrl.match( /\.(png|jpg|jpeg|gif|svg)$/i );

	const faceStyles = getFacePreviewStyle( fontFace );
	const textDemoStyle = {
		fontSize: '18px',
		lineHeight: 1,
		opacity: isAssetLoaded ? '1' : '0',
		...faceStyles,
		...style,
	};

	useEffect( () => {
		const observer = new window.IntersectionObserver( ( [ entry ] ) => {
			setIsIntersecting( entry.isIntersecting );
		}, {} );
		observer.observe( ref.current );
		return () => observer.disconnect();
	}, [ ref ] );

	useEffect( () => {
		const loadAsset = async () => {
			if ( isIntersecting ) {
				if ( ! isPreviewImage && fontFace.src ) {
					await loadFontFaceAsset( fontFace );
				}
				setIsAssetLoaded( true );
			}
		};
		loadAsset();
	}, [ fontFace, isIntersecting, loadFontFaceAsset, isPreviewImage ] );

	return (
		<div ref={ ref }>
			{ isPreviewImage ? (
				<img
					src={ previewUrl }
					loading="lazy"
					alt={ text }
					className="font-library-modal__font-variant_demo-image"
				/>
			) : (
				<Text
					style={ textDemoStyle }
					className="font-library-modal__font-variant_demo-text"
				>
					{ text }
				</Text>
			) }
		</div>
	);
}

export default FontFaceDemo;
