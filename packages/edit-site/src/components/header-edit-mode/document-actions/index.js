/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __, isRTL } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	Button,
	VisuallyHidden,
	__experimentalText as Text,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { BlockIcon } from '@wordpress/block-editor';
import { store as commandsStore } from '@wordpress/commands';
import {
	chevronLeftSmall,
	chevronRightSmall,
	page as pageIcon,
	navigation as navigationIcon,
	symbol,
} from '@wordpress/icons';
import { displayShortcut } from '@wordpress/keycodes';
import { useState, useEffect, useRef } from '@wordpress/element';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import useEditedEntityRecord from '../../use-edited-entity-record';
import { store as editSiteStore } from '../../../store';

const typeLabels = {
	wp_block: __( 'Editing pattern:' ),
	wp_navigation: __( 'Editing navigation menu:' ),
	wp_template: __( 'Editing template:' ),
	wp_template_part: __( 'Editing template part:' ),
};

export default function DocumentActions() {
	const isPage = useSelect(
		( select ) => select( editSiteStore ).isPage(),
		[]
	);
	return isPage ? <PageDocumentActions /> : <TemplateDocumentActions />;
}

function PageDocumentActions() {
	const { hasPageContentFocus, hasResolved, isFound, title } = useSelect(
		( select ) => {
			const {
				hasPageContentFocus: _hasPageContentFocus,
				getEditedPostContext,
			} = select( editSiteStore );
			const { getEditedEntityRecord, hasFinishedResolution } =
				select( coreStore );
			const context = getEditedPostContext();
			const queryArgs = [ 'postType', context.postType, context.postId ];
			const page = getEditedEntityRecord( ...queryArgs );
			return {
				hasPageContentFocus: _hasPageContentFocus(),
				hasResolved: hasFinishedResolution(
					'getEditedEntityRecord',
					queryArgs
				),
				isFound: !! page,
				title: page?.title,
			};
		},
		[]
	);

	const { setHasPageContentFocus } = useDispatch( editSiteStore );

	const [ hasEditedTemplate, setHasEditedTemplate ] = useState( false );
	const prevHasPageContentFocus = useRef( false );
	useEffect( () => {
		if ( prevHasPageContentFocus.current && ! hasPageContentFocus ) {
			setHasEditedTemplate( true );
		}
		prevHasPageContentFocus.current = hasPageContentFocus;
	}, [ hasPageContentFocus ] );

	if ( ! hasResolved ) {
		return null;
	}

	if ( ! isFound ) {
		return (
			<div className="edit-site-document-actions">
				{ __( 'Document not found' ) }
			</div>
		);
	}

	return hasPageContentFocus ? (
		<BaseDocumentActions
			className={ classnames( 'is-page', {
				'is-animated': hasEditedTemplate,
			} ) }
			icon={ pageIcon }
		>
			{ title }
		</BaseDocumentActions>
	) : (
		<TemplateDocumentActions
			className="is-animated"
			onBack={ () => setHasPageContentFocus( true ) }
		/>
	);
}

function TemplateDocumentActions( { className, onBack } ) {
	const { isLoaded, record, getTitle, icon } = useEditedEntityRecord();

	if ( ! isLoaded ) {
		return null;
	}

	if ( ! record ) {
		return (
			<div className="edit-site-document-actions">
				{ __( 'Document not found' ) }
			</div>
		);
	}

	let typeIcon = icon;
	if ( record.type === 'wp_navigation' ) {
		typeIcon = navigationIcon;
	} else if ( record.type === 'wp_block' ) {
		typeIcon = symbol;
	}

	return (
		<BaseDocumentActions
			className={ classnames( className, {
				'is-synced-entity':
					record.wp_pattern_sync_status !== 'unsynced',
			} ) }
			icon={ typeIcon }
			onBack={ onBack }
		>
			<VisuallyHidden as="span">
				{ typeLabels[ record.type ] ?? typeLabels.wp_template }
			</VisuallyHidden>
			{ getTitle() }
		</BaseDocumentActions>
	);
}

function BaseDocumentActions( { className, icon, children, onBack } ) {
	const { open: openCommandCenter } = useDispatch( commandsStore );
	return (
		<div
			className={ classnames( 'edit-site-document-actions', className ) }
		>
			{ onBack && (
				<Button
					className="edit-site-document-actions__back"
					icon={ isRTL() ? chevronRightSmall : chevronLeftSmall }
					onClick={ ( event ) => {
						event.stopPropagation();
						onBack();
					} }
				>
					{ __( 'Back' ) }
				</Button>
			) }
			<Button
				className="edit-site-document-actions__command"
				onClick={ () => openCommandCenter() }
			>
				<HStack
					className="edit-site-document-actions__title"
					spacing={ 1 }
					justify="center"
				>
					<BlockIcon icon={ icon } />
					<Text size="body" as="h1">
						{ children }
					</Text>
				</HStack>
				<span className="edit-site-document-actions__shortcut">
					{ displayShortcut.primary( 'k' ) }
				</span>
			</Button>
		</div>
	);
}
