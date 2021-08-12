/**
 * External dependencies
 */
// Disable reason: Temporarily disable for existing usages
// until we remove them as part of https://github.com/WordPress/gutenberg/issues/30503#deprecating-emotion-css
// eslint-disable-next-line no-restricted-imports
import { css, cx } from '@emotion/css';

/**
 * Internal dependencies
 */
import { useContextSystem } from '../../ui/context';
import { useFlexContext } from '../context';
import * as styles from '../styles';

/**
 * @param {import('../../ui/context').PolymorphicComponentProps<import('../types').FlexItemProps, 'div'>} props
 */
export function useFlexItem( props ) {
	const {
		className,
		display: displayProp,
		isBlock = false,
		...otherProps
	} = useContextSystem( props, 'FlexItem' );
	const sx = {};

	const contextDisplay = useFlexContext().flexItemDisplay;

	sx.Base = css( {
		display: displayProp || contextDisplay,
	} );

	const classes = cx(
		styles.Item,
		sx.Base,
		isBlock && styles.block,
		className
	);

	return {
		...otherProps,
		className: classes,
	};
}
