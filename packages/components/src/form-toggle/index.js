/**
 * External dependencies
 */
import classnames from 'classnames';
import { noop } from 'lodash';

function FormToggle( {
	className,
	checked,
	id,
	disabled,
	onChange = noop,
	...props
} ) {
	const wrapperClasses = classnames( 'components-form-toggle', className, {
		'is-checked': checked,
		'is-disabled': disabled,
	} );

	return (
		<span className={ wrapperClasses }>
			<input
				className="components-form-toggle__input"
				id={ id }
				type="checkbox"
				checked={ checked }
				onChange={ onChange }
				disabled={ disabled }
				{ ...props }
			/>
			<span className="components-form-toggle__track"></span>
			<span className="components-form-toggle__thumb"></span>
		</span>
	);
}

export default FormToggle;
