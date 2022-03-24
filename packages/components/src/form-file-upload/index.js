/**
 * WordPress dependencies
 */
import { useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Button from '../button';

function FormFileUpload( {
	accept,
	children,
	multiple = false,
	onChange,
	onClick,
	render,
	...props
} ) {
	const ref = useRef();
	const openFileDialog = () => {
		ref.current.click();
	};

	const ui = render ? (
		render( { openFileDialog } )
	) : (
		<Button onClick={ openFileDialog } { ...props }>
			{ children }
		</Button>
	);
	return (
		<div className="components-form-file-upload">
			{ ui }
			<input
				type="file"
				ref={ ref }
				multiple={ multiple }
				style={ { display: 'none' } }
				accept={ accept }
				onChange={ onChange }
				onClick={ onClick }
				data-testid="form-file-upload-input"
			/>
		</div>
	);
}

export default FormFileUpload;
