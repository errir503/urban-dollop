/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
// import { useSelect, useDispatch } from '@wordpress/data';
import {
	AlignmentToolbar,
	BlockControls,
	useBlockProps,
	Warning,
} from '@wordpress/block-editor';
import { ToolbarGroup } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import HeadingLevelDropdown from '../heading/heading-level-dropdown';

const SUPPORTED_TYPES = [ 'archive' ];

export default function QueryTitleEdit( {
	attributes: { type, level, textAlign },
	setAttributes,
} ) {
	const TagName = `h${ level }`;
	const blockProps = useBlockProps( {
		className: classnames( {
			[ `has-text-align-${ textAlign }` ]: textAlign,
			'wp-block-query-title__placeholder': type === 'archive',
		} ),
	} );
	// The plan is to augment this block with more
	// block variations like `Search Title`.
	if ( ! SUPPORTED_TYPES.includes( type ) ) {
		return (
			<div { ...blockProps }>
				<Warning>{ __( 'Provided type is not supported.' ) }</Warning>
			</div>
		);
	}

	let titleElement;
	if ( type === 'archive' ) {
		titleElement = (
			<TagName { ...blockProps }>{ __( 'Archive title' ) }</TagName>
		);
	}
	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<HeadingLevelDropdown
						selectedLevel={ level }
						onChange={ ( newLevel ) =>
							setAttributes( { level: newLevel } )
						}
					/>
				</ToolbarGroup>
				<AlignmentToolbar
					value={ textAlign }
					onChange={ ( nextAlign ) => {
						setAttributes( { textAlign: nextAlign } );
					} }
				/>
			</BlockControls>
			{ titleElement }
		</>
	);
}
