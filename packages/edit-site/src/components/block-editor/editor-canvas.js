/**
 * WordPress dependencies
 */
import {
	__experimentalUseResizeCanvas as useResizeCanvas,
	__unstableEditorStyles as EditorStyles,
	__unstableIframe as Iframe,
	__unstableUseMouseMoveTypingReset as useMouseMoveTypingReset,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { store as editSiteStore } from '../../store';

function EditorCanvas( { enableResizing, settings, children, ...props } ) {
	const { deviceType, isZoomOutMode } = useSelect(
		( select ) => ( {
			deviceType:
				select( editSiteStore ).__experimentalGetPreviewDeviceType(),
			isZoomOutMode:
				select( blockEditorStore ).__unstableGetEditorMode() ===
				'zoom-out',
		} ),
		[]
	);
	const deviceStyles = useResizeCanvas( deviceType );
	const mouseMoveTypingRef = useMouseMoveTypingReset();
	return (
		<Iframe
			scale={ ( isZoomOutMode && 0.45 ) || undefined }
			frameSize={ isZoomOutMode ? 100 : undefined }
			style={ enableResizing ? {} : deviceStyles }
			head={
				<>
					<EditorStyles styles={ settings.styles } />
					<style>{
						// Forming a "block formatting context" to prevent margin collapsing.
						// @see https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Block_formatting_context
						`.is-root-container { display: flow-root; }
							body { position: relative; }`
					}</style>
					{ enableResizing && (
						<style>
							{
								// Some themes will have `min-height: 100vh` for the root container,
								// which isn't a requirement in auto resize mode.
								`.is-root-container { min-height: 0 !important; }`
							}
						</style>
					) }
				</>
			}
			ref={ mouseMoveTypingRef }
			name="editor-canvas"
			className="edit-site-visual-editor__editor-canvas"
			{ ...props }
		>
			{ /* Filters need to be rendered before children to avoid Safari rendering issues. */ }
			{ settings.svgFilters }
			{ children }
		</Iframe>
	);
}

export default EditorCanvas;
