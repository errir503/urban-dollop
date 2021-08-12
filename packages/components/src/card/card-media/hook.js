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
 * @param {import('../../ui/context').PolymorphicComponentProps<{ children: import('react').ReactNode }, 'div'>} props
 */
export function useCardMedia( props ) {
	const { className, ...otherProps } = useContextSystem( props, 'CardMedia' );

	const classes = useMemo(
		() =>
			cx(
				styles.Media,
				styles.borderRadius,
				// This classname is added for legacy compatibility reasons.
				'components-card__media',
				className
			),
		[ className ]
	);

	return {
		...otherProps,
		className: classes,
	};
}
