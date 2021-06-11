/**
 * WordPress dependencies
 */
import { useRef, useState, useLayoutEffect } from '@wordpress/element';
import { useMergeRefs, useRefEffect } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { create } from '../create';
import { apply } from '../to-dom';
import { toHTMLString } from '../to-html-string';
import { useDefaultStyle } from './use-default-style';
import { useBoundaryStyle } from './use-boundary-style';
import { useInlineWarning } from './use-inline-warning';
import { useCopyHandler } from './use-copy-handler';
import { useFormatBoundaries } from './use-format-boundaries';
import { useSelectObject } from './use-select-object';
import { useIndentListItemOnSpace } from './use-indent-list-item-on-space';
import { useInputAndSelection } from './use-input-and-selection';
import { useDelete } from './use-delete';

export function useRichText( {
	value = '',
	selectionStart,
	selectionEnd,
	placeholder,
	preserveWhiteSpace,
	onSelectionChange,
	onChange,
	__unstableMultilineTag: multilineTag,
	__unstableDisableFormats: disableFormats,
	__unstableIsSelected: isSelected,
	__unstableDependencies,
	__unstableAfterParse,
	__unstableBeforeSerialize,
	__unstableAddInvisibleFormats,
} ) {
	const ref = useRef();
	const [ activeFormats = [], setActiveFormats ] = useState();

	function createRecord() {
		const {
			ownerDocument: { defaultView },
		} = ref.current;
		const selection = defaultView.getSelection();
		const range =
			selection.rangeCount > 0 ? selection.getRangeAt( 0 ) : null;

		return create( {
			element: ref.current,
			range,
			multilineTag,
			multilineWrapperTags:
				multilineTag === 'li' ? [ 'ul', 'ol' ] : undefined,
			__unstableIsEditableTree: true,
			preserveWhiteSpace,
		} );
	}

	function applyRecord( newRecord, { domOnly } = {} ) {
		apply( {
			value: newRecord,
			current: ref.current,
			multilineTag,
			multilineWrapperTags:
				multilineTag === 'li' ? [ 'ul', 'ol' ] : undefined,
			prepareEditableTree: __unstableAddInvisibleFormats,
			__unstableDomOnly: domOnly,
			placeholder,
		} );
	}

	// Internal values are updated synchronously, unlike props and state.
	const _value = useRef( value );
	const record = useRef();

	function setRecordFromProps() {
		_value.current = value;
		record.current = create( {
			html: value,
			multilineTag,
			multilineWrapperTags:
				multilineTag === 'li' ? [ 'ul', 'ol' ] : undefined,
			preserveWhiteSpace,
		} );
		if ( disableFormats ) {
			record.current.formats = Array( value.length );
			record.current.replacements = Array( value.length );
		}
		record.current.formats = __unstableAfterParse( record.current );
		record.current.start = selectionStart;
		record.current.end = selectionEnd;
	}

	if ( ! record.current ) {
		setRecordFromProps();
	}

	/**
	 * Sync the value to global state. The node tree and selection will also be
	 * updated if differences are found.
	 *
	 * @param {Object} newRecord The record to sync and apply.
	 */
	function handleChange( newRecord ) {
		applyRecord( newRecord );

		if ( disableFormats ) {
			_value.current = newRecord.text;
		} else {
			_value.current = toHTMLString( {
				value: {
					...newRecord,
					formats: __unstableBeforeSerialize( newRecord ),
				},
				multilineTag,
				preserveWhiteSpace,
			} );
		}

		record.current = newRecord;

		const {
			start,
			end,
			formats,
			text,
			activeFormats: newActiveFormats = [],
		} = newRecord;

		// Selection must be updated first, so it is recorded in history when
		// the content change happens.
		onSelectionChange( start, end );
		onChange( _value.current, {
			__unstableFormats: formats,
			__unstableText: text,
		} );
		setActiveFormats( newActiveFormats );
	}

	function applyFromProps( { domOnly } = {} ) {
		setRecordFromProps();
		applyRecord( record.current, { domOnly } );
	}

	const didMount = useRef( false );

	// Value updates must happen synchonously to avoid overwriting newer values.
	useLayoutEffect( () => {
		if ( didMount.current && value !== _value.current ) {
			applyFromProps();
		}
	}, [ value ] );

	// Value updates must happen synchonously to avoid overwriting newer values.
	useLayoutEffect( () => {
		if ( ! didMount.current ) {
			return;
		}

		if (
			isSelected &&
			( selectionStart !== record.current.start ||
				selectionEnd !== record.current.end )
		) {
			applyFromProps();
		} else {
			record.current = {
				...record.current,
				start: selectionStart,
				end: selectionEnd,
			};
		}
	}, [ selectionStart, selectionEnd, isSelected ] );

	function focus() {
		ref.current.focus();
		applyRecord( record.current );
	}

	const mergedRefs = useMergeRefs( [
		ref,
		useDefaultStyle(),
		useBoundaryStyle( { activeFormats } ),
		useInlineWarning(),
		useCopyHandler( { record, multilineTag, preserveWhiteSpace } ),
		useSelectObject(),
		useFormatBoundaries( { record, applyRecord, setActiveFormats } ),
		useDelete( {
			createRecord,
			handleChange,
			multilineTag,
		} ),
		useIndentListItemOnSpace( {
			multilineTag,
			createRecord,
			handleChange,
		} ),
		useInputAndSelection( {
			record,
			applyRecord,
			createRecord,
			handleChange,
			isSelected,
			onSelectionChange,
			setActiveFormats,
		} ),
		useRefEffect( () => {
			if ( didMount.current ) {
				applyFromProps();
			} else {
				applyFromProps( { domOnly: true } );
			}

			didMount.current = true;
		}, [ placeholder, ...__unstableDependencies ] ),
	] );

	return {
		value: record.current,
		onChange: handleChange,
		onFocus: focus,
		ref: mergedRefs,
		hasActiveFormats: activeFormats.length,
	};
}

export default function __experimentalRichText() {}
