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
import { useContextSystem } from '../../ui/context';
import * as styles from '../styles';

/**
 * @param {import('../../ui/context').PolymorphicComponentProps<import('../types').BodyProps, 'div'>} props
 */
export function useCardBody( props ) {
	const {
		className,
		isScrollable = true,
		isShady = false,
		size = 'medium',
		...otherProps
	} = useContextSystem( props, 'CardBody' );

	const classes = useMemo(
		() =>
			cx(
				styles.Body,
				styles.borderRadius,
				styles.cardPaddings[ size ],
				isShady && styles.shady,
				// This classname is added for legacy compatibility reasons.
				'components-card__body',
				className
			),
		[ className, isShady, size ]
	);

	return {
		...otherProps,
		className: classes,
		isScrollable,
	};
}
