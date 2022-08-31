/**
 * Internal dependencies
 */
import type { Context, ContextualField, OmitNevers } from './helpers';

import type { BaseEntityRecords as _BaseEntityRecords } from './base-entity-records';

declare module './base-entity-records' {
	export namespace BaseEntityRecords {
		export interface NavMenu< C extends Context > {
			/**
			 * Unique identifier for the term.
			 */
			id: number;
			/**
			 * HTML description of the term.
			 */
			description: ContextualField< string, 'view' | 'edit', C >;
			/**
			 * HTML title for the term.
			 */
			name: string;
			/**
			 * An alphanumeric identifier for the term unique to its type.
			 */
			slug: string;
			/**
			 * Meta fields.
			 */
			meta: ContextualField<
				Record< string, string >,
				'view' | 'edit',
				C
			>;
			/**
			 * The locations assigned to the menu.
			 */
			locations: ContextualField< string[], 'view' | 'edit', C >;
			/**
			 * The DB ID of the original object this menu item represents, e . g . ID for posts and term_id for categories.
			 */
			object_id: number;
			/**
			 * Whether to automatically add top level pages to this menu.
			 */
			auto_add: ContextualField< boolean, 'view' | 'edit', C >;
		}
	}
}

export type NavMenu< C extends Context = 'edit' > = OmitNevers<
	_BaseEntityRecords.NavMenu< C >
>;
