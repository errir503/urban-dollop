/**
 * Internal dependencies
 */
import { HStack } from '../h-stack';
import { Text } from '../text';
import { Spacer } from '../spacer';
import { space } from '../ui/utils/space';
import { RangeControl, NumberControlWrapper } from './styles';
import { COLORS } from '../utils/colors-values';

interface InputWithSliderProps {
	min: number;
	max: number;
	value: number;
	label: string;
	abbreviation: string;
	onChange: ( value: number ) => void;
}

export const InputWithSlider = ( {
	min,
	max,
	label,
	abbreviation,
	onChange,
	value,
}: InputWithSliderProps ) => {
	return (
		<HStack spacing={ 4 }>
			<NumberControlWrapper
				min={ min }
				max={ max }
				label={ label }
				hideLabelFromVision
				value={ value }
				// @ts-expect-error TODO: Resolve discrepancy in NumberControl
				onChange={ onChange }
				prefix={
					<Spacer
						as={ Text }
						paddingLeft={ space( 4 ) }
						color={ COLORS.ui.theme }
						lineHeight={ 1 }
					>
						{ abbreviation }
					</Spacer>
				}
				hideHTMLArrows
				size="__unstable-large"
			/>
			<RangeControl
				label={ label }
				hideLabelFromVision
				min={ min }
				max={ max }
				value={ value }
				// @ts-expect-error
				// See: https://github.com/WordPress/gutenberg/pull/40535#issuecomment-1172418185
				onChange={ onChange }
				withInputField={ false }
			/>
		</HStack>
	);
};
