/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import {
	AlignmentControl,
	BlockControls,
	InspectorControls,
	useBlockProps,
	PlainText,
} from '@wordpress/block-editor';
import { ToggleControl, TextControl, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import HeadingLevelDropdown from '../heading/heading-level-dropdown';
import { useIsEditablePostBlock } from '../utils/hooks';

export default function PostTitleEdit( {
	clientId,
	attributes: { level, textAlign, isLink, rel, linkTarget },
	setAttributes,
	context: { postType, postId },
} ) {
	const TagName = 0 === level ? 'p' : 'h' + level;
	const isEditable = useIsEditablePostBlock( clientId );
	const post = useSelect(
		( select ) =>
			select( coreStore ).getEditedEntityRecord(
				'postType',
				postType,
				postId
			),
		[ postType, postId ]
	);
	const { editEntityRecord } = useDispatch( coreStore );

	const blockProps = useBlockProps( {
		className: classnames( {
			[ `has-text-align-${ textAlign }` ]: textAlign,
		} ),
	} );

	if ( ! post ) {
		return null;
	}

	const { title = '', link } = post;

	let titleElement = (
		<TagName { ...( isLink ? {} : blockProps ) }>
			{ __( 'An example title' ) }
		</TagName>
	);

	if ( postType && postId ) {
		titleElement = isEditable ? (
			<PlainText
				tagName={ TagName }
				placeholder={ __( 'No Title' ) }
				value={ title }
				onChange={ ( value ) =>
					editEntityRecord( 'postType', postType, postId, {
						title: value,
					} )
				}
				__experimentalVersion={ 2 }
				{ ...( isLink ? {} : blockProps ) }
			/>
		) : (
			<TagName { ...( isLink ? {} : blockProps ) }>{ title }</TagName>
		);
	}

	if ( isLink ) {
		titleElement = isEditable ? (
			<TagName { ...blockProps }>
				<PlainText
					tagName="a"
					href={ link }
					target={ linkTarget }
					rel={ rel }
					placeholder={ title.length === 0 ? __( 'No Title' ) : null }
					value={ title }
					onChange={ ( value ) =>
						editEntityRecord( 'postType', postType, postId, {
							title: value,
						} )
					}
					__experimentalVersion={ 2 }
				/>
			</TagName>
		) : (
			<TagName { ...blockProps }>
				<a
					href={ link }
					target={ linkTarget }
					rel={ rel }
					onClick={ ( event ) => event.preventDefault() }
				>
					{ title }
				</a>
			</TagName>
		);
	}

	return (
		<>
			<BlockControls group="block">
				<HeadingLevelDropdown
					selectedLevel={ level }
					onChange={ ( newLevel ) =>
						setAttributes( { level: newLevel } )
					}
				/>
				<AlignmentControl
					value={ textAlign }
					onChange={ ( nextAlign ) => {
						setAttributes( { textAlign: nextAlign } );
					} }
				/>
			</BlockControls>
			<InspectorControls>
				<PanelBody title={ __( 'Link settings' ) }>
					<ToggleControl
						label={ __( 'Make title a link' ) }
						onChange={ () => setAttributes( { isLink: ! isLink } ) }
						checked={ isLink }
					/>
					{ isLink && (
						<>
							<ToggleControl
								label={ __( 'Open in new tab' ) }
								onChange={ ( value ) =>
									setAttributes( {
										linkTarget: value ? '_blank' : '_self',
									} )
								}
								checked={ linkTarget === '_blank' }
							/>
							<TextControl
								label={ __( 'Link rel' ) }
								value={ rel }
								onChange={ ( newRel ) =>
									setAttributes( { rel: newRel } )
								}
							/>
						</>
					) }
				</PanelBody>
			</InspectorControls>
			{ titleElement }
		</>
	);
}
