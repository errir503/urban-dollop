/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Icon, check } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import Button from '../button';
import Dropdown from '../dropdown';
import Tooltip from '../tooltip';

function Option( {
	className,
	isSelected,
	selectedIconProps,
	tooltipText,
	...additionalProps
} ) {
	const optionButton = (
		<Button
			isPressed={ isSelected }
			className={ classnames(
				className,
				'components-circular-option-picker__option'
			) }
			{ ...additionalProps }
		/>
	);
	return (
		<div className="components-circular-option-picker__option-wrapper">
			{ tooltipText ? (
				<Tooltip text={ tooltipText }>{ optionButton }</Tooltip>
			) : (
				optionButton
			) }
			{ isSelected && (
				<Icon
					icon={ check }
					{ ...( selectedIconProps ? selectedIconProps : {} ) }
				/>
			) }
		</div>
	);
}

function DropdownLinkAction( {
	buttonProps,
	className,
	dropdownProps,
	linkText,
} ) {
	return (
		<Dropdown
			className={ classnames(
				'components-circular-option-picker__dropdown-link-action',
				className
			) }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<Button
					aria-expanded={ isOpen }
					aria-haspopup="true"
					onClick={ onToggle }
					isLink
					{ ...buttonProps }
				>
					{ linkText }
				</Button>
			) }
			{ ...dropdownProps }
		/>
	);
}

function ButtonAction( { className, children, ...additionalProps } ) {
	return (
		<Button
			className={ classnames(
				'components-circular-option-picker__clear',
				className
			) }
			isSmall
			isSecondary
			{ ...additionalProps }
		>
			{ children }
		</Button>
	);
}

export default function CircularOptionPicker( {
	actions,
	className,
	options,
	children,
} ) {
	return (
		<div
			className={ classnames(
				'components-circular-option-picker',
				className
			) }
		>
			<div className="components-circular-option-picker__swatches">
				{ options }
			</div>
			{ children }
			{ actions && (
				<div className="components-circular-option-picker__custom-clear-wrapper">
					{ actions }
				</div>
			) }
		</div>
	);
}

CircularOptionPicker.Option = Option;
CircularOptionPicker.ButtonAction = ButtonAction;
CircularOptionPicker.DropdownLinkAction = DropdownLinkAction;
