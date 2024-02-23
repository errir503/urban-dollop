/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __, isRTL, sprintf } from '@wordpress/i18n';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	Button,
	__experimentalText as Text,
	__unstableMotion as motion,
	__unstableAnimatePresence as AnimatePresence,
} from '@wordpress/components';
import { BlockIcon } from '@wordpress/block-editor';
import {
	chevronLeftSmall,
	chevronRightSmall,
	page as pageIcon,
	navigation as navigationIcon,
	symbol,
} from '@wordpress/icons';
import { displayShortcut } from '@wordpress/keycodes';
import { store as coreStore } from '@wordpress/core-data';
import { store as commandsStore } from '@wordpress/commands';
import { useRef, useEffect } from '@wordpress/element';
import { useReducedMotion } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { store as editorStore } from '../../store';

const TYPE_LABELS = {
	// translators: 1: Pattern title.
	wp_pattern: __( 'Editing pattern: %s' ),
	// translators: 1: Navigation menu title.
	wp_navigation: __( 'Editing navigation menu: %s' ),
	// translators: 1: Template title.
	wp_template: __( 'Editing template: %s' ),
	// translators: 1: Template part title.
	wp_template_part: __( 'Editing template part: %s' ),
};

const ICONS = {
	wp_block: symbol,
	wp_navigation: navigationIcon,
};

const TEMPLATE_POST_TYPES = [ 'wp_template', 'wp_template_part' ];

const GLOBAL_POST_TYPES = [
	...TEMPLATE_POST_TYPES,
	'wp_block',
	'wp_navigation',
];

const MotionButton = motion( Button );

export default function DocumentBar() {
	const {
		postType,
		document,
		isResolving,
		templateIcon,
		templateTitle,
		onNavigateToPreviousEntityRecord,
	} = useSelect( ( select ) => {
		const {
			getCurrentPostType,
			getCurrentPostId,
			getEditorSettings,
			__experimentalGetTemplateInfo: getTemplateInfo,
		} = select( editorStore );
		const { getEditedEntityRecord, getIsResolving } = select( coreStore );
		const _postType = getCurrentPostType();
		const _postId = getCurrentPostId();
		const _document = getEditedEntityRecord(
			'postType',
			_postType,
			_postId
		);
		const _templateInfo = getTemplateInfo( _document );
		return {
			postType: _postType,
			document: _document,
			isResolving: getIsResolving(
				'getEditedEntityRecord',
				'postType',
				_postType,
				_postId
			),
			templateIcon: _templateInfo.icon,
			templateTitle: _templateInfo.title,
			onNavigateToPreviousEntityRecord:
				getEditorSettings().onNavigateToPreviousEntityRecord,
		};
	}, [] );

	const { open: openCommandCenter } = useDispatch( commandsStore );
	const isReducedMotion = useReducedMotion();

	const isNotFound = ! document && ! isResolving;
	const icon = ICONS[ postType ] ?? pageIcon;
	const isTemplate = TEMPLATE_POST_TYPES.includes( postType );
	const isGlobalEntity = GLOBAL_POST_TYPES.includes( postType );
	const hasBackButton = !! onNavigateToPreviousEntityRecord;
	const title = isTemplate ? templateTitle : document.title;

	const mounted = useRef( false );
	useEffect( () => {
		mounted.current = true;
	}, [] );

	return (
		<div
			className={ classnames( 'editor-document-bar', {
				'has-back-button': hasBackButton,
				'is-global': isGlobalEntity,
			} ) }
		>
			<AnimatePresence>
				{ hasBackButton && (
					<MotionButton
						className="editor-document-bar__back"
						icon={ isRTL() ? chevronRightSmall : chevronLeftSmall }
						onClick={ ( event ) => {
							event.stopPropagation();
							onNavigateToPreviousEntityRecord();
						} }
						size="compact"
						initial={
							mounted.current
								? { opacity: 0, transform: 'translateX(15%)' }
								: false // Don't show entry animation when DocumentBar mounts.
						}
						animate={ { opacity: 1, transform: 'translateX(0%)' } }
						exit={ { opacity: 0, transform: 'translateX(15%)' } }
						transition={
							isReducedMotion ? { duration: 0 } : undefined
						}
					>
						{ __( 'Back' ) }
					</MotionButton>
				) }
			</AnimatePresence>
			{ isNotFound ? (
				<Text>{ __( 'Document not found' ) }</Text>
			) : (
				<Button
					className="editor-document-bar__command"
					onClick={ () => openCommandCenter() }
					size="compact"
				>
					<motion.div
						className="editor-document-bar__title"
						// Force entry animation when the back button is added or removed.
						key={ hasBackButton }
						initial={
							mounted.current
								? {
										opacity: 0,
										transform: hasBackButton
											? 'translateX(15%)'
											: 'translateX(-15%)',
								  }
								: false // Don't show entry animation when DocumentBar mounts.
						}
						animate={ {
							opacity: 1,
							transform: 'translateX(0%)',
						} }
						transition={
							isReducedMotion ? { duration: 0 } : undefined
						}
					>
						<BlockIcon icon={ isTemplate ? templateIcon : icon } />
						<Text
							size="body"
							as="h1"
							aria-label={
								TYPE_LABELS[ postType ]
									? // eslint-disable-next-line @wordpress/valid-sprintf
									  sprintf( TYPE_LABELS[ postType ], title )
									: undefined
							}
						>
							{ title }
						</Text>
					</motion.div>
					<span className="editor-document-bar__shortcut">
						{ displayShortcut.primary( 'k' ) }
					</span>
				</Button>
			) }
		</div>
	);
}
