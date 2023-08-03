/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { Notice } from '@wordpress/components';
import { EntityProvider } from '@wordpress/core-data';
import { store as preferencesStore } from '@wordpress/preferences';
import {
	BlockContextProvider,
	BlockBreadcrumb,
	store as blockEditorStore,
	privateApis as blockEditorPrivateApis,
} from '@wordpress/block-editor';
import {
	InterfaceSkeleton,
	ComplementaryArea,
	store as interfaceStore,
} from '@wordpress/interface';
import { EditorNotices, EditorSnackbars } from '@wordpress/editor';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { SidebarComplementaryAreaFills } from '../sidebar-edit-mode';
import BlockEditor from '../block-editor';
import CodeEditor from '../code-editor';
import KeyboardShortcutsEditMode from '../keyboard-shortcuts/edit-mode';
import InserterSidebar from '../secondary-sidebar/inserter-sidebar';
import ListViewSidebar from '../secondary-sidebar/list-view-sidebar';
import WelcomeGuide from '../welcome-guide';
import StartTemplateOptions from '../start-template-options';
import { store as editSiteStore } from '../../store';
import { GlobalStylesRenderer } from '../global-styles-renderer';
import useTitle from '../routes/use-title';
import CanvasSpinner from '../canvas-spinner';
import { unlock } from '../../lock-unlock';
import useEditedEntityRecord from '../use-edited-entity-record';
import { SidebarFixedBottomSlot } from '../sidebar-edit-mode/sidebar-fixed-bottom';

const { BlockRemovalWarningModal } = unlock( blockEditorPrivateApis );

const interfaceLabels = {
	/* translators: accessibility text for the editor content landmark region. */
	body: __( 'Editor content' ),
	/* translators: accessibility text for the editor settings landmark region. */
	sidebar: __( 'Editor settings' ),
	/* translators: accessibility text for the editor publish landmark region. */
	actions: __( 'Editor publish' ),
	/* translators: accessibility text for the editor footer landmark region. */
	footer: __( 'Editor footer' ),
};

const typeLabels = {
	wp_template: __( 'Template' ),
	wp_template_part: __( 'Template Part' ),
	wp_block: __( 'Pattern' ),
	wp_navigation: __( 'Navigation' ),
};

// Prevent accidental removal of certain blocks, asking the user for
// confirmation.
const blockRemovalRules = {
	'core/query': __( 'Query Loop displays a list of posts or pages.' ),
	'core/post-content': __(
		'Post Content displays the content of a post or page.'
	),
	'core/post-template': __(
		'Post Template displays each post or page in a Query Loop.'
	),
};

