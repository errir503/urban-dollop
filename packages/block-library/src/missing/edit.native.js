/**
 * External dependencies
 */
import {
	View,
	Text,
	TouchableWithoutFeedback,
	TouchableOpacity,
} from 'react-native';

/**
 * WordPress dependencies
 */
import { Icon } from '@wordpress/components';
import { compose, withPreferredColorScheme } from '@wordpress/compose';
import { coreBlocks } from '@wordpress/block-library';
import { normalizeIconObject } from '@wordpress/blocks';
import { Component } from '@wordpress/element';
import { __, _x, sprintf } from '@wordpress/i18n';
import { help, plugins } from '@wordpress/icons';
import { withSelect, withDispatch } from '@wordpress/data';
import { applyFilters } from '@wordpress/hooks';
import {
	UnsupportedBlockDetails,
	store as blockEditorStore,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import styles from './style.scss';

// Blocks that can't be edited through the Unsupported block editor identified by their name.
const UBE_INCOMPATIBLE_BLOCKS = [ 'core/block' ];
const I18N_BLOCK_SCHEMA_TITLE = 'block title';

export class UnsupportedBlockEdit extends Component {
	constructor( props ) {
		super( props );
		this.state = { showHelp: false };
		this.toggleSheet = this.toggleSheet.bind( this );
		this.closeSheet = this.closeSheet.bind( this );
		this.requestFallback = this.requestFallback.bind( this );
		this.onHelpButtonPressed = this.onHelpButtonPressed.bind( this );
	}

	toggleSheet() {
		this.setState( {
			showHelp: ! this.state.showHelp,
		} );
	}

	closeSheet() {
		this.setState( {
			showHelp: false,
		} );
	}

	componentWillUnmount() {
		if ( this.timeout ) {
			clearTimeout( this.timeout );
		}
	}

	getTitle() {
		const { originalName } = this.props.attributes;
		const blockType = coreBlocks[ originalName ];
		const title = blockType?.metadata.title;
		const textdomain = blockType?.metadata.textdomain;

		return title && textdomain
			? // eslint-disable-next-line @wordpress/i18n-no-variables, @wordpress/i18n-text-domain
			  _x( title, I18N_BLOCK_SCHEMA_TITLE, textdomain )
			: originalName;
	}

	renderHelpIcon() {
		const infoIconStyle = this.props.getStylesFromColorScheme(
			styles.infoIcon,
			styles.infoIconDark
		);

		return (
			<TouchableOpacity
				onPress={ this.onHelpButtonPressed }
				style={ styles.helpIconContainer }
				accessibilityLabel={ __( 'Help button' ) }
				accessibilityRole={ 'button' }
				accessibilityHint={ __( 'Tap here to show help' ) }
			>
				<Icon
					className="unsupported-icon-help"
					label={ __( 'Help icon' ) }
					icon={ help }
					fill={ infoIconStyle.color }
				/>
			</TouchableOpacity>
		);
	}

	onHelpButtonPressed() {
		if ( ! this.props.isSelected ) {
			this.props.selectBlock();
		}
		this.toggleSheet();
	}

	requestFallback() {
		if (
			this.props.canEnableUnsupportedBlockEditor &&
			this.props.isUnsupportedBlockEditorSupported === false
		) {
			this.toggleSheet();
			this.setState( { sendButtonPressMessage: true } );
		} else {
			this.toggleSheet();
			this.setState( { sendFallbackMessage: true } );
		}
	}

	renderSheet( blockTitle, blockName ) {
		const { clientId } = this.props;
		const { showHelp } = this.state;
		/* translators: Missing block alert title. %s: The localized block name */
		const titleFormat = __( "'%s' is not fully-supported" );
		const title = sprintf( titleFormat, blockTitle );
		const description = applyFilters(
			'native.missing_block_detail',
			__( 'We are working hard to add more blocks with each release.' ),
			blockName
		);

		return (
			<UnsupportedBlockDetails
				clientId={ clientId }
				showSheet={ showHelp }
				onCloseSheet={ this.closeSheet }
				customBlockTitle={ blockTitle }
				title={ title }
				description={ description }
			/>
		);
	}

	render() {
		const { originalName } = this.props.attributes;
		const { getStylesFromColorScheme, preferredColorScheme } = this.props;
		const blockType = coreBlocks[ originalName ];

		const title = this.getTitle();
		const titleStyle = getStylesFromColorScheme(
			styles.unsupportedBlockMessage,
			styles.unsupportedBlockMessageDark
		);

		const subTitleStyle = getStylesFromColorScheme(
			styles.unsupportedBlockSubtitle,
			styles.unsupportedBlockSubtitleDark
		);

		const subtitle = (
			<Text style={ subTitleStyle }>{ __( 'Unsupported' ) }</Text>
		);

		const icon = blockType
			? normalizeIconObject( blockType.settings.icon )
			: plugins;
		const iconStyle = getStylesFromColorScheme(
			styles.unsupportedBlockIcon,
			styles.unsupportedBlockIconDark
		);
		const iconClassName = 'unsupported-icon' + '-' + preferredColorScheme;
		return (
			<TouchableWithoutFeedback
				disabled={ ! this.props.isSelected }
				accessibilityLabel={ __( 'Help button' ) }
				accessibilityRole={ 'button' }
				accessibilityHint={ __( 'Tap here to show help' ) }
				onPress={ this.toggleSheet }
			>
				<View
					style={ getStylesFromColorScheme(
						styles.unsupportedBlock,
						styles.unsupportedBlockDark
					) }
				>
					{ this.renderHelpIcon() }
					<View style={ styles.unsupportedBlockHeader }>
						<Icon
							className={ iconClassName }
							icon={ icon && icon.src ? icon.src : icon }
							fill={ iconStyle.color }
						/>
						<Text style={ titleStyle }>{ title }</Text>
					</View>
					{ subtitle }
					{ this.renderSheet( title, originalName ) }
				</View>
			</TouchableWithoutFeedback>
		);
	}
}

export default compose( [
	withSelect( ( select, { attributes } ) => {
		const { capabilities } = select( blockEditorStore ).getSettings();
		return {
			isUnsupportedBlockEditorSupported:
				capabilities?.unsupportedBlockEditor === true,
			canEnableUnsupportedBlockEditor:
				capabilities?.canEnableUnsupportedBlockEditor === true,
			isEditableInUnsupportedBlockEditor:
				! UBE_INCOMPATIBLE_BLOCKS.includes( attributes.originalName ),
		};
	} ),
	withDispatch( ( dispatch, ownProps ) => {
		const { selectBlock } = dispatch( blockEditorStore );
		return {
			selectBlock() {
				selectBlock( ownProps.clientId );
			},
		};
	} ),
	withPreferredColorScheme,
] )( UnsupportedBlockEdit );
