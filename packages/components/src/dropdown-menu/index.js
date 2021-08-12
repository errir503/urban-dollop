/**
 * External dependencies
 */
import classnames from 'classnames';
import { flatMap, isEmpty, isFunction } from 'lodash';

/**
 * WordPress dependencies
 */
import { DOWN } from '@wordpress/keycodes';
import deprecated from '@wordpress/deprecated';
import { menu } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import Button from '../button';
import Dropdown from '../dropdown';
import { NavigableMenu } from '../navigable-container';

function mergeProps( defaultProps = {}, props = {} ) {
	const mergedProps = {
		...defaultProps,
		...props,
	};

	if ( props.className && defaultProps.className ) {
		mergedProps.className = classnames(
			props.className,
			defaultProps.className
		);
	}

	return mergedProps;
}

function DropdownMenu( {
	children,
	className,
	controls,
	icon = menu,
	label,
	popoverProps,
	toggleProps,
	menuProps,
	disableOpenOnArrowDown = false,
	text,
	// The following props exist for backward compatibility.
	menuLabel,
	position,
	noIcons,
} ) {
	if ( menuLabel ) {
		deprecated( '`menuLabel` prop in `DropdownComponent`', {
			since: '5.3',
			alternative: '`menuProps` object and its `aria-label` property',
		} );
	}

	if ( position ) {
		deprecated( '`position` prop in `DropdownComponent`', {
			since: '5.3',
			alternative: '`popoverProps` object and its `position` property',
		} );
	}

	if ( isEmpty( controls ) && ! isFunction( children ) ) {
		return null;
	}

	// Normalize controls to nested array of objects (sets of controls)
	let controlSets;
	if ( ! isEmpty( controls ) ) {
		controlSets = controls;
		if ( ! Array.isArray( controlSets[ 0 ] ) ) {
			controlSets = [ controlSets ];
		}
	}
	const mergedPopoverProps = mergeProps(
		{
			className: 'components-dropdown-menu__popover',
			position,
		},
		popoverProps
	);

	return (
		<Dropdown
			className={ classnames( 'components-dropdown-menu', className ) }
			popoverProps={ mergedPopoverProps }
			renderToggle={ ( { isOpen, onToggle } ) => {
				const openOnArrowDown = ( event ) => {
					if ( disableOpenOnArrowDown ) {
						return;
					}

					if ( ! isOpen && event.keyCode === DOWN ) {
						event.preventDefault();
						onToggle();
					}
				};
				const mergedToggleProps = mergeProps(
					{
						className: classnames(
							'components-dropdown-menu__toggle',
							{
								'is-opened': isOpen,
							}
						),
					},
					toggleProps
				);

				return (
					<Button
						{ ...mergedToggleProps }
						icon={ icon }
						onClick={ ( event ) => {
							onToggle( event );
							if ( mergedToggleProps.onClick ) {
								mergedToggleProps.onClick( event );
							}
						} }
						onKeyDown={ ( event ) => {
							openOnArrowDown( event );
							if ( mergedToggleProps.onKeyDown ) {
								mergedToggleProps.onKeyDown( event );
							}
						} }
						aria-haspopup="true"
						aria-expanded={ isOpen }
						label={ label }
						text={ text }
						showTooltip={ toggleProps?.showTooltip ?? true }
					>
						{ mergedToggleProps.children }
					</Button>
				);
			} }
			renderContent={ ( props ) => {
				const mergedMenuProps = mergeProps(
					{
						'aria-label': menuLabel || label,
						className: classnames(
							'components-dropdown-menu__menu',
							{ 'no-icons': noIcons }
						),
					},
					menuProps
				);

				return (
					<NavigableMenu { ...mergedMenuProps } role="menu">
						{ isFunction( children ) ? children( props ) : null }
						{ flatMap( controlSets, ( controlSet, indexOfSet ) =>
							controlSet.map( ( control, indexOfControl ) => (
								<Button
									key={ [
										indexOfSet,
										indexOfControl,
									].join() }
									onClick={ ( event ) => {
										event.stopPropagation();
										props.onClose();
										if ( control.onClick ) {
											control.onClick();
										}
									} }
									className={ classnames(
										'components-dropdown-menu__menu-item',
										{
											'has-separator':
												indexOfSet > 0 &&
												indexOfControl === 0,
											'is-active': control.isActive,
										}
									) }
									icon={ control.icon }
									aria-checked={
										control.role === 'menuitemcheckbox' ||
										control.role === 'menuitemradio'
											? control.isActive
											: undefined
									}
									role={
										control.role === 'menuitemcheckbox' ||
										control.role === 'menuitemradio'
											? control.role
											: 'menuitem'
									}
									disabled={ control.isDisabled }
								>
									{ control.title }
								</Button>
							) )
						) }
					</NavigableMenu>
				);
			} }
		/>
	);
}

export default DropdownMenu;
