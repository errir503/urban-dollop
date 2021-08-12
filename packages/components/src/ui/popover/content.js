/**
 * External dependencies
 */
// Disable reason: Temporarily disable for existing usages
// until we remove them as part of https://github.com/WordPress/gutenberg/issues/30503#deprecating-emotion-css
// eslint-disable-next-line no-restricted-imports
import { css, cx } from '@emotion/css';
// eslint-disable-next-line no-restricted-imports
import { Popover as ReakitPopover } from 'reakit';

/**
 * Internal dependencies
 */
import { Card } from '../../card';
import { View } from '../../view';
import { usePopoverContext } from './context';
import * as styles from './styles';
import { contextConnect, useContextSystem } from '../context';

/**
 *
 * @param {import('../context').PolymorphicComponentProps<import('./types').ContentProps, 'div'>} props
 * @param {import('react').Ref<any>}                                                              forwardedRef
 */
function PopoverContent( props, forwardedRef ) {
	const {
		children,
		className,
		elevation = 5,
		maxWidth = 360,
		...otherProps
	} = useContextSystem( props, 'PopoverContent' );

	const { label, popover } = usePopoverContext();
	const classes = cx( styles.PopoverContent, css( { maxWidth } ), className );

	if ( ! popover ) {
		throw new Error(
			'`PopoverContent` must only be used inside a `Popover`.'
		);
	}

	const showContent = popover.visible || popover.animating;

	return (
		<ReakitPopover
			aria-label={ label }
			as={ View }
			className={ classes }
			{ ...otherProps }
			{ ...popover }
		>
			{ showContent && (
				<Card
					className={ styles.cardStyle }
					elevation={ elevation }
					ref={ forwardedRef }
				>
					{ children }
				</Card>
			) }
		</ReakitPopover>
	);
}

const ConnectedPopoverContent = contextConnect(
	PopoverContent,
	'PopoverContent'
);

export default ConnectedPopoverContent;
