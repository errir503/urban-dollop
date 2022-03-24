/**
 * External dependencies
 */
import styled from '@emotion/styled';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { BorderControl } from '../';
import { Provider as SlotFillProvider } from '../../slot-fill';
import Popover from '../../popover';

export default {
	title: 'Components (Experimental)/BorderControl',
	component: BorderControl,
};

// Available border colors.
const colors = [
	{ name: 'Gray 0', color: '#f6f7f7' },
	{ name: 'Gray 5', color: '#dcdcde' },
	{ name: 'Gray 20', color: '#a7aaad' },
	{ name: 'Gray 70', color: '#3c434a' },
	{ name: 'Gray 100', color: '#101517' },
	{ name: 'Blue 20', color: '#72aee6' },
	{ name: 'Blue 40', color: '#3582c4' },
	{ name: 'Blue 70', color: '#0a4b78' },
	{ name: 'Red 40', color: '#e65054' },
	{ name: 'Red 70', color: '#8a2424' },
	{ name: 'Green 10', color: '#68de7c' },
	{ name: 'Green 40', color: '#00a32a' },
	{ name: 'Green 60', color: '#007017' },
	{ name: 'Yellow 10', color: '#f2d675' },
	{ name: 'Yellow 40', color: '#bd8600' },
];

// Multiple origin colors.
const multipleOriginColors = [
	{
		name: 'Default',
		colors: [
			{ name: 'Gray 0', color: '#f6f7f7' },
			{ name: 'Gray 5', color: '#dcdcde' },
			{ name: 'Gray 20', color: '#a7aaad' },
			{ name: 'Gray 70', color: '#3c434a' },
			{ name: 'Gray 100', color: '#101517' },
		],
	},
	{
		name: 'Theme',
		colors: [
			{ name: 'Blue 20', color: '#72aee6' },
			{ name: 'Blue 40', color: '#3582c4' },
			{ name: 'Blue 70', color: '#0a4b78' },
			{ name: 'Red 40', color: '#e65054' },
			{ name: 'Red 70', color: '#8a2424' },
		],
	},
	{
		name: 'User',
		colors: [
			{ name: 'Green 10', color: '#68de7c' },
			{ name: 'Green 40', color: '#00a32a' },
			{ name: 'Green 60', color: '#007017' },
			{ name: 'Yellow 10', color: '#f2d675' },
			{ name: 'Yellow 40', color: '#bd8600' },
		],
	},
];

const _default = ( props ) => {
	const [ border, setBorder ] = useState();
	const onChange = ( newBorder ) => setBorder( newBorder );
	const { __experimentalHasMultipleOrigins } = props;

	return (
		<SlotFillProvider>
			<WrapperView>
				<BorderControl
					{ ...props }
					colors={
						__experimentalHasMultipleOrigins
							? multipleOriginColors
							: colors
					}
					label="Border"
					onChange={ onChange }
					value={ border }
					width={ ! props.isCompact && props.width }
				/>
			</WrapperView>
			<Popover.Slot />
		</SlotFillProvider>
	);
};

export const Default = _default.bind( {} );
Default.args = {
	disableCustomColors: false,
	enableAlpha: true,
	enableStyle: true,
	isCompact: true,
	shouldSanitizeBorder: true,
	showDropdownHeader: false,
	width: '110px',
	withSlider: true,
	__experimentalIsRenderedInSidebar: false,
	__experimentalHasMultipleOrigins: false,
};

const WrapperView = styled.div`
	max-width: 280px;
`;
