/**
 * External dependencies
 */
import { boolean, text } from '@storybook/addon-knobs';

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
import { View } from '../../view';
import Button from '../../button';

export default {
	component: ToggleGroupControl,
	title: 'Components (Experimental)/ToggleGroupControl',
	parameters: {
		knobs: { disable: false },
	},
};

const KNOBS_GROUPS = {
	ToggleGroupControl: 'ToggleGroupControl',
	ToggleGroupControlOption: 'ToggleGroupControlOption',
};

const _default = ( { options } ) => {
	const [ value, setValue ] = useState( options[ 0 ].value );
	const label = text(
		`${ KNOBS_GROUPS.ToggleGroupControl }: label`,
		'Toggle Group Control',
		KNOBS_GROUPS.ToggleGroupControl
	);

	const hideLabelFromVision = boolean(
		`${ KNOBS_GROUPS.ToggleGroupControl }: hideLabelFromVision`,
		false,
		KNOBS_GROUPS.ToggleGroupControl
	);
	const isBlock = boolean(
		`${ KNOBS_GROUPS.ToggleGroupControl }: isBlock (render as a css block element)`,
		false,
		KNOBS_GROUPS.ToggleGroupControl
	);
	const help = text(
		`${ KNOBS_GROUPS.ToggleGroupControl }: help`,
		undefined,
		KNOBS_GROUPS.ToggleGroupControl
	);
	const isAdaptiveWidth = boolean(
		`${ KNOBS_GROUPS.ToggleGroupControl }: isAdaptiveWidth`,
		false,
		KNOBS_GROUPS.ToggleGroupControl
	);

	const controlOptions = options.map( ( option, index ) => (
		<ToggleGroupControlOption
			key={ option.value }
			value={ option.value }
			label={ text(
				`${ KNOBS_GROUPS.ToggleGroupControlOption }: label`,
				option.label,
				`${ KNOBS_GROUPS.ToggleGroupControlOption }-${ index + 1 }`
			) }
			aria-label={ text(
				`${ KNOBS_GROUPS.ToggleGroupControlOption }: aria-label`,
				option[ 'aria-label' ],
				`${ KNOBS_GROUPS.ToggleGroupControlOption }-${ index + 1 }`
			) }
			showTooltip={ boolean(
				`${ KNOBS_GROUPS.ToggleGroupControlOption }: showTooltip`,
				option.showTooltip,
				`${ KNOBS_GROUPS.ToggleGroupControlOption }-${ index + 1 }`
			) }
		/>
	) );

	return (
		<View>
			<ToggleGroupControl
				onChange={ setValue }
				value={ value }
				label={ label }
				hideLabelFromVision={ hideLabelFromVision }
				help={ help }
				isBlock={ isBlock }
				isAdaptiveWidth={ isAdaptiveWidth }
			>
				{ controlOptions }
			</ToggleGroupControl>
		</View>
	);
};

export const Default = _default.bind( {} );
Default.args = {
	options: [
		{ value: 'left', label: 'Left' },
		{ value: 'center', label: 'Center' },
		{ value: 'right', label: 'Right' },
		{ value: 'justify', label: 'Justify' },
	],
};

export const WithTooltip = _default.bind( {} );
WithTooltip.args = {
	...Default.args,
	options: [
		{ value: 1, label: '1', showTooltip: true, 'aria-label': 'One' },
		{ value: 2, label: '2', showTooltip: true, 'aria-label': 'Two' },
		{ value: 3, label: '3', showTooltip: true, 'aria-label': 'Three' },
	],
};

export const WithAriaLabel = _default.bind( {} );
WithAriaLabel.args = {
	...Default.args,
	options: [
		{ value: 'asc', label: 'A→Z', 'aria-label': 'Ascending' },
		{ value: 'desc', label: 'Z→A', 'aria-label': 'Descending' },
	],
};

export const WithIcons = () => {
	const [ state, setState ] = useState();
	return (
		<ToggleGroupControl
			onChange={ setState }
			value={ state }
			label={ 'With icons' }
			hideLabelFromVision
		>
			<ToggleGroupControlOptionIcon
				value="uppercase"
				icon={ formatUppercase }
				showTooltip={ true }
				aria-label="Uppercase"
			/>
			<ToggleGroupControlOptionIcon
				value="lowercase"
				icon={ formatLowercase }
				showTooltip={ true }
				aria-label="Lowercase"
			/>
		</ToggleGroupControl>
	);
};

export const WithReset = () => {
	const [ alignState, setAlignState ] = useState();
	const aligns = [ 'Left', 'Center', 'Right' ];
	const alignOptions = aligns.map( ( key, index ) => (
		<ToggleGroupControlOption
			key={ key }
			value={ key }
			label={ text(
				`${ KNOBS_GROUPS.ToggleGroupControlOption }: label`,
				key,
				`${ KNOBS_GROUPS.ToggleGroupControlOption }-${ index + 1 }`
			) }
		/>
	) );
	return (
		<View>
			<ToggleGroupControl
				onChange={ setAlignState }
				value={ alignState }
				label={ 'Toggle Group Control' }
				hideLabelFromVision
			>
				{ alignOptions }
			</ToggleGroupControl>
			<Button onClick={ () => setAlignState( undefined ) } isTertiary>
				Reset
			</Button>
		</View>
	);
};
