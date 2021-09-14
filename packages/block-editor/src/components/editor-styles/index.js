/**
 * External dependencies
 */
import tinycolor from 'tinycolor2';

/**
 * WordPress dependencies
 */
import { useCallback, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import transformStyles from '../../utils/transform-styles';

const EDITOR_STYLES_SELECTOR = '.editor-styles-wrapper';

function useDarkThemeBodyClassName( styles ) {
	return useCallback(
		( node ) => {
			if ( ! node ) {
				return;
			}

			const { ownerDocument } = node;
			const { defaultView, body } = ownerDocument;
			const canvas = ownerDocument.querySelector(
				EDITOR_STYLES_SELECTOR
			);

			let backgroundColor;

			if ( ! canvas ) {
				// The real .editor-styles-wrapper element might not exist in the
				// DOM, so calculate the background color by creating a fake
				// wrapper.
				const tempCanvas = ownerDocument.createElement( 'div' );
				tempCanvas.classList.add( 'editor-styles-wrapper' );
				body.appendChild( tempCanvas );

				backgroundColor = defaultView
					.getComputedStyle( tempCanvas, null )
					.getPropertyValue( 'background-color' );

				body.removeChild( tempCanvas );
			} else {
				backgroundColor = defaultView
					.getComputedStyle( canvas, null )
					.getPropertyValue( 'background-color' );
			}

			// If background is transparent, it should be treated as light color.
			if (
				tinycolor( backgroundColor ).getLuminance() > 0.5 ||
				tinycolor( backgroundColor ).getAlpha() === 0
			) {
				body.classList.remove( 'is-dark-theme' );
			} else {
				body.classList.add( 'is-dark-theme' );
			}
		},
		[ styles ]
	);
}

export default function EditorStyles( { styles } ) {
	const transformedStyles = useMemo(
		() => transformStyles( styles, EDITOR_STYLES_SELECTOR ),
		[ styles ]
	);

	return (
		<>
			{ /* Use an empty style element to have a document reference,
			     but this could be any element. */ }
			<style ref={ useDarkThemeBodyClassName( styles ) } />
			{ transformedStyles.map( ( css, index ) => (
				<style key={ index }>{ css }</style>
			) ) }
		</>
	);
}
