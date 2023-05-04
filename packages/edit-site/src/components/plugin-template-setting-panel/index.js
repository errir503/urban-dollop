/**
 * Defines an extensibility slot for the Template sidebar.
 */

/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';

const { Fill, Slot } = createSlotFill( 'PluginTemplateSettingPanel' );

const PluginTemplateSettingPanel = Fill;
PluginTemplateSettingPanel.Slot = Slot;

/**
 * Renders items in the Template Sidebar below the main information
 * like the Template Card.
 *
 * @example
 * ```jsx
 * // Using ESNext syntax
 * import { PluginTemplateSettingPanel } from '@wordpress/edit-site';
 *
 * const MyTemplateSettingTest = () => (
 * 		<PluginTemplateSettingPanel>
 *			<p>Hello, World!</p>
 *		</PluginTemplateSettingPanel>
 *	);
 * ```
 *
 * @return {WPComponent} The component to be rendered.
 */
export default PluginTemplateSettingPanel;
