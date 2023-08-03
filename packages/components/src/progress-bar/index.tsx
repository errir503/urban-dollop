/**
 * External dependencies
 */
import type { ForwardedRef } from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { forwardRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import * as ProgressBarStyled from './styles';
import type { ProgressBarProps } from './types';
import type { WordPressComponentProps } from '../ui/context';

function UnforwardedProgressBar(
	props: WordPressComponentProps< ProgressBarProps, 'progress', false >,
	ref: ForwardedRef< HTMLProgressElement >
) {
	const { className, value, ...progressProps } = props;
	const isIndeterminate = ! Number.isFinite( value );

	return (
		<ProgressBarStyled.Track className={ className }>
			<ProgressBarStyled.Indicator
				isIndeterminate={ isIndeterminate }
				value={ value }
			/>
			<ProgressBarStyled.ProgressElement
				max={ 100 }
				value={ value }
				aria-label={ __( 'Loading …' ) }
				ref={ ref }
				{ ...progressProps }
			/>
		</ProgressBarStyled.Track>
	);
}

export const ProgressBar = forwardRef( UnforwardedProgressBar );

export default ProgressBar;
