/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { TextareaControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useState, forwardRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { DEFAULT_CLASSNAMES, REGEXP_NEWLINES } from './constants';
import usePostTitleFocus from './use-post-title-focus';
import usePostTitle from './use-post-title';

function PostTitleRaw( _, forwardedRef ) {
	const { placeholder, hasFixedToolbar } = useSelect( ( select ) => {
		const { getSettings } = select( blockEditorStore );
		const { titlePlaceholder, hasFixedToolbar: _hasFixedToolbar } =
			getSettings();

		return {
			placeholder: titlePlaceholder,
			hasFixedToolbar: _hasFixedToolbar,
		};
	}, [] );

	const [ isSelected, setIsSelected ] = useState( false );

	const { title, setTitle: onUpdate } = usePostTitle();
	const { ref: focusRef } = usePostTitleFocus( forwardedRef );

	function onChange( value ) {
		onUpdate( value.replace( REGEXP_NEWLINES, ' ' ) );
	}

	function onSelect() {
		setIsSelected( true );
	}

	function onUnselect() {
		setIsSelected( false );
	}

	// The wp-block className is important for editor styles.
	// This same block is used in both the visual and the code editor.
	const className = classnames( DEFAULT_CLASSNAMES, {
		'is-selected': isSelected,
		'has-fixed-toolbar': hasFixedToolbar,
		'is-raw-text': true,
	} );

	const decodedPlaceholder =
		decodeEntities( placeholder ) || __( 'Add title' );

	return (
		<TextareaControl
			ref={ focusRef }
			value={ title }
			onChange={ onChange }
			onFocus={ onSelect }
			onBlur={ onUnselect }
			label={ placeholder }
			className={ className }
			placeholder={ decodedPlaceholder }
			hideLabelFromVision={ true }
			autoComplete="off"
			dir="auto"
			__nextHasNoMarginBottom
		/>
	);
}

export default forwardRef( PostTitleRaw );
