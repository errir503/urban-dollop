/**
 * Check if a template is revertable to its original theme-provided template file.
 *
 * @param {Object} template The template entity to check.
 * @return {boolean} Whether the template is revertable.
 */
export default function isTemplateRevertable( template ) {
	if ( ! template ) {
		return false;
	}
	/* eslint-disable camelcase */
	return template?.source === 'custom' && template?.has_theme_file;
	/* eslint-enable camelcase */
}
