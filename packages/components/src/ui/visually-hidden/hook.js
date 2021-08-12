/**
 * External dependencies
 */
// Disable reason: Temporarily disable for existing usages
// until we remove them as part of https://github.com/WordPress/gutenberg/issues/30503#deprecating-emotion-css
// eslint-disable-next-line no-restricted-imports
import { cx } from '@emotion/css';

/**
 * Internal dependencies
 */
import * as styles from './styles';

// duplicate this for the sake of being able to export it, it'll be removed when we replace VisuallyHidden in components/src anyway
/** @typedef {import('../context').PolymorphicComponentProps<{ children: import('react').ReactNode }, 'div'>} Props */

/**
 * @param {import('../context').PolymorphicComponentProps<{ children: import('react').ReactNode }, 'div'>} props
 */
export function useVisuallyHidden( { className, ...props } ) {
	// circumvent the context system and write the classnames ourselves
	const classes = cx(
		'components-visually-hidden wp-components-visually-hidden',
		className,
		styles.VisuallyHidden
	);

	return {
		className: classes,
		...props,
	};
}
