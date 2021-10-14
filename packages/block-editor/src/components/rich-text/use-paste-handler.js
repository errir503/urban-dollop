/**
 * WordPress dependencies
 */
import { useRef } from '@wordpress/element';
import { useRefEffect } from '@wordpress/compose';
import { getFilesFromDataTransfer } from '@wordpress/dom';
import { pasteHandler } from '@wordpress/blocks';
import {
	isEmpty,
	insert,
	create,
	replace,
	__UNSTABLE_LINE_SEPARATOR as LINE_SEPARATOR,
} from '@wordpress/rich-text';
import { isURL } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { filePasteHandler } from './file-paste-handler';
import { addActiveFormats, isShortcode } from './utils';
import { splitValue } from './split-value';

/** @typedef {import('@wordpress/rich-text').RichTextValue} RichTextValue */

/**
 * Replaces line separators with line breaks if not multiline.
 * Replaces line breaks with line separators if multiline.
 *
 * @param {RichTextValue} value       Value to adjust.
 * @param {boolean}       isMultiline Whether to adjust to multiline or not.
 *
 * @return {RichTextValue} Adjusted value.
 */
function adjustLines( value, isMultiline ) {
	if ( isMultiline ) {
		return replace( value, /\n+/g, LINE_SEPARATOR );
	}

	return replace( value, new RegExp( LINE_SEPARATOR, 'g' ), '\n' );
}

export function usePasteHandler( props ) {
	const propsRef = useRef( props );
	propsRef.current = props;
	return useRefEffect( ( element ) => {
		function _onPaste( event ) {
			const {
				isSelected,
				disableFormats,
				onChange,
				value,
				formatTypes,
				tagName,
				onReplace,
				onSplit,
				onSplitMiddle,
				__unstableEmbedURLOnPaste,
				multilineTag,
				preserveWhiteSpace,
				pastePlainText,
			} = propsRef.current;

			if ( ! isSelected ) {
				event.preventDefault();
				return;
			}

			const { clipboardData } = event;

			let plainText = '';
			let html = '';

			// IE11 only supports `Text` as an argument for `getData` and will
			// otherwise throw an invalid argument error, so we try the standard
			// arguments first, then fallback to `Text` if they fail.
			try {
				plainText = clipboardData.getData( 'text/plain' );
				html = clipboardData.getData( 'text/html' );
			} catch ( error1 ) {
				try {
					html = clipboardData.getData( 'Text' );
				} catch ( error2 ) {
					// Some browsers like UC Browser paste plain text by default and
					// don't support clipboardData at all, so allow default
					// behaviour.
					return;
				}
			}

			// Remove Windows-specific metadata appended within copied HTML text.
			html = removeWindowsFragments( html );

			event.preventDefault();

			// Allows us to ask for this information when we get a report.
			window.console.log( 'Received HTML:\n\n', html );
			window.console.log( 'Received plain text:\n\n', plainText );

			if ( disableFormats ) {
				onChange( insert( value, plainText ) );
				return;
			}

			const transformed = formatTypes.reduce(
				( accumlator, { __unstablePasteRule } ) => {
					// Only allow one transform.
					if ( __unstablePasteRule && accumlator === value ) {
						accumlator = __unstablePasteRule( value, {
							html,
							plainText,
						} );
					}

					return accumlator;
				},
				value
			);

			if ( transformed !== value ) {
				onChange( transformed );
				return;
			}

			const files = [ ...getFilesFromDataTransfer( clipboardData ) ];
			const isInternal = clipboardData.getData( 'rich-text' ) === 'true';

			// If the data comes from a rich text instance, we can directly use it
			// without filtering the data. The filters are only meant for externally
			// pasted content and remove inline styles.
			if ( isInternal ) {
				const pastedMultilineTag =
					clipboardData.getData( 'rich-text-multi-line-tag' ) ||
					undefined;
				let pastedValue = create( {
					html,
					multilineTag: pastedMultilineTag,
					multilineWrapperTags:
						pastedMultilineTag === 'li'
							? [ 'ul', 'ol' ]
							: undefined,
					preserveWhiteSpace,
				} );
				pastedValue = adjustLines( pastedValue, !! multilineTag );
				addActiveFormats( pastedValue, value.activeFormats );
				onChange( insert( value, pastedValue ) );
				return;
			}

			if ( pastePlainText ) {
				onChange( insert( value, create( { text: plainText } ) ) );
				return;
			}

			// Only process file if no HTML is present.
			// Note: a pasted file may have the URL as plain text.
			if ( files && files.length && ! html ) {
				const content = pasteHandler( {
					HTML: filePasteHandler( files ),
					mode: 'BLOCKS',
					tagName,
					preserveWhiteSpace,
				} );

				// Allows us to ask for this information when we get a report.
				// eslint-disable-next-line no-console
				window.console.log( 'Received items:\n\n', files );

				if ( onReplace && isEmpty( value ) ) {
					onReplace( content );
				} else {
					splitValue( {
						value,
						pastedBlocks: content,
						onReplace,
						onSplit,
						onSplitMiddle,
						multilineTag,
					} );
				}

				return;
			}

			let mode = onReplace && onSplit ? 'AUTO' : 'INLINE';

			// Force the blocks mode when the user is pasting
			// on a new line & the content resembles a shortcode.
			// Otherwise it's going to be detected as inline
			// and the shortcode won't be replaced.
			if (
				mode === 'AUTO' &&
				isEmpty( value ) &&
				isShortcode( plainText )
			) {
				mode = 'BLOCKS';
			}

			if (
				__unstableEmbedURLOnPaste &&
				isEmpty( value ) &&
				isURL( plainText.trim() )
			) {
				mode = 'BLOCKS';
			}

			const content = pasteHandler( {
				HTML: html,
				plainText,
				mode,
				tagName,
				preserveWhiteSpace,
			} );

			if ( typeof content === 'string' ) {
				let valueToInsert = create( { html: content } );

				// If the content should be multiline, we should process text
				// separated by a line break as separate lines.
				valueToInsert = adjustLines( valueToInsert, !! multilineTag );

				addActiveFormats( valueToInsert, value.activeFormats );
				onChange( insert( value, valueToInsert ) );
			} else if ( content.length > 0 ) {
				if ( onReplace && isEmpty( value ) ) {
					onReplace( content, content.length - 1, -1 );
				} else {
					splitValue( {
						value,
						pastedBlocks: content,
						onReplace,
						onSplit,
						onSplitMiddle,
						multilineTag,
					} );
				}
			}
		}

		element.addEventListener( 'paste', _onPaste );
		return () => {
			element.removeEventListener( 'paste', _onPaste );
		};
	}, [] );
}

/**
 * Normalizes a given string of HTML to remove the Windows specific "Fragment" comments
 * and any preceeding and trailing whitespace.
 *
 * @param {string} html the html to be normalized
 * @return {string} the normalized html
 */
function removeWindowsFragments( html ) {
	const startReg = /.*<!--StartFragment-->/s;
	const endReg = /<!--EndFragment-->.*/s;

	return html.replace( startReg, '' ).replace( endReg, '' );
}
