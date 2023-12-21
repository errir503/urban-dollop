/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import {
	Button,
	__experimentalUseNavigator as useNavigator,
	__experimentalConfirmDialog as ConfirmDialog,
	Spinner,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useContext, useState, useEffect } from '@wordpress/element';
import {
	privateApis as blockEditorPrivateApis,
	store as blockEditorStore,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import ScreenHeader from '../header';
import { unlock } from '../../../lock-unlock';
import Revisions from '../../revisions';
import SidebarFixedBottom from '../../sidebar-edit-mode/sidebar-fixed-bottom';
import { store as editSiteStore } from '../../../store';
import useGlobalStylesRevisions from './use-global-styles-revisions';
import RevisionsButtons from './revisions-buttons';
import StyleBook from '../../style-book';

const { GlobalStylesContext, areGlobalStyleConfigsEqual } = unlock(
	blockEditorPrivateApis
);

function ScreenRevisions() {
	const { goTo } = useNavigator();
	const { user: currentEditorGlobalStyles, setUserConfig } =
		useContext( GlobalStylesContext );
	const { blocks, editorCanvasContainerView, revisionsCount } = useSelect(
		( select ) => {
			const {
				getEntityRecord,
				__experimentalGetCurrentGlobalStylesId,
				__experimentalGetDirtyEntityRecords,
			} = select( coreStore );
			const isDirty = __experimentalGetDirtyEntityRecords().length > 0;
			const globalStylesId = __experimentalGetCurrentGlobalStylesId();
			const globalStyles = globalStylesId
				? getEntityRecord( 'root', 'globalStyles', globalStylesId )
				: undefined;
			let _revisionsCount =
				globalStyles?._links?.[ 'version-history' ]?.[ 0 ]?.count || 0;
			// one for the reset item.
			_revisionsCount++;
			// one for any dirty changes (unsaved).
			if ( isDirty ) {
				_revisionsCount++;
			}
			return {
				editorCanvasContainerView: unlock(
					select( editSiteStore )
				).getEditorCanvasContainerView(),
				blocks: select( blockEditorStore ).getBlocks(),
				revisionsCount: _revisionsCount,
			};
		},
		[]
	);
	const { revisions, isLoading, hasUnsavedChanges } =
		useGlobalStylesRevisions();
	const [ currentlySelectedRevision, setCurrentlySelectedRevision ] =
		useState( currentEditorGlobalStyles );
	const [
		isLoadingRevisionWithUnsavedChanges,
		setIsLoadingRevisionWithUnsavedChanges,
	] = useState( false );
	const { setEditorCanvasContainerView } = unlock(
		useDispatch( editSiteStore )
	);
	const selectedRevisionMatchesEditorStyles = areGlobalStyleConfigsEqual(
		currentlySelectedRevision,
		currentEditorGlobalStyles
	);

	const onCloseRevisions = () => {
		goTo( '/' ); // Return to global styles main panel.
		setEditorCanvasContainerView( undefined );
	};

	const restoreRevision = ( revision ) => {
		setUserConfig( () => ( {
			styles: revision?.styles,
			settings: revision?.settings,
		} ) );
		setIsLoadingRevisionWithUnsavedChanges( false );
		onCloseRevisions();
	};

	const selectRevision = ( revision ) => {
		setCurrentlySelectedRevision( {
			styles: revision?.styles || {},
			settings: revision?.settings || {},
			id: revision?.id,
		} );
	};

	useEffect( () => {
		if (
			! editorCanvasContainerView ||
			! editorCanvasContainerView.startsWith( 'global-styles-revisions' )
		) {
			goTo( '/' ); // Return to global styles main panel.
			setEditorCanvasContainerView( editorCanvasContainerView );
		}
	}, [ editorCanvasContainerView ] );

	const firstRevision = revisions[ 0 ];
	const currentlySelectedRevisionId = currentlySelectedRevision?.id;
	const shouldSelectFirstItem =
		!! firstRevision?.id &&
		! selectedRevisionMatchesEditorStyles &&
		! currentlySelectedRevisionId;

	useEffect( () => {
		/*
		 * Ensure that the first item is selected and loaded into the preview pane
		 * when no revision is selected and the selected styles don't match the current editor styles.
		 * This is required in case editor styles are changed outside the revisions panel,
		 * e.g., via the reset styles function of useGlobalStylesReset().
		 * See: https://github.com/WordPress/gutenberg/issues/55866
		 */
		if ( shouldSelectFirstItem ) {
			setCurrentlySelectedRevision( {
				styles: firstRevision?.styles || {},
				settings: firstRevision?.settings || {},
				id: firstRevision?.id,
			} );
		}
	}, [ shouldSelectFirstItem, firstRevision ] );

	// Only display load button if there is a revision to load,
	// and it is different from the current editor styles.
	const isLoadButtonEnabled =
		!! currentlySelectedRevisionId && ! selectedRevisionMatchesEditorStyles;
	const shouldShowRevisions = ! isLoading && revisions.length;

	return (
		<>
			<ScreenHeader
				title={
					revisionsCount &&
					// translators: %s: number of revisions.
					sprintf( __( 'Revisions (%s)' ), revisionsCount )
				}
				description={ __(
					'Click on previously saved styles to preview them. To restore a selected version to the editor, hit "Apply." When you\'re ready, use the Save button to save your changes.'
				) }
				onBack={ onCloseRevisions }
			/>
			{ isLoading && (
				<Spinner className="edit-site-global-styles-screen-revisions__loading" />
			) }
			{ editorCanvasContainerView ===
			'global-styles-revisions:style-book' ? (
				<StyleBook
					userConfig={ currentlySelectedRevision }
					isSelected={ () => {} }
					onClose={ () => {
						setEditorCanvasContainerView(
							'global-styles-revisions'
						);
					} }
				/>
			) : (
				<Revisions
					blocks={ blocks }
					userConfig={ currentlySelectedRevision }
					closeButtonLabel={ __( 'Close revisions' ) }
				/>
			) }
			{ shouldShowRevisions && (
				<>
					<div className="edit-site-global-styles-screen-revisions">
						<RevisionsButtons
							onChange={ selectRevision }
							selectedRevisionId={ currentlySelectedRevisionId }
							userRevisions={ revisions }
							canApplyRevision={ isLoadButtonEnabled }
						/>
						{ isLoadButtonEnabled && (
							<SidebarFixedBottom>
								<Button
									variant="primary"
									className="edit-site-global-styles-screen-revisions__button"
									disabled={
										! currentlySelectedRevisionId ||
										currentlySelectedRevisionId ===
											'unsaved'
									}
									onClick={ () => {
										if ( hasUnsavedChanges ) {
											setIsLoadingRevisionWithUnsavedChanges(
												true
											);
										} else {
											restoreRevision(
												currentlySelectedRevision
											);
										}
									} }
								>
									{ currentlySelectedRevisionId === 'parent'
										? __( 'Reset to defaults' )
										: __( 'Apply' ) }
								</Button>
							</SidebarFixedBottom>
						) }
					</div>
					{ isLoadingRevisionWithUnsavedChanges && (
						<ConfirmDialog
							isOpen={ isLoadingRevisionWithUnsavedChanges }
							confirmButtonText={ __( 'Apply' ) }
							onConfirm={ () =>
								restoreRevision( currentlySelectedRevision )
							}
							onCancel={ () =>
								setIsLoadingRevisionWithUnsavedChanges( false )
							}
						>
							{ __(
								'Any unsaved changes will be lost when you apply this revision.'
							) }
						</ConfirmDialog>
					) }
				</>
			) }
		</>
	);
}

export default ScreenRevisions;
