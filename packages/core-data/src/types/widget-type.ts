/**
 * Internal dependencies
 */
import { Context, OmitNevers } from './helpers';

import { BaseEntityTypes as _BaseEntityTypes } from './base-entity-types';

declare module './base-entity-types' {
	export namespace BaseEntityTypes {
		export interface WidgetType< C extends Context > {
			/**
			 * Unique slug identifying the widget type.
			 */
			id: string;
			/**
			 * Human-readable name identifying the widget type.
			 */
			name: string;
			/**
			 * Description of the widget.
			 */
			description: string;
			/**
			 * Whether the widget supports multiple instances
			 */
			is_multi: boolean;
			/**
			 * Class name
			 */
			classname: string;
		}
	}
}

export type WidgetType< C extends Context > = OmitNevers<
	_BaseEntityTypes.WidgetType< C >
>;
