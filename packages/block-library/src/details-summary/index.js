/**
 * WordPress dependencies
 */
import { heading as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import initBlock from '../utils/init-block';
import metadata from './block.json';
import edit from './edit';
import save from './save';

const { name } = metadata;
export { metadata, name };

export const settings = {
	icon,
	save,
	edit,
};

export const init = () => initBlock( { name, metadata, settings } );