export default function Editor( { isLoading } ) {
	const {
		record: editedPost,
		getTitle,
		isLoaded: hasLoadedPost,
	} = useEditedEntityRecord();

	const { id: editedPostId, type: editedPostType } = editedPost;

	const {
		context,
		editorMode,
		canvasMode,
		blockEditorMode,
		isRightSidebarOpen,
		isInserterOpen,
		isListViewOpen,
		showIconLabels,
		showBlockBreadcrumbs,
		hasPageContentFocus,
	} = useSelect( ( select ) => {
		const {
			getEditedPostContext,
			getEditorMode,
			getCanvasMode,
			isInserterOpened,
			isListViewOpened,
			hasPageContentFocus: _hasPageContentFocus,
		} = unlock( select( editSiteStore ) );
		const { __unstableGetEditorMode } = select( blockEditorStore );
		const { getActiveComplementaryArea } = select( interfaceStore );

		// The currently selected entity to display.
		// Typically template or template part in the site editor.
		return {
			context: getEditedPostContext(),
			editorMode: getEditorMode(),
			canvasMode: getCanvasMode(),
			blockEditorMode: __unstableGetEditorMode(),
			isInserterOpen: isInserterOpened(),
			isListViewOpen: isListViewOpened(),
			isRightSidebarOpen: getActiveComplementaryArea(
				editSiteStore.name
			),
			showIconLabels: select( preferencesStore ).get(
				'core/edit-site',
				'showIconLabels'
			),
			showBlockBreadcrumbs: select( preferencesStore ).get(
				'core/edit-site',
				'showBlockBreadcrumbs'
			),
			hasPageContentFocus: _hasPageContentFocus(),
		};
	}, [] );
	const { setEditedPostContext } = useDispatch( editSiteStore );

	const isViewMode = canvasMode === 'view';
	const isEditMode = canvasMode === 'edit';
	const showVisualEditor = isViewMode || editorMode === 'visual';
	const shouldShowBlockBreadcrumbs =
		showBlockBreadcrumbs &&
		isEditMode &&
		showVisualEditor &&
		blockEditorMode !== 'zoom-out';
	const shouldShowInserter = isEditMode && showVisualEditor && isInserterOpen;
	const shouldShowListView = isEditMode && showVisualEditor && isListViewOpen;
	const secondarySidebarLabel = isListViewOpen
		? __( 'List View' )
		: __( 'Block Library' );
	const blockContext = useMemo( () => {
		const { postType, postId, ...nonPostFields } = context ?? {};
		return {
			...( hasPageContentFocus ? context : nonPostFields ),
			queryContext: [
				context?.queryContext || { page: 1 },
				( newQueryContext ) =>
					setEditedPostContext( {
						...context,
						queryContext: {
							...context?.queryContext,
							...newQueryContext,
						},
					} ),
			],
		};
	}, [ hasPageContentFocus, context, setEditedPostContext ] );

	let title;
	if ( hasLoadedPost ) {
		title = sprintf(
			// translators: A breadcrumb trail in browser tab. %1$s: title of template being edited, %2$s: type of template (Template or Template Part).
			__( '%1$s ‹ %2$s ‹ Editor' ),
			getTitle(),
			typeLabels[ editedPostType ] ?? typeLabels.wp_template
		);
	}

	// Only announce the title once the editor is ready to prevent "Replace"
	// action in <URLQueryController> from double-announcing.
	useTitle( hasLoadedPost && title );

	return (
		<>
			{ isLoading ? <CanvasSpinner /> : null }
			{ isEditMode && <WelcomeGuide /> }
			<EntityProvider kind="root" type="site">
				<EntityProvider
					kind="postType"
					type={ editedPostType }
					id={ editedPostId }
				>
					<BlockContextProvider value={ blockContext }>
						<SidebarComplementaryAreaFills />
						{ isEditMode && <StartTemplateOptions /> }
						<InterfaceSkeleton
							isDistractionFree={ true }
							enableRegionNavigation={ false }
							className={ classnames(
								'edit-site-editor__interface-skeleton',
								{
									'show-icon-labels': showIconLabels,
									'is-loading': isLoading,
								}
							) }
							notices={ <EditorSnackbars /> }
							content={
								<>
									<GlobalStylesRenderer />
									{ isEditMode && <EditorNotices /> }
									{ showVisualEditor && editedPost && (
										<>
											<BlockEditor />
											<BlockRemovalWarningModal
												rules={ blockRemovalRules }
											/>
										</>
									) }
									{ editorMode === 'text' &&
										editedPost &&
										isEditMode && <CodeEditor /> }
									{ hasLoadedPost && ! editedPost && (
										<Notice
											status="warning"
											isDismissible={ false }
										>
											{ __(
												"You attempted to edit an item that doesn't exist. Perhaps it was deleted?"
											) }
										</Notice>
									) }
									{ isEditMode && (
										<KeyboardShortcutsEditMode />
									) }
								</>
							}
							secondarySidebar={
								isEditMode &&
								( ( shouldShowInserter && (
									<InserterSidebar />
								) ) ||
									( shouldShowListView && (
										<ListViewSidebar />
									) ) )
							}
							sidebar={
								isEditMode &&
								isRightSidebarOpen && (
									<>
										<ComplementaryArea.Slot scope="core/edit-site" />
										<SidebarFixedBottomSlot />
									</>
								)
							}
							footer={
								shouldShowBlockBreadcrumbs && (
									<BlockBreadcrumb
										rootLabelText={
											hasPageContentFocus
												? __( 'Page' )
												: __( 'Template' )
										}
									/>
								)
							}
							labels={ {
								...interfaceLabels,
								secondarySidebar: secondarySidebarLabel,
							} }
						/>
					</BlockContextProvider>
				</EntityProvider>
			</EntityProvider>
		</>
	);
}
