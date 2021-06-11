/**
 * External dependencies
 */
import { once, uniqueId, omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { useCallback, useEffect, useRef } from '@wordpress/element';
import { ifCondition, usePrevious } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { parse } from '@wordpress/blocks';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import AutosaveMonitor from '../autosave-monitor';
import { localAutosaveGet, localAutosaveClear } from '../../store/controls';

const requestIdleCallback = window.requestIdleCallback
	? window.requestIdleCallback
	: window.requestAnimationFrame;

/**
 * Function which returns true if the current environment supports browser
 * sessionStorage, or false otherwise. The result of this function is cached and
 * reused in subsequent invocations.
 */
const hasSessionStorageSupport = once( () => {
	try {
		// Private Browsing in Safari 10 and earlier will throw an error when
		// attempting to set into sessionStorage. The test here is intentional in
		// causing a thrown error as condition bailing from local autosave.
		window.sessionStorage.setItem( '__wpEditorTestSessionStorage', '' );
		window.sessionStorage.removeItem( '__wpEditorTestSessionStorage' );
		return true;
	} catch ( error ) {
		return false;
	}
} );

/**
 * Custom hook which manages the creation of a notice prompting the user to
 * restore a local autosave, if one exists.
 */
function useAutosaveNotice() {
	const { postId, isEditedPostNew, hasRemoteAutosave } = useSelect(
		( select ) => ( {
			postId: select( 'core/editor' ).getCurrentPostId(),
			isEditedPostNew: select( 'core/editor' ).isEditedPostNew(),
			getEditedPostAttribute: select( 'core/editor' )
				.getEditedPostAttribute,
			hasRemoteAutosave: !! select( 'core/editor' ).getEditorSettings()
				.autosave,
		} ),
		[]
	);
	const { getEditedPostAttribute } = useSelect( 'core/editor' );

	const { createWarningNotice, removeNotice } = useDispatch( noticesStore );
	const { editPost, resetEditorBlocks } = useDispatch( 'core/editor' );

	useEffect( () => {
		let localAutosave = localAutosaveGet( postId, isEditedPostNew );
		if ( ! localAutosave ) {
			return;
		}

		try {
			localAutosave = JSON.parse( localAutosave );
		} catch ( error ) {
			// Not usable if it can't be parsed.
			return;
		}

		const { post_title: title, content, excerpt } = localAutosave;
		const edits = { title, content, excerpt };

		{
			// Only display a notice if there is a difference between what has been
			// saved and that which is stored in sessionStorage.
			const hasDifference = Object.keys( edits ).some( ( key ) => {
				return edits[ key ] !== getEditedPostAttribute( key );
			} );

			if ( ! hasDifference ) {
				// If there is no difference, it can be safely ejected from storage.
				localAutosaveClear( postId, isEditedPostNew );
				return;
			}
		}

		if ( hasRemoteAutosave ) {
			return;
		}

		const noticeId = uniqueId( 'wpEditorAutosaveRestore' );
		createWarningNotice(
			__(
				'The backup of this post in your browser is different from the version below.'
			),
			{
				id: noticeId,
				actions: [
					{
						label: __( 'Restore the backup' ),
						onClick() {
							editPost( omit( edits, [ 'content' ] ) );
							resetEditorBlocks( parse( edits.content ) );
							removeNotice( noticeId );
						},
					},
				],
			}
		);
	}, [ isEditedPostNew, postId ] );
}

/**
 * Custom hook which ejects a local autosave after a successful save occurs.
 */
function useAutosavePurge() {
	const {
		postId,
		isEditedPostNew,
		isDirty,
		isAutosaving,
		didError,
	} = useSelect(
		( select ) => ( {
			postId: select( 'core/editor' ).getCurrentPostId(),
			isEditedPostNew: select( 'core/editor' ).isEditedPostNew(),
			isDirty: select( 'core/editor' ).isEditedPostDirty(),
			isAutosaving: select( 'core/editor' ).isAutosavingPost(),
			didError: select( 'core/editor' ).didPostSaveRequestFail(),
		} ),
		[]
	);

	const lastIsDirty = useRef( isDirty );
	const lastIsAutosaving = useRef( isAutosaving );

	useEffect( () => {
		if (
			! didError &&
			( ( lastIsAutosaving.current && ! isAutosaving ) ||
				( lastIsDirty.current && ! isDirty ) )
		) {
			localAutosaveClear( postId, isEditedPostNew );
		}

		lastIsDirty.current = isDirty;
		lastIsAutosaving.current = isAutosaving;
	}, [ isDirty, isAutosaving, didError ] );

	// Once the isEditedPostNew changes from true to false, let's clear the auto-draft autosave.
	const wasEditedPostNew = usePrevious( isEditedPostNew );
	const prevPostId = usePrevious( postId );
	useEffect( () => {
		if ( prevPostId === postId && wasEditedPostNew && ! isEditedPostNew ) {
			localAutosaveClear( postId, true );
		}
	}, [ isEditedPostNew, postId ] );
}

function LocalAutosaveMonitor() {
	const { autosave } = useDispatch( 'core/editor' );
	const deferedAutosave = useCallback( () => {
		requestIdleCallback( () => autosave( { local: true } ) );
	}, [] );
	useAutosaveNotice();
	useAutosavePurge();

	const { localAutosaveInterval } = useSelect(
		( select ) => ( {
			localAutosaveInterval: select( 'core/editor' ).getEditorSettings()
				.__experimentalLocalAutosaveInterval,
		} ),
		[]
	);

	return (
		<AutosaveMonitor
			interval={ localAutosaveInterval }
			autosave={ deferedAutosave }
		/>
	);
}

export default ifCondition( hasSessionStorageSupport )( LocalAutosaveMonitor );
