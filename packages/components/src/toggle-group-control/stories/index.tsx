/**
 * External dependencies
 */
import type { ComponentMeta, ComponentStory } from '@storybook/react';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { formatLowercase, formatUppercase } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import {
	ToggleGroupControl,
	ToggleGroupControlOption,
	ToggleGroupControlOptionIcon,
} from '../index';
import type {
	ToggleGroupControlOptionProps,
	ToggleGroupControlOptionIconProps,
	ToggleGroupControlProps,
} from '../types';

const meta: ComponentMeta< typeof ToggleGroupControl > = {
	component: ToggleGroupControl,
	title: 'Components (Experimental)/ToggleGroupControl',
	subcomponents: { ToggleGroupControlOption, ToggleGroupControlOptionIcon },
	argTypes: {
		help: { control: { type: 'text' } },
		onChange: { action: 'onChange' },
		value: { control: { type: null } },
	},
	parameters: {
		controls: { expanded: true },
		docs: { source: { state: 'open' } },
	},
};
export default meta;

const Template: ComponentStory< typeof ToggleGroupControl > = ( {
	onChange,
	...props
} ) => {
	const [ value, setValue ] =
		useState< ToggleGroupControlProps[ 'value' ] >();

	return (
		<ToggleGroupControl
			{ ...props }
			onChange={ ( ...changeArgs ) => {
				setValue( ...changeArgs );
				onChange?.( ...changeArgs );
			} }
			value={ value }
		/>
	);
};

const mapPropsToOptionComponent = ( {
	value,
	...props
}: ToggleGroupControlOptionProps ) => (
	<ToggleGroupControlOption value={ value } key={ value } { ...props } />
);

const mapPropsToOptionIconComponent = ( {
	value,
	...props
}: ToggleGroupControlOptionIconProps ) => (
	<ToggleGroupControlOptionIcon value={ value } key={ value } { ...props } />
);

export const Default: ComponentStory< typeof ToggleGroupControl > =
	Template.bind( {} );
Default.args = {
	children: [
		{ value: 'left', label: 'Left' },
		{ value: 'center', label: 'Center' },
		{ value: 'right', label: 'Right' },
		{ value: 'justify', label: 'Justify' },
	].map( mapPropsToOptionComponent ),
	label: 'Label',
};

/**
 * A tooltip can be shown for each option by enabling the `showTooltip` prop.
 * The `aria-label` will be used in the tooltip if provided. Otherwise, the
 * `label` will be used.
 */
export const WithTooltip: ComponentStory< typeof ToggleGroupControl > =
	Template.bind( {} );
WithTooltip.args = {
	...Default.args,
	children: [
		{
			value: 'asc',
			label: 'A→Z',
			'aria-label': 'Ascending',
			showTooltip: true,
		},
		{
			value: 'desc',
			label: 'Z→A',
			'aria-label': 'Descending',
			showTooltip: true,
		},
	].map( mapPropsToOptionComponent ),
};

/**
 * The `ToggleGroupControlOptionIcon` component can be used for icon options. A `label` is required
 * on each option for accessibility, which will be shown in a tooltip.
 */
export const WithIcons: ComponentStory< typeof ToggleGroupControl > =
	Template.bind( {} );
WithIcons.args = {
	...Default.args,
	children: [
		{ value: 'uppercase', label: 'Uppercase', icon: formatUppercase },
		{ value: 'lowercase', label: 'Lowercase', icon: formatLowercase },
	].map( mapPropsToOptionIconComponent ),
};

/**
 * A borderless style may be preferred in some contexts.
 */
export const Borderless: ComponentStory< typeof ToggleGroupControl > =
	Template.bind( {} );
Borderless.args = {
	...WithIcons.args,
	__experimentalIsBorderless: true,
};
