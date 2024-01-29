/**
 * WordPress dependencies
 */
import {
	CheckboxControl,
	Flex,
	privateApis as componentsPrivateApis,
} from '@wordpress/components';

/**
 * Internal dependencies
 */
import { getFontFaceVariantName } from './utils';
import FontFaceDemo from './font-demo';
import { unlock } from '../../../lock-unlock';

function CollectionFontVariant( {
	face,
	font,
	handleToggleVariant,
	selected,
} ) {
	const handleToggleActivation = () => {
		if ( font?.fontFace ) {
			handleToggleVariant( font, face );
			return;
		}
		handleToggleVariant( font );
	};

	const displayName = font.name + ' ' + getFontFaceVariantName( face );
	const { kebabCase } = unlock( componentsPrivateApis );
	const checkboxId = kebabCase(
		`${ font.slug }-${ getFontFaceVariantName( face ) }`
	);

	return (
		<label
			className="font-library-modal__library-font-variant"
			htmlFor={ checkboxId }
		>
			<Flex justify="flex-start" align="center" gap="1rem">
				<CheckboxControl
					checked={ selected }
					onChange={ handleToggleActivation }
					__nextHasNoMarginBottom={ true }
					id={ checkboxId }
					label={ false }
				/>
				<FontFaceDemo fontFace={ face } text={ displayName } />
			</Flex>
		</label>
	);
}

export default CollectionFontVariant;
