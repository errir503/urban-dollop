/**
 * External dependencies
 */
import classNames from 'classnames';
import removeAccents from 'remove-accents';

/**
 * WordPress dependencies
 */
import {
	RichText,
	__experimentalGetBorderClassesAndStyles as getBorderClassesAndStyles,
	__experimentalGetColorClassesAndStyles as getColorClassesAndStyles,
} from '@wordpress/block-editor';
import { __unstableStripHTML as stripHTML } from '@wordpress/dom';

const getNameFromLabelV1 = ( content ) => {
	return (
		removeAccents( stripHTML( content ) )
			// Convert anything that's not a letter or number to a hyphen.
			.replace( /[^\p{L}\p{N}]+/gu, '-' )
			// Convert to lowercase
			.toLowerCase()
			// Remove any remaining leading or trailing hyphens.
			.replace( /(^-+)|(-+$)/g, '' )
	);
};

// Version without wrapper div in saved markup
// See: https://github.com/WordPress/gutenberg/pull/56507
const v1 = {
	attributes: {
		type: {
			type: 'string',
			default: 'text',
		},
		name: {
			type: 'string',
		},
		label: {
			type: 'string',
			default: 'Label',
			selector: '.wp-block-form-input__label-content',
			source: 'html',
			__experimentalRole: 'content',
		},
		inlineLabel: {
			type: 'boolean',
			default: false,
		},
		required: {
			type: 'boolean',
			default: false,
			selector: '.wp-block-form-input__input',
			source: 'attribute',
			attribute: 'required',
		},
		placeholder: {
			type: 'string',
			selector: '.wp-block-form-input__input',
			source: 'attribute',
			attribute: 'placeholder',
			__experimentalRole: 'content',
		},
		value: {
			type: 'string',
			default: '',
			selector: 'input',
			source: 'attribute',
			attribute: 'value',
		},
		visibilityPermissions: {
			type: 'string',
			default: 'all',
		},
	},
	supports: {
		className: false,
		anchor: true,
		reusable: false,
		spacing: {
			margin: [ 'top', 'bottom' ],
		},
		__experimentalBorder: {
			radius: true,
			__experimentalSkipSerialization: true,
			__experimentalDefaultControls: {
				radius: true,
			},
		},
	},
	save( { attributes } ) {
		const { type, name, label, inlineLabel, required, placeholder, value } =
			attributes;

		const borderProps = getBorderClassesAndStyles( attributes );
		const colorProps = getColorClassesAndStyles( attributes );

		const inputStyle = {
			...borderProps.style,
			...colorProps.style,
		};

		const inputClasses = classNames(
			'wp-block-form-input__input',
			colorProps.className,
			borderProps.className
		);
		const TagName = type === 'textarea' ? 'textarea' : 'input';

		if ( 'hidden' === type ) {
			return <input type={ type } name={ name } value={ value } />;
		}

		/* eslint-disable jsx-a11y/label-has-associated-control */
		return (
			<label
				className={ classNames( 'wp-block-form-input__label', {
					'is-label-inline': inlineLabel,
				} ) }
			>
				<span className="wp-block-form-input__label-content">
					<RichText.Content value={ label } />
				</span>
				<TagName
					className={ inputClasses }
					type={ 'textarea' === type ? undefined : type }
					name={ name || getNameFromLabelV1( label ) }
					required={ required }
					aria-required={ required }
					placeholder={ placeholder || undefined }
					style={ inputStyle }
				/>
			</label>
		);
		/* eslint-enable jsx-a11y/label-has-associated-control */
	},
};

const deprecated = [ v1 ];

export default deprecated;
