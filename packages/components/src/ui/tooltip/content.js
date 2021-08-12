/**
 * External dependencies
 */
// Disable reason: Temporarily disable for existing usages
// until we remove them as part of https://github.com/WordPress/gutenberg/issues/30503#deprecating-emotion-css
// eslint-disable-next-line no-restricted-imports
import { cx } from '@emotion/css';
// eslint-disable-next-line no-restricted-imports
import { Tooltip as ReakitTooltip } from 'reakit';

/**
 * Internal dependencies
 */
import { contextConnect, useContextSystem } from '../context';
import { View } from '../../view';
import { useTooltipContext } from './context';
import * as styles from './styles';

const { TooltipPopoverView } = styles;

/**
 *
 * @param {import('../context').PolymorphicComponentProps<import('./types').ContentProps, 'div'>} props
 * @param {import('react').Ref<any>}                                                              forwardedRef
 */
function TooltipContent( props, forwardedRef ) {
	const { children, className, ...otherProps } = useContextSystem(
		props,
		'TooltipContent'
	);
	const { tooltip } = useTooltipContext();
	const classes = cx( styles.TooltipContent, className );

	return (
		<ReakitTooltip
			as={ View }
			{ ...otherProps }
			{ ...tooltip }
			className={ classes }
			ref={ forwardedRef }
		>
			<TooltipPopoverView>{ children }</TooltipPopoverView>
		</ReakitTooltip>
	);
}

export default contextConnect( TooltipContent, 'TooltipContent' );
