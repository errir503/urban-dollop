/**
 * External dependencies
 */
import { size } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { speak } from '@wordpress/a11y';
import { __, _x, sprintf } from '@wordpress/i18n';
import { Dropdown, Button } from '@wordpress/components';
import { Component } from '@wordpress/element';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose, ifCondition } from '@wordpress/compose';
import { createBlock, store as blocksStore } from '@wordpress/blocks';
import { plus } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import InserterMenu from './menu';
import QuickInserter from './quick-inserter';
import { store as blockEditorStore } from '../../store';

const defaultRenderToggle = ( {
	onToggle,
	disabled,
	isOpen,
	blockTitle,
	hasSingleBlockType,
	toggleProps = {},
} ) => {
	let label;
	if ( hasSingleBlockType ) {
		label = sprintf(
			// translators: %s: the name of the block when there is only one
			_x( 'Add %s', 'directly add the only allowed block' ),
			blockTitle
		);
	} else {
		label = _x( 'Add block', 'Generic label for block inserter button' );
	}

	const { onClick, ...rest } = toggleProps;

	// Handle both onClick functions from the toggle and the parent component
	function handleClick( event ) {
		if ( onToggle ) {
			onToggle( event );
		}
		if ( onClick ) {
			onClick( event );
		}
	}

	return (
		<Button
			icon={ plus }
			label={ label }
			tooltipPosition="bottom"
			onClick={ handleClick }
			className="block-editor-inserter__toggle"
			aria-haspopup={ ! hasSingleBlockType ? 'true' : false }
			aria-expanded={ ! hasSingleBlockType ? isOpen : false }
			disabled={ disabled }
			{ ...rest }
		/>
	);
};

class Inserter extends Component {
	constructor() {
		super( ...arguments );

		this.onToggle = this.onToggle.bind( this );
		this.renderToggle = this.renderToggle.bind( this );
		this.renderContent = this.renderContent.bind( this );
	}

	onToggle( isOpen ) {
		const { onToggle } = this.props;

		// Surface toggle callback to parent component
		if ( onToggle ) {
			onToggle( isOpen );
		}
	}

	/**
	 * Render callback to display Dropdown toggle element.
	 *
	 * @param {Object}   options
	 * @param {Function} options.onToggle Callback to invoke when toggle is
	 *                                    pressed.
	 * @param {boolean}  options.isOpen   Whether dropdown is currently open.
	 *
	 * @return {WPElement} Dropdown toggle element.
	 */
	renderToggle( { onToggle, isOpen } ) {
		const {
			disabled,
			blockTitle,
			hasSingleBlockType,
			directInsertBlock,
			toggleProps,
			hasItems,
			renderToggle = defaultRenderToggle,
		} = this.props;

		return renderToggle( {
			onToggle,
			isOpen,
			disabled: disabled || ! hasItems,
			blockTitle,
			hasSingleBlockType,
			directInsertBlock,
			toggleProps,
		} );
	}

	/**
	 * Render callback to display Dropdown content element.
	 *
	 * @param {Object}   options
	 * @param {Function} options.onClose Callback to invoke when dropdown is
	 *                                   closed.
	 *
	 * @return {WPElement} Dropdown content element.
	 */
	renderContent( { onClose } ) {
		const {
			rootClientId,
			clientId,
			isAppender,
			showInserterHelpPanel,

			// This prop is experimental to give some time for the quick inserter to mature
			// Feel free to make them stable after a few releases.
			__experimentalIsQuick: isQuick,
		} = this.props;

		if ( isQuick ) {
			return (
				<QuickInserter
					onSelect={ () => {
						onClose();
					} }
					rootClientId={ rootClientId }
					clientId={ clientId }
					isAppender={ isAppender }
				/>
			);
		}

		return (
			<InserterMenu
				onSelect={ () => {
					onClose();
				} }
				rootClientId={ rootClientId }
				clientId={ clientId }
				isAppender={ isAppender }
				showInserterHelpPanel={ showInserterHelpPanel }
			/>
		);
	}

