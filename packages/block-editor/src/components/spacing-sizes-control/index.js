/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { __experimentalText as Text } from '@wordpress/components';

/**
 * Internal dependencies
 */
import AllInputControl from './all-input-control';
import InputControls from './input-controls';
import AxialInputControls from './axial-input-controls';
import LinkedButton from './linked-button';
import { DEFAULT_VALUES, isValuesMixed, isValuesDefined } from './utils';
import useSetting from '../use-setting';

export default function SpacingSizesControl( {
	inputProps,
	onChange,
	label = __( 'Spacing Control' ),
	values,
	sides,
	splitOnAxis = false,
	useSelect,
	minimumCustomValue = 0,
} ) {
	const spacingSizes = [
		{ name: 0, slug: '0', size: 0 },
		...( useSetting( 'spacing.spacingSizes' ) || [] ),
	];

	if ( spacingSizes.length > 8 ) {
		spacingSizes.unshift( {
			name: __( 'Default' ),
			slug: 'default',
			size: undefined,
		} );
	}

	const inputValues = values || DEFAULT_VALUES;
	const hasInitialValue = isValuesDefined( values );
	const hasOneSide = sides?.length === 1;

	const [ isLinked, setIsLinked ] = useState(
		! hasInitialValue || ! isValuesMixed( inputValues, sides ) || hasOneSide
	);

	const toggleLinked = () => {
		setIsLinked( ! isLinked );
	};

	const handleOnChange = ( nextValue ) => {
		const newValues = { ...values, ...nextValue };
		onChange( newValues );
	};

	const inputControlProps = {
		...inputProps,
		onChange: handleOnChange,
		isLinked,
		sides,
		values: inputValues,
		spacingSizes,
		useSelect,
		type: label,
		minimumCustomValue,
	};

	return (
		<fieldset role="region" className="component-spacing-sizes-control">
			<Text as="legend">{ label }</Text>
			{ ! hasOneSide && (
				<LinkedButton onClick={ toggleLinked } isLinked={ isLinked } />
			) }
			{ isLinked && (
				<AllInputControl
					aria-label={ label }
					{ ...inputControlProps }
				/>
			) }

			{ ! isLinked && splitOnAxis && (
				<AxialInputControls { ...inputControlProps } />
			) }
			{ ! isLinked && ! splitOnAxis && (
				<InputControls { ...inputControlProps } />
			) }
		</fieldset>
	);
}
