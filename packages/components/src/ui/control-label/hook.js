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
import { useContextSystem } from '../context';
import { useFormGroupContextId } from '../form-group';
import { useText } from '../../text';
import * as styles from './styles';

/**
 * @param {import('../context').PolymorphicComponentProps<import('./types').Props, 'label'>} props
 */
export function useControlLabel( props ) {
	const {
		htmlFor: htmlForProp,
		isBlock = false,
		size = 'medium',
		truncate = true,
		...otherProps
	} = useContextSystem( props, 'ControlLabel' );

	const { className, ...textProps } = useText( {
		...otherProps,
		isBlock,
		truncate,
	} );

	const htmlFor = useFormGroupContextId( htmlForProp );
	const classes = cx(
		styles.ControlLabel,
		styles[ /** @type {'small' | 'medium' | 'large'} */ ( size ) ],
		className,
		isBlock ? styles.block : styles.inline
	);

	return {
		...textProps,
		className: classes,
		htmlFor,
	};
}
