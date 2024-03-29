/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import NumberControl from '../';

export default {
	title: 'Components (Experimental)/NumberControl',
	component: NumberControl,
	argTypes: {
		onChange: { action: 'onChange' },
		prefix: { control: { type: 'text' } },
		step: { control: { type: 'text' } },
		suffix: { control: { type: 'text' } },
		type: { control: { type: 'text' } },
		value: { control: null },
	},
};

function Template( { onChange, ...props } ) {
	const [ value, setValue ] = useState( '0' );
	const [ isValidValue, setIsValidValue ] = useState( true );

	return (
		<>
			<NumberControl
				{ ...props }
				value={ value }
				onChange={ ( v, extra ) => {
					setValue( v );
					setIsValidValue( extra.event.target.validity.valid );
					onChange( v, extra );
				} }
			/>
			<p>Is valid? { isValidValue ? 'Yes' : 'No' }</p>
		</>
	);
}

export const Default = Template.bind( {} );
Default.args = {
	label: 'Value',
};
