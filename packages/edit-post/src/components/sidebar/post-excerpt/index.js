/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import {
	PostExcerpt as PostExcerptForm,
	PostExcerptCheck,
	store as editorStore,
} from '@wordpress/editor';
import { useDispatch, useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import PluginPostExcerpt from '../plugin-post-excerpt';

/**
 * Module Constants
 */
const PANEL_NAME = 'post-excerpt';

export default function PostExcerpt() {
	const { isOpened, isEnabled } = useSelect( ( select ) => {
		const { isEditorPanelOpened, isEditorPanelEnabled } =
			select( editorStore );

		return {
			isOpened: isEditorPanelOpened( PANEL_NAME ),
			isEnabled: isEditorPanelEnabled( PANEL_NAME ),
		};
	}, [] );

	const { toggleEditorPanelOpened } = useDispatch( editorStore );
	const toggleExcerptPanel = () => toggleEditorPanelOpened( PANEL_NAME );

	if ( ! isEnabled ) {
		return null;
	}

	return (
		<PostExcerptCheck>
			<PanelBody
				title={ __( 'Excerpt' ) }
				opened={ isOpened }
				onToggle={ toggleExcerptPanel }
			>
				<PluginPostExcerpt.Slot>
					{ ( fills ) => (
						<>
							<PostExcerptForm />
							{ fills }
						</>
					) }
				</PluginPostExcerpt.Slot>
			</PanelBody>
		</PostExcerptCheck>
	);
}
