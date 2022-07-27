/**
 * External dependencies
 */
import { render, screen } from '@testing-library/react';
import styled from '@emotion/styled';

/**
 * WordPress dependencies
 */
import { cloneElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { contextConnect } from '../context-connect';
import { ContextSystemProvider } from '../context-system-provider';
import { useContextSystem } from '../use-context-system';

const View = styled.div``;

describe( 'props', () => {
	test( 'should render correctly', () => {
		const Component = ( props, ref ) => (
			<View { ...useContextSystem( props, 'Component' ) } ref={ ref } />
		);
		const ConnectedComponent = contextConnect( Component, 'Component' );
		const { container } = render(
			<ContextSystemProvider>
				<ConnectedComponent />
			</ContextSystemProvider>
		);

		expect( container.firstChild ).toMatchSnapshot();
	} );

	test( 'should render context props', () => {
		const Component = ( props, ref ) => {
			const { quote, ...otherProps } = useContextSystem(
				props,
				'Component'
			);
			return (
				<View { ...otherProps } ref={ ref }>
					{ quote }
				</View>
			);
		};

		const ConnectedComponent = contextConnect( Component, 'Component' );

		const contextValue = {
			Component: {
				quote: 'Code is Poetry',
			},
		};

		const { container } = render(
			<ContextSystemProvider value={ contextValue }>
				<ConnectedComponent />
			</ContextSystemProvider>
		);

		expect( container.firstChild ).toMatchSnapshot();
		expect( container.firstChild.innerHTML ).toContain( 'Code is Poetry' );
	} );

	test( 'should render _override props', () => {
		const Component = ( props, ref ) => {
			const { quote, ...otherProps } = useContextSystem(
				props,
				'Component'
			);
			return (
				<View { ...otherProps } ref={ ref }>
					{ quote }
				</View>
			);
		};

		const ConnectedComponent = contextConnect( Component, 'Component' );

		const contextValue = {
			Component: {
				_overrides: {
					quote: 'Code is Poetry',
				},
			},
		};

		const { container } = render(
			<>
				<ContextSystemProvider value={ contextValue }>
					<ConnectedComponent
						className="test-component"
						quote="WordPress.org"
					/>
				</ContextSystemProvider>
			</>
		);

		expect( container.firstChild ).toMatchSnapshot();

		const el = container.querySelector( '.test-component' );

		expect( el.innerHTML ).toContain( 'Code is Poetry' );
		expect( el.innerHTML ).not.toContain( 'WordPress.org' );
	} );
} );

describe( 'children', () => {
	test( 'should pass through children', () => {
		const Component = ( props, ref ) => (
			<View { ...useContextSystem( props, 'Component' ) } ref={ ref } />
		);
		const ConnectedComponent = contextConnect( Component, 'Component' );

		render(
			<ContextSystemProvider>
				<ConnectedComponent>Pass through</ConnectedComponent>
			</ContextSystemProvider>
		);

		expect( screen.getByText( 'Pass through' ) ).toBeInTheDocument();
	} );

	test( 'should not accept children via `context`', () => {
		const Component = ( props, ref ) => (
			<View { ...useContextSystem( props, 'Component' ) } ref={ ref } />
		);
		const ConnectedComponent = contextConnect( Component, 'Component' );

		render(
			<ContextSystemProvider
				context={ { Component: { children: 'Override' } } }
			>
				<ConnectedComponent />
			</ContextSystemProvider>
		);

		expect( screen.queryByText( 'Override' ) ).not.toBeInTheDocument();
	} );

	// This matches the behavior for normal, non-context-connected components.
	test( 'should not override inherent children', () => {
		const Component = ( props, ref ) => (
			<View { ...useContextSystem( props, 'Component' ) } ref={ ref }>
				Inherent
			</View>
		);
		const ConnectedComponent = contextConnect( Component, 'Component' );
		const NormalComponent = ( props ) => <div { ...props }>Inherent</div>;

		render(
			<ContextSystemProvider>
				<ConnectedComponent />
				<ConnectedComponent>Explicit children</ConnectedComponent>
				<NormalComponent />
				<NormalComponent>Explicit children</NormalComponent>
			</ContextSystemProvider>
		);

		expect( screen.getAllByText( 'Inherent' ) ).toHaveLength( 4 );
	} );

	describe( 'when connected component does a `cloneElement()`', () => {
		// eslint-disable-next-line no-unused-vars
		const ComponentThatClones = ( { content, ...props }, _ref ) =>
			cloneElement(
				content,
				useContextSystem( props, 'ComponentThatClones' )
			);
		const ConnectedComponentThatClones = contextConnect(
			ComponentThatClones,
			'ComponentThatClones'
		);

		test( 'should not override cloned inherent children with implicit `undefined` children', () => {
			render(
				<ContextSystemProvider>
					<ConnectedComponentThatClones
						content={ <span>Inherent</span> }
					/>
				</ContextSystemProvider>
			);
			expect( screen.getByText( 'Inherent' ) ).toBeInTheDocument();
		} );

		test( 'should override cloned inherent children with explicit children', () => {
			render(
				<ContextSystemProvider>
					<ConnectedComponentThatClones
						content={ <span>Inherent</span> }
					>
						Explicit children
					</ConnectedComponentThatClones>
				</ContextSystemProvider>
			);
			expect(
				screen.getByText( 'Explicit children' )
			).toBeInTheDocument();
		} );
	} );
} );