	render() {
		const {
			position,
			hasSingleBlockType,
			directInsertBlock,
			insertOnlyAllowedBlock,
			__experimentalIsQuick: isQuick,
			onSelectOrClose,
		} = this.props;

		if ( hasSingleBlockType || directInsertBlock?.length ) {
			return this.renderToggle( { onToggle: insertOnlyAllowedBlock } );
		}

		return (
			<Dropdown
				className="block-editor-inserter"
				contentClassName={ classnames(
					'block-editor-inserter__popover',
					{ 'is-quick': isQuick }
				) }
				position={ position }
				onToggle={ this.onToggle }
				expandOnMobile
				headerTitle={ __( 'Add a block' ) }
				renderToggle={ this.renderToggle }
				renderContent={ this.renderContent }
				onClose={ onSelectOrClose }
			/>
		);
	}
}

export default compose( [
	withSelect( ( select, { clientId, rootClientId } ) => {
		const {
			getBlockRootClientId,
			hasInserterItems,
			__experimentalGetAllowedBlocks,
			__experimentalGetDirectInsertBlock,
		} = select( blockEditorStore );
		const { getBlockVariations } = select( blocksStore );

		rootClientId =
			rootClientId || getBlockRootClientId( clientId ) || undefined;

		const allowedBlocks = __experimentalGetAllowedBlocks( rootClientId );

		const directInsertBlock = __experimentalGetDirectInsertBlock(
			rootClientId
		);

		const hasSingleBlockType =
			size( allowedBlocks ) === 1 &&
			size(
				getBlockVariations( allowedBlocks[ 0 ].name, 'inserter' )
			) === 0;

		let allowedBlockType = false;
		if ( hasSingleBlockType ) {
			allowedBlockType = allowedBlocks[ 0 ];
		}

		return {
			hasItems: hasInserterItems( rootClientId ),
			hasSingleBlockType,
			blockTitle: allowedBlockType ? allowedBlockType.title : '',
			allowedBlockType,
			directInsertBlock,
			rootClientId,
		};
	} ),
	withDispatch( ( dispatch, ownProps, { select } ) => {
		return {
			insertOnlyAllowedBlock() {
				const {
					rootClientId,
					clientId,
					isAppender,
					hasSingleBlockType,
					allowedBlockType,
					directInsertBlock,
					onSelectOrClose,
				} = ownProps;

				if ( ! hasSingleBlockType && ! directInsertBlock?.length ) {
					return;
				}

				function getInsertionIndex() {
					const {
						getBlockIndex,
						getBlockSelectionEnd,
						getBlockOrder,
						getBlockRootClientId,
					} = select( blockEditorStore );

					// If the clientId is defined, we insert at the position of the block.
					if ( clientId ) {
						return getBlockIndex( clientId, rootClientId );
					}

					// If there a selected block, we insert after the selected block.
					const end = getBlockSelectionEnd();
					if (
						! isAppender &&
						end &&
						getBlockRootClientId( end ) === rootClientId
					) {
						return getBlockIndex( end, rootClientId ) + 1;
					}

					// Otherwise, we insert at the end of the current rootClientId
					return getBlockOrder( rootClientId ).length;
				}

				const { insertBlock } = dispatch( blockEditorStore );

				const blockToInsert = directInsertBlock?.length
					? createBlock( ...directInsertBlock )
					: createBlock( allowedBlockType.name );

				insertBlock( blockToInsert, getInsertionIndex(), rootClientId );

				if ( onSelectOrClose ) {
					onSelectOrClose();
				}

				const message = sprintf(
					// translators: %s: the name of the block that has been added
					__( '%s block added' ),
					allowedBlockType.title
				);
				speak( message );
			},
		};
	} ),
	// The global inserter should always be visible, we are using ( ! isAppender && ! rootClientId && ! clientId ) as
	// a way to detect the global Inserter.
	ifCondition(
		( { hasItems, isAppender, rootClientId, clientId } ) =>
			hasItems || ( ! isAppender && ! rootClientId && ! clientId )
	),
] )( Inserter );
