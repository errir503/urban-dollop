/**
 * Internal dependencies
 */
import {
	toggleFeature,
	setTemplate,
	addTemplate,
	removeTemplate,
	setTemplatePart,
	setPage,
	showHomepage,
	setHomeTemplateId,
	setIsListViewOpened,
} from '../actions';

describe( 'actions', () => {
	describe( 'toggleFeature', () => {
		it( 'should return TOGGLE_FEATURE action', () => {
			const feature = 'name';
			expect( toggleFeature( feature ) ).toEqual( {
				type: 'TOGGLE_FEATURE',
				feature,
			} );
		} );
	} );

	describe( 'setTemplate', () => {
		it( 'should return the SET_TEMPLATE action when slug is provided', () => {
			const templateId = 1;
			const templateSlug = 'archive';
			const it = setTemplate( templateId, templateSlug );
			expect( it.next().value ).toEqual( {
				type: 'SET_TEMPLATE',
				templateId,
				page: { context: { templateSlug } },
			} );
		} );
		it( 'should return the SET_TEMPLATE by getting the template slug', () => {
			const templateId = 1;
			const template = { slug: 'index' };
			const it = setTemplate( templateId );
			expect( it.next().value ).toEqual( {
				type: '@@data/RESOLVE_SELECT',
				storeKey: 'core',
				selectorName: 'getEntityRecord',
				args: [ 'postType', 'wp_template', templateId ],
			} );
			expect( it.next( template ).value ).toEqual( {
				type: 'SET_TEMPLATE',
				templateId,
				page: { context: { templateSlug: template.slug } },
			} );
		} );
	} );

	describe( 'addTemplate', () => {
		it( 'should yield the DISPATCH control to create the template and return the SET_TEMPLATE action', () => {
			const template = { slug: 'index' };
			const newTemplate = { id: 1, slug: 'index' };

			const it = addTemplate( template );
			expect( it.next().value ).toEqual( {
				type: '@@data/DISPATCH',
				storeKey: 'core',
				actionName: 'saveEntityRecord',
				args: [ 'postType', 'wp_template', template ],
			} );
			expect( it.next( newTemplate ) ).toEqual( {
				value: {
					type: 'SET_TEMPLATE',
					templateId: newTemplate.id,
					page: { context: { templateSlug: newTemplate.slug } },
				},
				done: true,
			} );
		} );
	} );

	describe( 'removeTemplate', () => {
		it( 'should issue a REST request to delete the template, then read the current page and then set the page with an updated template list', () => {
			const templateId = 1;
			const page = { path: '/' };

			const it = removeTemplate( templateId );
			expect( it.next().value ).toEqual( {
				type: 'API_FETCH',
				request: {
					path: `/wp/v2/templates/${ templateId }`,
					method: 'DELETE',
				},
			} );
			expect( it.next().value ).toEqual( {
				type: '@@data/SELECT',
				storeKey: 'core/edit-site',
				selectorName: 'getPage',
				args: [],
			} );
			expect( it.next( page ).value ).toEqual( {
				type: '@@data/DISPATCH',
				storeKey: 'core/edit-site',
				actionName: 'setPage',
				args: [ page ],
			} );
			expect( it.next().done ).toBe( true );
		} );
	} );

	describe( 'setTemplatePart', () => {
		it( 'should return the SET_TEMPLATE_PART action', () => {
			const templatePartId = 1;
			expect( setTemplatePart( templatePartId ) ).toEqual( {
				type: 'SET_TEMPLATE_PART',
				templatePartId,
			} );
		} );
	} );

	describe( 'setPage', () => {
		it( 'should yield the FIND_TEMPLATE control and return the SET_PAGE action', () => {
			const page = { path: '/' };

			const it = setPage( page );
			expect( it.next().value ).toEqual( {
				type: '@@data/RESOLVE_SELECT',
				storeKey: 'core',
				selectorName: '__experimentalGetTemplateForLink',
				args: [ page.path ],
			} );
			expect( it.next( { id: 'tt1-blocks//single' } ).value ).toEqual( {
				type: 'SET_PAGE',
				page,
				templateId: 'tt1-blocks//single',
			} );
			expect( it.next().done ).toBe( true );
		} );
	} );

	describe( 'showHomepage', () => {
		it( 'should calculate and set the homepage if it is set to show posts', () => {
			const it = showHomepage();

			expect( it.next().value ).toEqual( {
				args: [ 'root', 'site' ],
				selectorName: 'getEntityRecord',
				storeKey: 'core',
				type: '@@data/RESOLVE_SELECT',
			} );

			expect( it.next( { show_on_front: 'posts' } ).value ).toEqual( {
				args: [],
				selectorName: 'getSettings',
				storeKey: 'core/edit-site',
				type: '@@data/SELECT',
			} );

			const page = {
				path: 'http:/my-site',
				context: {},
			};

			expect( it.next( { siteUrl: 'http:/my-site' } ).value ).toEqual( {
				type: '@@data/RESOLVE_SELECT',
				storeKey: 'core',
				selectorName: '__experimentalGetTemplateForLink',
				args: [ page.path ],
			} );
			expect( it.next( { id: 'theme//slug' } ).value ).toEqual( {
				type: 'SET_PAGE',
				page,
				templateId: 'theme//slug',
			} );
			expect( it.next( 'theme//slug' ).value ).toEqual( {
				type: 'SET_HOME_TEMPLATE',
				homeTemplateId: 'theme//slug',
			} );
			expect( it.next().done ).toBe( true );
		} );

		it( 'should calculate and set the homepage if it is set to show a page', () => {
			const pageId = 2;

			const it = showHomepage();

			expect( it.next().value ).toEqual( {
				args: [ 'root', 'site' ],
				selectorName: 'getEntityRecord',
				storeKey: 'core',
				type: '@@data/RESOLVE_SELECT',
			} );

			expect(
				it.next( { show_on_front: 'page', page_on_front: pageId } )
					.value
			).toEqual( {
				args: [],
				selectorName: 'getSettings',
				storeKey: 'core/edit-site',
				type: '@@data/SELECT',
			} );

			const page = {
				path: 'http:/my-site',
				context: {
					postType: 'page',
					postId: pageId,
				},
			};
			expect( it.next( { siteUrl: 'http:/my-site' } ).value ).toEqual( {
				type: '@@data/RESOLVE_SELECT',
				storeKey: 'core',
				selectorName: '__experimentalGetTemplateForLink',
				args: [ page.path ],
			} );
			expect( it.next( { id: 'theme//slug' } ).value ).toEqual( {
				type: 'SET_PAGE',
				page,
				templateId: 'theme//slug',
			} );
			expect( it.next( 'theme//slug' ).value ).toEqual( {
				type: 'SET_HOME_TEMPLATE',
				homeTemplateId: 'theme//slug',
			} );
			expect( it.next().done ).toBe( true );
		} );
	} );

	describe( 'setHomeTemplateId', () => {
		it( 'should return the SET_HOME_TEMPLATE action', () => {
			const homeTemplateId = 90;
			expect( setHomeTemplateId( homeTemplateId ) ).toEqual( {
				type: 'SET_HOME_TEMPLATE',
				homeTemplateId,
			} );
		} );
	} );

	describe( 'setIsListViewOpened', () => {
		it( 'should return the SET_IS_LIST_VIEW_OPENED action', () => {
			expect( setIsListViewOpened( true ) ).toEqual( {
				type: 'SET_IS_LIST_VIEW_OPENED',
				isOpen: true,
			} );
			expect( setIsListViewOpened( false ) ).toEqual( {
				type: 'SET_IS_LIST_VIEW_OPENED',
				isOpen: false,
			} );
		} );
	} );
} );
