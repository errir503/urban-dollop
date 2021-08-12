/**
 * External dependencies
 */
import memize from 'memize';

/**
 * WordPress dependencies
 */
import RNReactNativeGutenbergBridge, {
	subscribeParentGetHtml,
	subscribeParentToggleHTMLMode,
	subscribeUpdateHtml,
	subscribeSetTitle,
	subscribeMediaAppend,
	subscribeReplaceBlock,
	subscribeUpdateEditorSettings,
	subscribeUpdateCapabilities,
	subscribeShowNotice,
	subscribeShowEditorHelp,
} from '@wordpress/react-native-bridge';
import { Component } from '@wordpress/element';
import { count as wordCount } from '@wordpress/wordcount';
import {
	parse,
	serialize,
	getUnregisteredTypeHandlerName,
	createBlock,
} from '@wordpress/blocks';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose } from '@wordpress/compose';
import { applyFilters } from '@wordpress/hooks';
import {
	validateThemeColors,
	validateThemeGradients,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { getGlobalStyles } from '@wordpress/components';

const postTypeEntities = [
	{ name: 'post', baseURL: '/wp/v2/posts' },
	{ name: 'page', baseURL: '/wp/v2/pages' },
	{ name: 'attachment', baseURL: '/wp/v2/media' },
	{ name: 'wp_block', baseURL: '/wp/v2/blocks' },
].map( ( postTypeEntity ) => ( {
	kind: 'postType',
	...postTypeEntity,
	transientEdits: {
		blocks: true,
		selection: true,
	},
	mergedEdits: {
		meta: true,
	},
} ) );

/**
 * Internal dependencies
 */
import EditorProvider from './index.js';

class NativeEditorProvider extends Component {
	constructor() {
		super( ...arguments );

		// Keep a local reference to `post` to detect changes
		this.post = this.props.post;
		this.props.addEntities( postTypeEntities );
		this.props.receiveEntityRecords(
			'postType',
			this.post.type,
			this.post
		);
		this.getEditorSettings = memize(
			( settings, capabilities ) => ( {
				...settings,
				capabilities,
			} ),
			{
				maxSize: 1,
			}
		);
	}

	componentDidMount() {
		const { capabilities, updateSettings } = this.props;

		updateSettings( {
			...capabilities,
			...this.getThemeColors( this.props ),
		} );

		this.subscriptionParentGetHtml = subscribeParentGetHtml( () => {
			this.serializeToNativeAction();
		} );

		this.subscriptionParentToggleHTMLMode = subscribeParentToggleHTMLMode(
			() => {
				this.toggleMode();
			}
		);

		this.subscriptionParentSetTitle = subscribeSetTitle( ( payload ) => {
			this.props.editTitle( payload.title );
		} );

		this.subscriptionParentUpdateHtml = subscribeUpdateHtml(
			( payload ) => {
				this.updateHtmlAction( payload.html );
			}
		);

		this.subscriptionParentReplaceBlock = subscribeReplaceBlock(
			( payload ) => {
				this.replaceBlockAction( payload.html, payload.clientId );
			}
		);

		this.subscriptionParentMediaAppend = subscribeMediaAppend(
			( payload ) => {
				const blockName = 'core/' + payload.mediaType;
				const newBlock = createBlock( blockName, {
					id: payload.mediaId,
					[ payload.mediaType === 'image'
						? 'url'
						: 'src' ]: payload.mediaUrl,
				} );

				const indexAfterSelected = this.props.selectedBlockIndex + 1;
				const insertionIndex =
					indexAfterSelected || this.props.blockCount;

				this.props.insertBlock( newBlock, insertionIndex );
			}
		);

		this.subscriptionParentUpdateEditorSettings = subscribeUpdateEditorSettings(
			( editorSettings ) => {
				const themeColors = this.getThemeColors( editorSettings );
				updateSettings( themeColors );
			}
		);

		this.subscriptionParentUpdateCapabilities = subscribeUpdateCapabilities(
			( payload ) => {
				this.updateCapabilitiesAction( payload );
			}
		);

		this.subscriptionParentShowNotice = subscribeShowNotice(
			( payload ) => {
				this.props.createSuccessNotice( payload.message );
			}
		);

		this.subscriptionParentShowEditorHelp = subscribeShowEditorHelp( () => {
			// Temporary: feature hidden from production. This is just here for testing
			// purposes and will be replaced with actual logic in a later PR.
			this.props.createSuccessNotice(
				'Show Editor Help request received by JS!'
			);
		} );
	}

	componentWillUnmount() {
		if ( this.subscriptionParentGetHtml ) {
			this.subscriptionParentGetHtml.remove();
		}

		if ( this.subscriptionParentToggleHTMLMode ) {
			this.subscriptionParentToggleHTMLMode.remove();
		}

		if ( this.subscriptionParentSetTitle ) {
			this.subscriptionParentSetTitle.remove();
		}

		if ( this.subscriptionParentUpdateHtml ) {
			this.subscriptionParentUpdateHtml.remove();
		}

		if ( this.subscriptionParentReplaceBlock ) {
			this.subscriptionParentReplaceBlock.remove();
		}

		if ( this.subscriptionParentMediaAppend ) {
			this.subscriptionParentMediaAppend.remove();
		}

		if ( this.subscriptionParentUpdateEditorSettings ) {
			this.subscriptionParentUpdateEditorSettings.remove();
		}

		if ( this.subscriptionParentUpdateCapabilities ) {
			this.subscriptionParentUpdateCapabilities.remove();
		}

		if ( this.subscriptionParentShowNotice ) {
			this.subscriptionParentShowNotice.remove();
		}

		if ( this.subscriptionParentShowEditorHelp ) {
			this.subscriptionParentShowEditorHelp.remove();
		}
	}

	getThemeColors( { colors, gradients, rawStyles, rawFeatures } ) {
		return {
			...( rawStyles
				? getGlobalStyles( rawStyles, rawFeatures, colors, gradients )
				: {
						colors: validateThemeColors( colors ),
						gradients: validateThemeGradients( gradients ),
				  } ),
		};
	}

	componentDidUpdate( prevProps ) {
		if ( ! prevProps.isReady && this.props.isReady ) {
			const blocks = this.props.blocks;
			const isUnsupportedBlock = ( { name } ) =>
				name === getUnregisteredTypeHandlerName();
			const unsupportedBlockNames = blocks
				.filter( isUnsupportedBlock )
				.map( ( block ) => block.attributes.originalName );
			RNReactNativeGutenbergBridge.editorDidMount(
				unsupportedBlockNames
			);
		}
	}

	serializeToNativeAction() {
		const title = this.props.title;
		let html;

		if ( this.props.mode === 'text' ) {
			// The HTMLTextInput component does not update the store when user is doing changes
			// Let's request the HTML from the component's state directly
			html = applyFilters( 'native.persist-html' );
		} else {
			html = serialize( this.props.blocks );
		}

		const hasChanges =
			title !== this.post.title.raw || html !== this.post.content.raw;

		// Variable to store the content structure metrics.
		const contentInfo = {};
		contentInfo.characterCount = wordCount(
			html,
			'characters_including_spaces'
		);
		contentInfo.wordCount = wordCount( html, 'words' );
		contentInfo.paragraphCount = this.props.paragraphCount;
		contentInfo.blockCount = this.props.blockCount;
		RNReactNativeGutenbergBridge.provideToNative_Html(
			html,
			title,
			hasChanges,
			contentInfo
		);

		if ( hasChanges ) {
			this.post.title.raw = title;
			this.post.content.raw = html;
		}
	}

	updateHtmlAction( html ) {
		const parsed = parse( html );
		this.props.resetEditorBlocksWithoutUndoLevel( parsed );
	}

	replaceBlockAction( html, blockClientId ) {
		const parsed = parse( html );
		this.props.replaceBlock( blockClientId, parsed );
	}

	toggleMode() {
		const { mode, switchMode } = this.props;
		// refresh html content first
		this.serializeToNativeAction();
		// make sure to blur the selected block and dismiss the keyboard
		this.props.clearSelectedBlock();
		switchMode( mode === 'visual' ? 'text' : 'visual' );
	}

	updateCapabilitiesAction( capabilities ) {
		this.props.updateSettings( capabilities );
	}

	render() {
		const {
			children,
			post, // eslint-disable-line no-unused-vars
			capabilities,
			settings,
			...props
		} = this.props;
		const editorSettings = this.getEditorSettings( settings, capabilities );

		return (
			<EditorProvider
				post={ this.post }
				settings={ editorSettings }
				{ ...props }
			>
				{ children }
			</EditorProvider>
		);
	}
}

export default compose( [
	withSelect( ( select ) => {
		const {
			__unstableIsEditorReady: isEditorReady,
			getEditorBlocks,
			getEditedPostAttribute,
			getEditedPostContent,
		} = select( 'core/editor' );
		const { getEditorMode } = select( 'core/edit-post' );

		const {
			getBlockIndex,
			getSelectedBlockClientId,
			getGlobalBlockCount,
		} = select( blockEditorStore );

		const selectedBlockClientId = getSelectedBlockClientId();
		return {
			mode: getEditorMode(),
			isReady: isEditorReady(),
			blocks: getEditorBlocks(),
			title: getEditedPostAttribute( 'title' ),
			getEditedPostContent,
			selectedBlockIndex: getBlockIndex( selectedBlockClientId ),
			blockCount: getGlobalBlockCount(),
			paragraphCount: getGlobalBlockCount( 'core/paragraph' ),
		};
	} ),
	withDispatch( ( dispatch ) => {
		const { editPost, resetEditorBlocks } = dispatch( 'core/editor' );
		const {
			updateSettings,
			clearSelectedBlock,
			insertBlock,
			replaceBlock,
		} = dispatch( blockEditorStore );
		const { switchEditorMode } = dispatch( 'core/edit-post' );
		const { addEntities, receiveEntityRecords } = dispatch( 'core' );
		const { createSuccessNotice } = dispatch( 'core/notices' );

		return {
			updateSettings,
			addEntities,
			clearSelectedBlock,
			insertBlock,
			createSuccessNotice,
			editTitle( title ) {
				editPost( { title } );
			},
			receiveEntityRecords,
			resetEditorBlocksWithoutUndoLevel( blocks ) {
				resetEditorBlocks( blocks, {
					__unstableShouldCreateUndoLevel: false,
				} );
			},
			switchMode( mode ) {
				switchEditorMode( mode );
			},
			replaceBlock,
		};
	} ),
] )( NativeEditorProvider );
