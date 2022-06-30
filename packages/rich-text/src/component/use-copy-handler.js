/**
 * WordPress dependencies
 */
import { useRef } from '@wordpress/element';
import { useRefEffect } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { toHTMLString } from '../to-html-string';
import { isCollapsed } from '../is-collapsed';
import { slice } from '../slice';
import { getTextContent } from '../get-text-content';

export function useCopyHandler( props ) {
	const propsRef = useRef( props );
	propsRef.current = props;
	return useRefEffect( ( element ) => {
		function onCopy( event ) {
			const { record, multilineTag, preserveWhiteSpace } =
				propsRef.current;
			if (
				isCollapsed( record.current ) ||
				! element.contains( element.ownerDocument.activeElement )
			) {
				return;
			}

			const selectedRecord = slice( record.current );
			const plainText = getTextContent( selectedRecord );
			const html = toHTMLString( {
				value: selectedRecord,
				multilineTag,
				preserveWhiteSpace,
			} );
			event.clipboardData.setData( 'text/plain', plainText );
			event.clipboardData.setData( 'text/html', html );
			event.clipboardData.setData( 'rich-text', 'true' );
			event.clipboardData.setData(
				'rich-text-multi-line-tag',
				multilineTag || ''
			);
			event.preventDefault();
		}

		element.addEventListener( 'copy', onCopy );
		return () => {
			element.removeEventListener( 'copy', onCopy );
		};
	}, [] );
}
