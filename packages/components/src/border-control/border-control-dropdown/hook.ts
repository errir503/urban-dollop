/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import * as styles from '../styles';
import { parseQuantityAndUnitFromRawValue } from '../../unit-control/utils';
import { useContextSystem, WordPressComponentProps } from '../../ui/context';
import { useCx } from '../../utils/hooks/use-cx';

import type { DropdownProps } from '../types';

export function useBorderControlDropdown(
	props: WordPressComponentProps< DropdownProps, 'div' >
) {
	const {
		border,
		className,
		colors,
		contentClassName,
		onChange,
		previousStyleSelection,
		...otherProps
	} = useContextSystem( props, 'BorderControlDropdown' );

	const [ widthValue ] = parseQuantityAndUnitFromRawValue( border?.width );
	const hasZeroWidth = widthValue === 0;

	const onColorChange = ( color?: string ) => {
		const style =
			border?.style === 'none' ? previousStyleSelection : border?.style;
		const width = hasZeroWidth && !! color ? '1px' : border?.width;

		onChange( { color, style, width } );
	};

	const onStyleChange = ( style?: string ) => {
		const width = hasZeroWidth && !! style ? '1px' : border?.width;
		onChange( { ...border, style, width } );
	};

	const onReset = () => {
		onChange( {
			...border,
			color: undefined,
			style: undefined,
		} );
	};

	// Generate class names.
	const cx = useCx();
	const classes = useMemo( () => {
		return cx( styles.borderControlDropdown(), className );
	}, [ className, cx ] );

	const indicatorClassName = useMemo( () => {
		return cx( styles.borderColorIndicator );
	}, [ cx ] );

	const indicatorWrapperClassName = useMemo( () => {
		return cx( styles.colorIndicatorWrapper( border ) );
	}, [ border, cx ] );

	const popoverClassName = useMemo( () => {
		return cx( styles.borderControlPopover, contentClassName );
	}, [ cx, contentClassName ] );

	const popoverControlsClassName = useMemo( () => {
		return cx( styles.borderControlPopoverControls );
	}, [ cx ] );

	const popoverContentClassName = useMemo( () => {
		return cx( styles.borderControlPopoverContent );
	}, [ cx ] );

	const resetButtonClassName = useMemo( () => {
		return cx( styles.resetButton );
	}, [ cx ] );

	return {
		...otherProps,
		border,
		className: classes,
		colors,
		indicatorClassName,
		indicatorWrapperClassName,
		onColorChange,
		onStyleChange,
		onReset,
		popoverClassName,
		popoverContentClassName,
		popoverControlsClassName,
		resetButtonClassName,
	};
}
