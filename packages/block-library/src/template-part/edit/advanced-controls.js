/**
 * WordPress dependencies
 */
import { useEntityProp } from '@wordpress/core-data';
import { SelectControl, TextControl } from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { TemplatePartImportControls } from './import-controls';

export function TemplatePartAdvancedControls( {
	tagName,
	setAttributes,
	isEntityAvailable,
	templatePartId,
	defaultWrapper,
	hasInnerBlocks,
} ) {
	const [ area, setArea ] = useEntityProp(
		'postType',
		'wp_template_part',
		'area',
		templatePartId
	);

	const [ title, setTitle ] = useEntityProp(
		'postType',
		'wp_template_part',
		'title',
		templatePartId
	);

	const { areaOptions } = useSelect( ( select ) => {
		// FIXME: @wordpress/block-library should not depend on @wordpress/editor.
		// Blocks can be loaded into a *non-post* block editor.
		/* eslint-disable @wordpress/data-no-store-string-literals */
		const definedAreas =
			select( 'core/editor' ).__experimentalGetDefaultTemplatePartAreas();
		/* eslint-enable @wordpress/data-no-store-string-literals */
		return {
			areaOptions: definedAreas.map( ( { label, area: _area } ) => ( {
				label,
				value: _area,
			} ) ),
		};
	}, [] );

	return (
		<InspectorControls __experimentalGroup="advanced">
			{ isEntityAvailable && (
				<>
					<TextControl
						label={ __( 'Title' ) }
						value={ title }
						onChange={ ( value ) => {
							setTitle( value );
						} }
						onFocus={ ( event ) => event.target.select() }
					/>

					<SelectControl
						label={ __( 'Area' ) }
						labelPosition="top"
						options={ areaOptions }
						value={ area }
						onChange={ setArea }
					/>
				</>
			) }
			<SelectControl
				label={ __( 'HTML element' ) }
				options={ [
					{
						label: sprintf(
							/* translators: %s: HTML tag based on area. */
							__( 'Default based on area (%s)' ),
							`<${ defaultWrapper }>`
						),
						value: '',
					},
					{ label: '<header>', value: 'header' },
					{ label: '<main>', value: 'main' },
					{ label: '<section>', value: 'section' },
					{ label: '<article>', value: 'article' },
					{ label: '<aside>', value: 'aside' },
					{ label: '<footer>', value: 'footer' },
					{ label: '<div>', value: 'div' },
				] }
				value={ tagName || '' }
				onChange={ ( value ) => setAttributes( { tagName: value } ) }
			/>
			{ ! hasInnerBlocks && (
				<TemplatePartImportControls
					area={ area }
					setAttributes={ setAttributes }
				/>
			) }
		</InspectorControls>
	);
}
