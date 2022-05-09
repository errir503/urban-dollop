/**
 * External dependencies
 */
import type { HTMLInputTypeAttribute } from 'react';

/**
 * Internal dependencies
 */
import type { BaseControlProps } from '../base-control/types';

export type TextControlProps = Pick<
	BaseControlProps,
	'className' | 'hideLabelFromVision' | 'help' | 'label'
> & {
	/**
	 * A function that receives the value of the input.
	 */
	onChange: ( value: string ) => void;
	/**
	 * The current value of the input.
	 */
	value: string | number;
	/**
	 * Type of the input element to render. Defaults to "text".
	 *
	 * @default 'text'
	 */
	type?: HTMLInputTypeAttribute;
};
