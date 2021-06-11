/**
 * External dependencies
 */
import classnames from 'classnames';
import { clamp, isFinite, noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { __, isRTL } from '@wordpress/i18n';
import { useRef, useState, forwardRef } from '@wordpress/element';
import { useInstanceId } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import BaseControl from '../base-control';
import Button from '../button';
import Icon from '../icon';
import { color } from '../utils/colors';
import { floatClamp, useControlledRangeValue } from './utils';
import InputRange from './input-range';
import RangeRail from './rail';
import SimpleTooltip from './tooltip';
import {
	ActionRightWrapper,
	AfterIconWrapper,
	BeforeIconWrapper,
	InputNumber,
	Root,
	Track,
	ThumbWrapper,
	Thumb,
	Wrapper,
} from './styles/range-control-styles';

function RangeControl(
	{
		afterIcon,
		allowReset = false,
		beforeIcon,
		className,
		currentInput,
		color: colorProp = color( 'ui.theme' ),
		disabled = false,
		help,
		initialPosition,
		isShiftStepEnabled = true,
		label,
		marks = false,
		max = 100,
		min = 0,
		onBlur = noop,
		onChange = noop,
		onFocus = noop,
		onMouseMove = noop,
		onMouseLeave = noop,
		railColor,
		resetFallbackValue,
		renderTooltipContent = ( v ) => v,
		showTooltip: showTooltipProp,
		shiftStep = 10,
		step = 1,
		trackColor,
		value: valueProp,
		withInputField = true,
		...props
	},
	ref
) {
	const [ value, setValue ] = useControlledRangeValue( {
		min,
		max,
		value: valueProp,
		initial: initialPosition,
	} );
	const isResetPendent = useRef( false );
	const [ showTooltip, setShowTooltip ] = useState( showTooltipProp );
	const [ isFocused, setIsFocused ] = useState( false );

	const inputRef = useRef();

	const setRef = ( nodeRef ) => {
		inputRef.current = nodeRef;

		if ( ref ) {
			ref( nodeRef );
		}
	};

	const isCurrentlyFocused = inputRef.current?.matches( ':focus' );
	const isThumbFocused = ! disabled && isFocused;

	const isValueReset = value === null;
	const currentValue = value !== undefined ? value : currentInput;

	const inputSliderValue = isValueReset ? '' : currentValue;

	const rangeFillValue = isValueReset ? ( max - min ) / 2 + min : value;

	const calculatedFillValue = ( ( value - min ) / ( max - min ) ) * 100;
	const fillValue = isValueReset ? 50 : calculatedFillValue;
	const fillValueOffset = `${ clamp( fillValue, 0, 100 ) }%`;

	const classes = classnames( 'components-range-control', className );

	const wrapperClasses = classnames(
		'components-range-control__wrapper',
		!! marks && 'is-marked'
	);

	const id = useInstanceId( RangeControl, 'inspector-range-control' );
	const describedBy = !! help ? `${ id }__help` : undefined;
	const enableTooltip = showTooltipProp !== false && isFinite( value );

	const handleOnRangeChange = ( event ) => {
		const nextValue = parseFloat( event.target.value );
		setValue( nextValue );
		onChange( nextValue );
	};

	const handleOnChange = ( nextValue ) => {
		nextValue = parseFloat( nextValue );
		setValue( nextValue );
		/*
		 * Calls onChange only when nextValue is numeric
		 * otherwise may queue a reset for the blur event.
		 */
		if ( ! isNaN( nextValue ) ) {
			if ( nextValue < min || nextValue > max ) {
				nextValue = floatClamp( nextValue, min, max );
			}
			onChange( nextValue );
			isResetPendent.current = false;
		} else if ( allowReset ) {
			isResetPendent.current = true;
		}
	};

	const handleOnInputNumberBlur = () => {
		if ( isResetPendent.current ) {
			handleOnReset();
			isResetPendent.current = false;
		}
	};

	const handleOnReset = () => {
		let resetValue = parseFloat( resetFallbackValue );
		let onChangeResetValue = resetValue;

		if ( isNaN( resetValue ) ) {
			resetValue = null;
			onChangeResetValue = undefined;
		}

		setValue( resetValue );

		/**
		 * Previously, this callback would always receive undefined as
		 * an argument. This behavior is unexpected, specifically
		 * when resetFallbackValue is defined.
		 *
		 * The value of undefined is not ideal. Passing it through
		 * to internal <input /> elements would change it from a
		 * controlled component to an uncontrolled component.
		 *
		 * For now, to minimize unexpected regressions, we're going to
		 * preserve the undefined callback argument, except when a
		 * resetFallbackValue is defined.
		 */
		onChange( onChangeResetValue );
	};

	const handleShowTooltip = () => setShowTooltip( true );
	const handleHideTooltip = () => setShowTooltip( false );

	const handleOnBlur = ( event ) => {
		onBlur( event );
		setIsFocused( false );
		handleHideTooltip();
	};

	const handleOnFocus = ( event ) => {
		onFocus( event );
		setIsFocused( true );
		handleShowTooltip();
	};

	const offsetStyle = {
		[ isRTL() ? 'right' : 'left' ]: fillValueOffset,
	};

	return (
		<BaseControl
			className={ classes }
			label={ label }
			id={ id }
			help={ help }
		>
			<Root className="components-range-control__root">
				{ beforeIcon && (
					<BeforeIconWrapper>
						<Icon icon={ beforeIcon } />
					</BeforeIconWrapper>
				) }
				<Wrapper
					className={ wrapperClasses }
					color={ colorProp }
					marks={ !! marks }
				>
					<InputRange
						{ ...props }
						className="components-range-control__slider"
						describedBy={ describedBy }
						disabled={ disabled }
						id={ id }
						isShiftStepEnabled={ isShiftStepEnabled }
						label={ label }
						max={ max }
						min={ min }
						onBlur={ handleOnBlur }
						onChange={ handleOnRangeChange }
						onFocus={ handleOnFocus }
						onMouseMove={ onMouseMove }
						onMouseLeave={ onMouseLeave }
						ref={ setRef }
						shiftStep={ shiftStep }
						step={ step }
						value={ inputSliderValue }
					/>
					<RangeRail
						aria-hidden={ true }
						disabled={ disabled }
						marks={ marks }
						max={ max }
						min={ min }
						railColor={ railColor }
						step={ step }
						value={ rangeFillValue }
					/>
					<Track
						aria-hidden={ true }
						className="components-range-control__track"
						disabled={ disabled }
						style={ { width: fillValueOffset } }
						trackColor={ trackColor }
					/>
					<ThumbWrapper style={ offsetStyle }>
						<Thumb
							aria-hidden={ true }
							isFocused={ isThumbFocused }
						/>
					</ThumbWrapper>
					{ enableTooltip && (
						<SimpleTooltip
							className="components-range-control__tooltip"
							inputRef={ inputRef }
							renderTooltipContent={ renderTooltipContent }
							show={ isCurrentlyFocused || showTooltip }
							style={ offsetStyle }
							value={ value }
						/>
					) }
				</Wrapper>
				{ afterIcon && (
					<AfterIconWrapper>
						<Icon icon={ afterIcon } />
					</AfterIconWrapper>
				) }
				{ withInputField && (
					<InputNumber
						aria-label={ label }
						className="components-range-control__number"
						disabled={ disabled }
						inputMode="decimal"
						isShiftStepEnabled={ isShiftStepEnabled }
						max={ max }
						min={ min }
						onBlur={ handleOnInputNumberBlur }
						onChange={ handleOnChange }
						shiftStep={ shiftStep }
						step={ step }
						value={ inputSliderValue }
					/>
				) }
				{ allowReset && (
					<ActionRightWrapper>
						<Button
							className="components-range-control__reset"
							disabled={ disabled || value === undefined }
							isSecondary
							isSmall
							onClick={ handleOnReset }
						>
							{ __( 'Reset' ) }
						</Button>
					</ActionRightWrapper>
				) }
			</Root>
		</BaseControl>
	);
}

const ForwardedComponent = forwardRef( RangeControl );

export default ForwardedComponent;
