/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { useCallback, useRef } from '@wordpress/element';
import { useEntityBlockEditor } from '@wordpress/core-data';
import {
	BlockEditorProvider,
	__experimentalLinkControl,
	BlockInspector,
	BlockTools,
	__unstableBlockSettingsMenuFirstItem,
	__unstableUseTypingObserver as useTypingObserver,
} from '@wordpress/block-editor';
import { useMergeRefs, useViewportMatch } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import TemplatePartConverter from '../template-part-converter';
import NavigateToLink from '../navigate-to-link';
import { SidebarInspectorFill } from '../sidebar';
import { store as editSiteStore } from '../../store';
import BlockInspectorButton from './block-inspector-button';
import EditTemplatePartMenuButton from '../edit-template-part-menu-button';
import BackButton from './back-button';
import ResizableEditor from './resizable-editor';

export default function BlockEditor( { setIsInserterOpen } ) {
	const { settings, templateType, page } = useSelect(
		( select ) => {
			const { getSettings, getEditedPostType, getPage } = select(
				editSiteStore
			);

			return {
				settings: getSettings( setIsInserterOpen ),
				templateType: getEditedPostType(),
				page: getPage(),
			};
		},
		[ setIsInserterOpen ]
	);
	const [ blocks, onInput, onChange ] = useEntityBlockEditor(
		'postType',
		templateType
	);
	const { setPage } = useDispatch( editSiteStore );
	const contentRef = useRef();
	const mergedRefs = useMergeRefs( [ contentRef, useTypingObserver() ] );
	const isMobileViewport = useViewportMatch( 'small', '<' );

	const isTemplatePart = templateType === 'wp_template_part';

	return (
		<BlockEditorProvider
			settings={ settings }
			value={ blocks }
			onInput={ onInput }
			onChange={ onChange }
			useSubRegistry={ false }
		>
			<EditTemplatePartMenuButton />
			<TemplatePartConverter />
			<__experimentalLinkControl.ViewerFill>
				{ useCallback(
					( fillProps ) => (
						<NavigateToLink
							{ ...fillProps }
							activePage={ page }
							onActivePageChange={ setPage }
						/>
					),
					[ page ]
				) }
			</__experimentalLinkControl.ViewerFill>
			<SidebarInspectorFill>
				<BlockInspector />
			</SidebarInspectorFill>
			<BlockTools
				className={ classnames( 'edit-site-visual-editor', {
					'is-focus-mode': isTemplatePart,
				} ) }
				__unstableContentRef={ contentRef }
			>
				<BackButton />

				<ResizableEditor
					enableResizing={
						isTemplatePart &&
						// Disable resizing in mobile viewport.
						! isMobileViewport
					}
					settings={ settings }
					contentRef={ mergedRefs }
				/>

				<__unstableBlockSettingsMenuFirstItem>
					{ ( { onClose } ) => (
						<BlockInspectorButton onClick={ onClose } />
					) }
				</__unstableBlockSettingsMenuFirstItem>
			</BlockTools>
		</BlockEditorProvider>
	);
}
