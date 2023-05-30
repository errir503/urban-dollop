/**
 * WordPress dependencies
 */
import {
	Button,
	CustomSelectControl,
	Icon,
	RangeControl,
	__experimentalHStack as HStack,
	__experimentalUnitControl as UnitControl,
	__experimentalUseCustomUnits as useCustomUnits,
	__experimentalParseQuantityAndUnitFromRawValue as parseQuantityAndUnitFromRawValue,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useState, useMemo } from '@wordpress/element';
import { usePrevious } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import { settings } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import useSetting from '../../use-setting';
import { store as blockEditorStore } from '../../../store';
import {
	ALL_SIDES,
	LABELS,
	getSliderValueFromPreset,
	getCustomValueFromPreset,
	getPresetValueFromCustomValue,
	isValueSpacingPreset,
} from '../utils';

const CUSTOM_VALUE_SETTINGS = {
	px: { max: 300, steps: 1 },
	'%': { max: 100, steps: 1 },
	vw: { max: 100, steps: 1 },
	vh: { max: 100, steps: 1 },
	em: { max: 10, steps: 0.1 },
	rm: { max: 10, steps: 0.1 },
};

export default function SpacingInputControl( {
	icon,
	isMixed = false,
	minimumCustomValue,
	onChange,
	onMouseOut,
	onMouseOver,
	showSideInLabel = true,
	side,
	spacingSizes,
	type,
	value,
} ) {
	// Treat value as a preset value if the passed in value matches the value of one of the spacingSizes.
	value = getPresetValueFromCustomValue( value, spacingSizes );

	let selectListSizes = spacingSizes;
	const showRangeControl = spacingSizes.length <= 8;

	const disableCustomSpacingSizes = useSelect( ( select ) => {
		const editorSettings = select( blockEditorStore ).getSettings();
		return editorSettings?.disableCustomSpacingSizes;
	} );

	const [ showCustomValueControl, setShowCustomValueControl ] = useState(
		! disableCustomSpacingSizes &&
			value !== undefined &&
			! isValueSpacingPreset( value )
	);

	const previousValue = usePrevious( value );
	if (
		!! value &&
		previousValue !== value &&
		! isValueSpacingPreset( value ) &&
		showCustomValueControl !== true
	) {
		setShowCustomValueControl( true );
	}

	const units = useCustomUnits( {
		availableUnits: useSetting( 'spacing.units' ) || [ 'px', 'em', 'rem' ],
	} );

	let currentValue = null;

	const showCustomValueInSelectList =
		! showRangeControl &&
		! showCustomValueControl &&
		value !== undefined &&
		( ! isValueSpacingPreset( value ) ||
			( isValueSpacingPreset( value ) && isMixed ) );

	if ( showCustomValueInSelectList ) {
		selectListSizes = [
			...spacingSizes,
			{
				name: ! isMixed
					? // translators: A custom measurement, eg. a number followed by a unit like 12px.
					  sprintf( __( 'Custom (%s)' ), value )
					: __( 'Mixed' ),
				slug: 'custom',
				size: value,
			},
		];
		currentValue = selectListSizes.length - 1;
	} else if ( ! isMixed ) {
		currentValue = ! showCustomValueControl
			? getSliderValueFromPreset( value, spacingSizes )
			: getCustomValueFromPreset( value, spacingSizes );
	}

	const selectedUnit =
		useMemo(
			() => parseQuantityAndUnitFromRawValue( currentValue ),
			[ currentValue ]
		)[ 1 ] || units[ 0 ].value;

	const setInitialValue = () => {
		if ( value === undefined ) {
			onChange( '0' );
		}
	};

	const customTooltipContent = ( newValue ) =>
		value === undefined ? undefined : spacingSizes[ newValue ]?.name;

	const customRangeValue = parseFloat( currentValue, 10 );

	const getNewCustomValue = ( newSize ) => {
		const isNumeric = ! isNaN( parseFloat( newSize ) );
		const nextValue = isNumeric ? newSize : undefined;
		return nextValue;
	};

	const getNewPresetValue = ( newSize, controlType ) => {
		const size = parseInt( newSize, 10 );

		if ( controlType === 'selectList' ) {
			if ( size === 0 ) {
				return undefined;
			}
			if ( size === 1 ) {
				return '0';
			}
		} else if ( size === 0 ) {
			return '0';
		}
		return `var:preset|spacing|${ spacingSizes[ newSize ]?.slug }`;
	};

	const handleCustomValueSliderChange = ( next ) => {
		onChange( [ next, selectedUnit ].join( '' ) );
	};

	const allPlaceholder = isMixed ? __( 'Mixed' ) : null;

	const options = selectListSizes.map( ( size, index ) => ( {
		key: index,
		name: size.name,
	} ) );

	const marks = spacingSizes.map( ( _newValue, index ) => ( {
		value: index,
		label: undefined,
	} ) );

	const sideLabel =
		ALL_SIDES.includes( side ) && showSideInLabel ? LABELS[ side ] : '';
	const typeLabel = showSideInLabel ? type?.toLowerCase() : type;

	const ariaLabel = sprintf(
		// translators: 1: The side of the block being modified (top, bottom, left, All sides etc.). 2. Type of spacing being modified (Padding, margin, etc)
		__( '%1$s %2$s' ),
		sideLabel,
		typeLabel
	).trim();

	return (
		<HStack className="spacing-sizes-control__wrapper">
			{ icon && (
				<Icon
					className="spacing-sizes-control__icon"
					icon={ icon }
					size={ 24 }
				/>
			) }
			{ showCustomValueControl && (
				<>
					<UnitControl
						onMouseOver={ onMouseOver }
						onMouseOut={ onMouseOut }
						onFocus={ onMouseOver }
						onBlur={ onMouseOut }
						onChange={ ( newSize ) =>
							onChange( getNewCustomValue( newSize ) )
						}
						value={ currentValue }
						units={ units }
						min={ minimumCustomValue }
						placeholder={ allPlaceholder }
						disableUnits={ isMixed }
						label={ ariaLabel }
						hideLabelFromVision={ true }
						className="spacing-sizes-control__custom-value-input"
						size={ '__unstable-large' }
					/>
					<RangeControl
						onMouseOver={ onMouseOver }
						onMouseOut={ onMouseOut }
						onFocus={ onMouseOver }
						onBlur={ onMouseOut }
						value={ customRangeValue }
						min={ 0 }
						max={ CUSTOM_VALUE_SETTINGS[ selectedUnit ]?.max ?? 10 }
						step={
							CUSTOM_VALUE_SETTINGS[ selectedUnit ]?.steps ?? 0.1
						}
						withInputField={ false }
						onChange={ handleCustomValueSliderChange }
						className="spacing-sizes-control__custom-value-range"
						__nextHasNoMarginBottom
					/>
				</>
			) }
			{ showRangeControl && ! showCustomValueControl && (
				<RangeControl
					onMouseOver={ onMouseOver }
					onMouseOut={ onMouseOut }
					className="spacing-sizes-control__range-control"
					value={ currentValue }
					onChange={ ( newSize ) =>
						onChange( getNewPresetValue( newSize ) )
					}
					onMouseDown={ ( event ) => {
						// If mouse down is near start of range set initial value to 0, which
						// prevents the user have to drag right then left to get 0 setting.
						if ( event?.nativeEvent?.offsetX < 35 ) {
							setInitialValue();
						}
					} }
					withInputField={ false }
					aria-valuenow={ currentValue }
					aria-valuetext={ spacingSizes[ currentValue ]?.name }
					renderTooltipContent={ customTooltipContent }
					min={ 0 }
					max={ spacingSizes.length - 1 }
					marks={ marks }
					label={ ariaLabel }
					hideLabelFromVision={ true }
					__nextHasNoMarginBottom={ true }
					onFocus={ onMouseOver }
					onBlur={ onMouseOut }
				/>
			) }
			{ ! showRangeControl && ! showCustomValueControl && (
				<CustomSelectControl
					className="spacing-sizes-control__custom-select-control"
					value={
						options.find(
							( option ) => option.key === currentValue
						) || '' // passing undefined here causes a downshift controlled/uncontrolled warning
					}
					onChange={ ( selection ) => {
						onChange(
							getNewPresetValue(
								selection.selectedItem.key,
								'selectList'
							)
						);
					} }
					options={ options }
					label={ ariaLabel }
					hideLabelFromVision={ true }
					__nextUnconstrainedWidth={ true }
					size={ '__unstable-large' }
					onMouseOver={ onMouseOver }
					onMouseOut={ onMouseOut }
					onFocus={ onMouseOver }
					onBlur={ onMouseOut }
				/>
			) }
			{ ! disableCustomSpacingSizes && (
				<Button
					label={
						showCustomValueControl
							? __( 'Use size preset' )
							: __( 'Set custom size' )
					}
					icon={ settings }
					onClick={ () => {
						setShowCustomValueControl( ! showCustomValueControl );
					} }
					isPressed={ showCustomValueControl }
					isSmall
					className="spacing-sizes-control__custom-toggle"
					iconSize={ 24 }
				/>
			) }
		</HStack>
	);
}
