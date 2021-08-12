/**
 * External dependencies
 */
// eslint-disable-next-line no-restricted-imports
import { Radio } from 'reakit';

/**
 * WordPress dependencies
 */
import { memo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import * as styles from './styles';
import type { SegmentedControlButtonProps } from './types';
import { useCx } from '../utils/hooks';

const {
	ButtonContentView,
	LabelPlaceholderView,
	LabelView,
	SeparatorView,
} = styles;

function SegmentedControlButton( {
	className,
	forwardedRef,
	isBlock = false,
	label,
	showSeparator,
	value,
	...props
}: SegmentedControlButtonProps ) {
	const isActive = props.state === value;
	const cx = useCx();
	const labelViewClasses = cx( isBlock && styles.labelBlock );
	const classes = cx(
		styles.buttonView,
		className,
		isActive && styles.buttonActive
	);
	return (
		<LabelView className={ labelViewClasses } data-active={ isActive }>
			<Radio
				{ ...props }
				as="button"
				aria-label={ label }
				className={ classes }
				data-value={ value }
				ref={ forwardedRef }
				value={ value }
			>
				<ButtonContentView>{ label }</ButtonContentView>
				<LabelPlaceholderView aria-hidden>
					{ label }
				</LabelPlaceholderView>
			</Radio>
			<SegmentedControlSeparator isActive={ ! showSeparator } />
		</LabelView>
	);
}

const SegmentedControlSeparator = memo(
	( { isActive }: { isActive: boolean } ) => {
		const cx = useCx();
		const classes = cx( isActive && styles.separatorActive );
		return <SeparatorView aria-hidden className={ classes } />;
	}
);

export default memo( SegmentedControlButton );
