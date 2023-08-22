/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { BlockInspector } from '@wordpress/block-editor';
import { privateApis as editPatternsPrivateApis } from '@wordpress/patterns';

/**
 * Internal dependencies
 */
import TemplatePartConverter from '../template-part-converter';
import { SidebarInspectorFill } from '../sidebar-edit-mode';
import { store as editSiteStore } from '../../store';
import SiteEditorCanvas from './site-editor-canvas';
import getBlockEditorProvider from './get-block-editor-provider';

import { unlock } from '../../lock-unlock';
const { PatternsMenuItems } = unlock( editPatternsPrivateApis );
export default function BlockEditor() {
	const entityType = useSelect(
		( select ) => select( editSiteStore ).getEditedPostType(),
		[]
	);

	// Choose the provider based on the entity type currently
	// being edited.
	const BlockEditorProvider = getBlockEditorProvider( entityType );

	return (
		<BlockEditorProvider>
			<TemplatePartConverter />
			<SidebarInspectorFill>
				<BlockInspector />
			</SidebarInspectorFill>

			<SiteEditorCanvas />

			<PatternsMenuItems />
		</BlockEditorProvider>
	);
}
