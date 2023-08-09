/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import * as styles from '../styles';
import type { WordPressComponentProps } from '../../ui/context';
import { useContextSystem } from '../../ui/context';
import { useCx } from '../../utils/hooks/use-cx';

import type { StylePickerProps } from '../types';

export function useBorderControlStylePicker(
	props: WordPressComponentProps< StylePickerProps, 'div' >
) {
	const { className, ...otherProps } = useContextSystem(
		props,
		'BorderControlStylePicker'
	);

	// Generate class names.
	const cx = useCx();
	const classes = useMemo( () => {
		return cx( styles.borderControlStylePicker, className );
	}, [ className, cx ] );

	const buttonClassName = useMemo( () => {
		return cx( styles.borderStyleButton );
	}, [ cx ] );

	return { ...otherProps, className: classes, buttonClassName };
}
