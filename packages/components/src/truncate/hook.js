/**
 * External dependencies
 */
// Disable reason: Temporarily disable for existing usages
// until we remove them as part of https://github.com/WordPress/gutenberg/issues/30503#deprecating-emotion-css
// eslint-disable-next-line no-restricted-imports
import { css, cx } from '@emotion/css';

/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useContextSystem } from '../ui/context';
import * as styles from './styles';
import { TRUNCATE_ELLIPSIS, TRUNCATE_TYPE, truncateContent } from './utils';

/**
 * @param {import('../ui/context').PolymorphicComponentProps<import('./types').Props, 'span'>} props
 */
export default function useTruncate( props ) {
	const {
		className,
		children,
		ellipsis = TRUNCATE_ELLIPSIS,
		ellipsizeMode = TRUNCATE_TYPE.auto,
		limit = 0,
		numberOfLines = 0,
		...otherProps
	} = useContextSystem( props, 'Truncate' );

	const truncatedContent = truncateContent(
		typeof children === 'string' ? /** @type {string} */ ( children ) : '',
		{
			ellipsis,
			ellipsizeMode,
			limit,
			numberOfLines,
		}
	);

	const shouldTruncate = ellipsizeMode === TRUNCATE_TYPE.auto;

	const classes = useMemo( () => {
		const sx = {};

		sx.numberOfLines = css`
			-webkit-box-orient: vertical;
			-webkit-line-clamp: ${ numberOfLines };
			display: -webkit-box;
			overflow: hidden;
		`;

		return cx(
			shouldTruncate && ! numberOfLines && styles.Truncate,
			shouldTruncate && !! numberOfLines && sx.numberOfLines,
			className
		);
	}, [ className, numberOfLines, shouldTruncate ] );

	return { ...otherProps, className: classes, children: truncatedContent };
}
