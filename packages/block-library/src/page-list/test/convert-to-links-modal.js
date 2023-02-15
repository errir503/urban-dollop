/**
 * Internal dependencies
 */

import { convertToNavigationLinks } from '../use-convert-to-navigation-links';

// Mock createBlock to avoid creating the blocks in test environment
// as convertToNavigationLinks calls this method internally.
jest.mock( '@wordpress/blocks', () => {
	const blocks = jest.requireActual( '@wordpress/blocks' );

	return {
		...blocks,
		createBlock( name, attributes, innerBlocks ) {
			return {
				name,
				attributes,
				innerBlocks,
			};
		},
	};
} );

describe( 'page list convert to links', () => {
	describe( 'convertToNavigationLinks', () => {
		it( 'Can create submenus', () => {
			const pages = [
				{
					title: {
						raw: 'Sample Page',
						rendered: 'Sample Page',
					},
					id: 2,
					parent: 0,
					link: 'http://wordpress.local/sample-page/',
					type: 'page',
				},
				{
					title: {
						raw: 'About',
						rendered: 'About',
					},
					id: 34,
					parent: 0,
					link: 'http://wordpress.local/about/',
					type: 'page',
				},
				{
					title: {
						raw: 'Contact Page',
						rendered: 'Contact Page',
					},
					id: 37,
					parent: 0,
					link: 'http://wordpress.local/contact-page/',
					type: 'page',
				},
				{
					title: {
						raw: 'Test',
						rendered: 'Test',
					},
					id: 229,
					parent: 0,
					link: 'http://wordpress.local/test/',
					type: 'page',
				},
				{
					title: {
						raw: 'About Sub 1',
						rendered: 'About Sub 1',
					},
					id: 738,
					parent: 34,
					link: 'http://wordpress.local/about/about-sub-1/',
					type: 'page',
				},
				{
					title: {
						raw: 'About Sub 2',
						rendered: 'About Sub 2',
					},
					id: 740,
					parent: 34,
					link: 'http://wordpress.local/about/about-sub-2/',
					type: 'page',
				},
				{
					title: {
						raw: 'Test Sub',
						rendered: 'Test Sub',
					},
					id: 742,
					parent: 229,
					link: 'http://wordpress.local/test/test-sub/',
					type: 'page',
				},
				{
					title: {
						raw: 'Test Sub Sub',
						rendered: 'Test Sub Sub',
					},
					id: 744,
					parent: 742,
					link: 'http://wordpress.local/test/test-sub/test-sub-sub/',
					type: 'page',
				},
			];

			const convertLinks = convertToNavigationLinks( pages );

			expect( convertLinks ).toEqual( [
				{
					attributes: {
						id: 2,
						kind: 'post-type',
						label: 'Sample Page',
						type: 'page',
						url: 'http://wordpress.local/sample-page/',
					},
					innerBlocks: [],
					name: 'core/navigation-link',
				},
				{
					attributes: {
						id: 34,
						kind: 'post-type',
						label: 'About',
						type: 'page',
						url: 'http://wordpress.local/about/',
					},
					innerBlocks: [
						{
							attributes: {
								id: 738,
								kind: 'post-type',
								label: 'About Sub 1',
								type: 'page',
								url: 'http://wordpress.local/about/about-sub-1/',
							},
							innerBlocks: [],
							name: 'core/navigation-link',
						},
						{
							attributes: {
								id: 740,
								kind: 'post-type',
								label: 'About Sub 2',
								type: 'page',
								url: 'http://wordpress.local/about/about-sub-2/',
							},
							innerBlocks: [],
							name: 'core/navigation-link',
						},
					],
					name: 'core/navigation-submenu',
				},
				{
					attributes: {
						id: 37,
						kind: 'post-type',
						label: 'Contact Page',
						type: 'page',
						url: 'http://wordpress.local/contact-page/',
					},
					innerBlocks: [],
					name: 'core/navigation-link',
				},
				{
					attributes: {
						id: 229,
						kind: 'post-type',
						label: 'Test',
						type: 'page',
						url: 'http://wordpress.local/test/',
					},
					innerBlocks: [
						{
							attributes: {
								id: 742,
								kind: 'post-type',
								label: 'Test Sub',
								type: 'page',
								url: 'http://wordpress.local/test/test-sub/',
							},
							innerBlocks: [
								{
									attributes: {
										id: 744,
										kind: 'post-type',
										label: 'Test Sub Sub',
										type: 'page',
										url: 'http://wordpress.local/test/test-sub/test-sub-sub/',
									},
									innerBlocks: [],
									name: 'core/navigation-link',
								},
							],
							name: 'core/navigation-submenu',
						},
					],
					name: 'core/navigation-submenu',
				},
			] );
		} );
		it( 'Can create submenus, when children appear before parents', () => {
			const pages = [
				{
					title: {
						raw: 'About Sub 1',
						rendered: 'About Sub 1',
					},
					id: 738,
					parent: 34,
					link: 'http://wordpress.local/about/about-sub-1/',
					type: 'page',
				},
				{
					title: {
						raw: 'About Sub 2',
						rendered: 'About Sub 2',
					},
					id: 740,
					parent: 34,
					link: 'http://wordpress.local/about/about-sub-2/',
					type: 'page',
				},
				{
					title: {
						raw: 'Test Sub Sub',
						rendered: 'Test Sub Sub',
					},
					id: 744,
					parent: 742,
					link: 'http://wordpress.local/test/test-sub/test-sub-sub/',
					type: 'page',
				},
				{
					title: {
						raw: 'Test Sub',
						rendered: 'Test Sub',
					},
					id: 742,
					parent: 229,
					link: 'http://wordpress.local/test/test-sub/',
					type: 'page',
				},
				{
					title: {
						raw: 'Sample Page',
						rendered: 'Sample Page',
					},
					id: 2,
					parent: 0,
					link: 'http://wordpress.local/sample-page/',
					type: 'page',
				},
				{
					title: {
						raw: 'About',
						rendered: 'About',
					},
					id: 34,
					parent: 0,
					link: 'http://wordpress.local/about/',
					type: 'page',
				},
				{
					title: {
						raw: 'Contact Page',
						rendered: 'Contact Page',
					},
					id: 37,
					parent: 0,
					link: 'http://wordpress.local/contact-page/',
					type: 'page',
				},
				{
					title: {
						raw: 'Test',
						rendered: 'Test',
					},
					id: 229,
					parent: 0,
					link: 'http://wordpress.local/test/',
					type: 'page',
				},
			];

			const convertLinks = convertToNavigationLinks( pages );

			expect( convertLinks ).toEqual( [
				{
					attributes: {
						id: 2,
						kind: 'post-type',
						label: 'Sample Page',
						type: 'page',
						url: 'http://wordpress.local/sample-page/',
					},
					innerBlocks: [],
					name: 'core/navigation-link',
				},
				{
					attributes: {
						id: 34,
						kind: 'post-type',
						label: 'About',
						type: 'page',
						url: 'http://wordpress.local/about/',
					},
					innerBlocks: [
						{
							attributes: {
								id: 738,
								kind: 'post-type',
								label: 'About Sub 1',
								type: 'page',
								url: 'http://wordpress.local/about/about-sub-1/',
							},
							innerBlocks: [],
							name: 'core/navigation-link',
						},
						{
							attributes: {
								id: 740,
								kind: 'post-type',
								label: 'About Sub 2',
								type: 'page',
								url: 'http://wordpress.local/about/about-sub-2/',
							},
							innerBlocks: [],
							name: 'core/navigation-link',
						},
					],
					name: 'core/navigation-submenu',
				},
				{
					attributes: {
						id: 37,
						kind: 'post-type',
						label: 'Contact Page',
						type: 'page',
						url: 'http://wordpress.local/contact-page/',
					},
					innerBlocks: [],
					name: 'core/navigation-link',
				},
				{
					attributes: {
						id: 229,
						kind: 'post-type',
						label: 'Test',
						type: 'page',
						url: 'http://wordpress.local/test/',
					},
					innerBlocks: [
						{
							attributes: {
								id: 742,
								kind: 'post-type',
								label: 'Test Sub',
								type: 'page',
								url: 'http://wordpress.local/test/test-sub/',
							},
							innerBlocks: [
								{
									attributes: {
										id: 744,
										kind: 'post-type',
										label: 'Test Sub Sub',
										type: 'page',
										url: 'http://wordpress.local/test/test-sub/test-sub-sub/',
									},
									innerBlocks: [],
									name: 'core/navigation-link',
								},
							],
							name: 'core/navigation-submenu',
						},
					],
					name: 'core/navigation-submenu',
				},
			] );
		} );

		it( 'Can use a different parent page', () => {
			const pages = [
				{
					title: {
						raw: 'Sample Page',
						rendered: 'Sample Page',
					},
					id: 2,
					parent: 0,
					link: 'http://wordpress.local/sample-page/',
					type: 'page',
				},
				{
					title: {
						raw: 'About',
						rendered: 'About',
					},
					id: 34,
					parent: 0,
					link: 'http://wordpress.local/about/',
					type: 'page',
				},
				{
					title: {
						raw: 'Contact Page',
						rendered: 'Contact Page',
					},
					id: 37,
					parent: 0,
					link: 'http://wordpress.local/contact-page/',
					type: 'page',
				},
				{
					title: {
						raw: 'Test',
						rendered: 'Test',
					},
					id: 229,
					parent: 0,
					link: 'http://wordpress.local/test/',
					type: 'page',
				},
				{
					title: {
						raw: 'About Sub 1',
						rendered: 'About Sub 1',
					},
					id: 738,
					parent: 34,
					link: 'http://wordpress.local/about/about-sub-1/',
					type: 'page',
				},
				{
					title: {
						raw: 'About Sub 2',
						rendered: 'About Sub 2',
					},
					id: 740,
					parent: 34,
					link: 'http://wordpress.local/about/about-sub-2/',
					type: 'page',
				},
				{
					title: {
						raw: 'Test Sub',
						rendered: 'Test Sub',
					},
					id: 742,
					parent: 229,
					link: 'http://wordpress.local/test/test-sub/',
					type: 'page',
				},
				{
					title: {
						raw: 'Test Sub Sub',
						rendered: 'Test Sub Sub',
					},
					id: 744,
					parent: 742,
					link: 'http://wordpress.local/test/test-sub/test-sub-sub/',
					type: 'page',
				},
			];

			const convertLinksWithParentOneLevel = convertToNavigationLinks(
				pages,
				34
			);

			expect( convertLinksWithParentOneLevel ).toEqual( [
				{
					attributes: {
						id: 738,
						kind: 'post-type',
						label: 'About Sub 1',
						type: 'page',
						url: 'http://wordpress.local/about/about-sub-1/',
					},
					innerBlocks: [],
					name: 'core/navigation-link',
				},
				{
					attributes: {
						id: 740,
						kind: 'post-type',
						label: 'About Sub 2',
						type: 'page',
						url: 'http://wordpress.local/about/about-sub-2/',
					},
					innerBlocks: [],
					name: 'core/navigation-link',
				},
			] );

			const convertLinksWithParentTwoLevels = convertToNavigationLinks(
				pages,
				742
			);

			expect( convertLinksWithParentTwoLevels ).toEqual( [
				{
					attributes: {
						id: 744,
						kind: 'post-type',
						label: 'Test Sub Sub',
						type: 'page',
						url: 'http://wordpress.local/test/test-sub/test-sub-sub/',
					},
					innerBlocks: [],
					name: 'core/navigation-link',
				},
			] );
		} );
	} );
} );
