/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { useContext, useMemo } from '@wordpress/element';
import { privateApis as blockEditorPrivateApis } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { unlock } from '../../../lock-unlock';

const SITE_EDITOR_AUTHORS_QUERY = {
	per_page: -1,
	_fields: 'id,name,avatar_urls',
	context: 'view',
	capabilities: [ 'edit_theme_options' ],
};
const EMPTY_ARRAY = [];
const { GlobalStylesContext } = unlock( blockEditorPrivateApis );
export default function useGlobalStylesRevisions() {
	const { user: userConfig } = useContext( GlobalStylesContext );
	const {
		authors,
		currentUser,
		isDirty,
		revisions,
		isLoadingGlobalStylesRevisions,
	} = useSelect( ( select ) => {
		const {
			__experimentalGetDirtyEntityRecords,
			getCurrentUser,
			getUsers,
			getRevisions,
			__experimentalGetCurrentGlobalStylesId,
			isResolving,
		} = select( coreStore );
		const dirtyEntityRecords = __experimentalGetDirtyEntityRecords();
		const _currentUser = getCurrentUser();
		const _isDirty = dirtyEntityRecords.length > 0;
		const query = {
			per_page: 100,
		};
		const globalStylesId = __experimentalGetCurrentGlobalStylesId();
		const globalStylesRevisions =
			getRevisions( 'root', 'globalStyles', globalStylesId, query ) ||
			EMPTY_ARRAY;
		const _authors = getUsers( SITE_EDITOR_AUTHORS_QUERY ) || EMPTY_ARRAY;
		const _isResolving = isResolving( 'getRevisions', [
			'root',
			'globalStyles',
			globalStylesId,
			query,
		] );
		return {
			authors: _authors,
			currentUser: _currentUser,
			isDirty: _isDirty,
			revisions: globalStylesRevisions,
			isLoadingGlobalStylesRevisions: _isResolving,
		};
	}, [] );
	return useMemo( () => {
		let _modifiedRevisions = [];
		if ( ! authors.length || isLoadingGlobalStylesRevisions ) {
			return {
				revisions: _modifiedRevisions,
				hasUnsavedChanges: isDirty,
				isLoading: true,
			};
		}

		// Adds author details to each revision.
		_modifiedRevisions = revisions.map( ( revision ) => {
			return {
				...revision,
				author: authors.find(
					( author ) => author.id === revision.author
				),
			};
		} );

		if ( _modifiedRevisions.length ) {
			// Flags the most current saved revision.
			if ( _modifiedRevisions[ 0 ].id !== 'unsaved' ) {
				_modifiedRevisions[ 0 ].isLatest = true;
			}

			// Adds an item for unsaved changes.
			if (
				isDirty &&
				userConfig &&
				Object.keys( userConfig ).length > 0 &&
				currentUser
			) {
				const unsavedRevision = {
					id: 'unsaved',
					styles: userConfig?.styles,
					settings: userConfig?.settings,
					author: {
						name: currentUser?.name,
						avatar_urls: currentUser?.avatar_urls,
					},
					modified: new Date(),
				};

				_modifiedRevisions.unshift( unsavedRevision );
			}

			_modifiedRevisions.push( {
				id: 'parent',
				styles: {},
				settings: {},
			} );
		}

		return {
			revisions: _modifiedRevisions,
			hasUnsavedChanges: isDirty,
			isLoading: false,
		};
	}, [
		isDirty,
		revisions,
		currentUser,
		authors,
		userConfig,
		isLoadingGlobalStylesRevisions,
	] );
}
