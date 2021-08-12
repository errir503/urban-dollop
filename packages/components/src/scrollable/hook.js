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

/* eslint-disable jsdoc/valid-types */
/**
 * @param {import('../ui/context').PolymorphicComponentProps<import('./types').Props, 'div'>} props
 */
/* eslint-enable jsdoc/valid-types */
export function useScrollable( props ) {
	const {
		className,
		scrollDirection = 'y',
		smoothScroll = false,
		...otherProps
	} = useContextSystem( props, 'Scrollable' );

	const classes = useMemo(
		() =>
			cx(
				styles.Scrollable,
				styles.scrollableScrollbar,
				smoothScroll && styles.smoothScroll,
				scrollDirection === 'x' && styles.scrollX,
				scrollDirection === 'y' && styles.scrollY,
				scrollDirection === 'auto' && styles.scrollAuto,
				className
			),
		[ className, scrollDirection, smoothScroll ]
	);

	return { ...otherProps, className: classes };
}
