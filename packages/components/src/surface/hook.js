/**
 * External dependencies
 */
// Disable reason: Temporarily disable for existing usages
// until we remove them as part of https://github.com/WordPress/gutenberg/issues/30503#deprecating-emotion-css
// eslint-disable-next-line no-restricted-imports
import { cx } from '@emotion/css';

/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useContextSystem } from '../ui/context';
import * as styles from './styles';

/**
 * @param {import('../ui/context').PolymorphicComponentProps<import('./types').Props, 'div'>} props
 */
export function useSurface( props ) {
	const {
		backgroundSize = 12,
		borderBottom = false,
		borderLeft = false,
		borderRight = false,
		borderTop = false,
		className,
		variant = 'primary',
		...otherProps
	} = useContextSystem( props, 'Surface' );

	const classes = useMemo( () => {
		const sx = {};

		sx.borders = styles.getBorders( {
			borderBottom,
			borderLeft,
			borderRight,
			borderTop,
		} );

		return cx(
			styles.Surface,
			sx.borders,
			styles.getVariant(
				variant,
				`${ backgroundSize }px`,
				`${ backgroundSize - 1 }px`
			),
			className
		);
	}, [
		backgroundSize,
		borderBottom,
		borderLeft,
		borderRight,
		borderTop,
		className,
		variant,
	] );

	return { ...otherProps, className: classes };
}
