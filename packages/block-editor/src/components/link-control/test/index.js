/**
 * External dependencies
 */
import { render, unmountComponentAtNode } from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import { queryByText, queryByRole } from '@testing-library/react';
import { default as lodash, first, last, nth, uniqueId } from 'lodash';
/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { UP, DOWN, ENTER } from '@wordpress/keycodes';
/**
 * Internal dependencies
 */
import LinkControl from '../';
import { fauxEntitySuggestions, fetchFauxEntitySuggestions } from './fixtures';

// Mock debounce() so that it runs instantly.
lodash.debounce = jest.fn( ( callback ) => {
	callback.cancel = jest.fn();
	return callback;
} );

const mockFetchSearchSuggestions = jest.fn();

jest.mock( '@wordpress/data/src/components/use-select', () => () => ( {
	fetchSearchSuggestions: mockFetchSearchSuggestions,
} ) );

jest.mock( '@wordpress/data/src/components/use-dispatch', () => ( {
	useDispatch: () => ( { saveEntityRecords: jest.fn() } ),
} ) );

/**
 * Wait for next tick of event loop. This is required
 * because the `fetchSearchSuggestions` Promise will
 * resolve on the next tick of the event loop (this is
 * inline with the Promise spec). As a result we need to
 * wait on this loop to "tick" before we can expect the UI
 * to have updated.
 */
function eventLoopTick() {
	return new Promise( ( resolve ) => setImmediate( resolve ) );
}

let container = null;

beforeEach( () => {
	// setup a DOM element as a render target
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	mockFetchSearchSuggestions.mockImplementation( fetchFauxEntitySuggestions );
} );

afterEach( () => {
	// cleanup on exiting
	unmountComponentAtNode( container );
	container.remove();
	container = null;
	mockFetchSearchSuggestions.mockReset();
} );

function getURLInput() {
	return container.querySelector( 'input[aria-label="URL"]' );
}

function getSearchResults() {
	const input = getURLInput();
	// The input has `aria-owns` to indicate that it owns (and is related to)
	// the search results with `role="listbox"`.
	const relatedSelector = input.getAttribute( 'aria-owns' );

	// Select by relationship as well as role
	return container.querySelectorAll(
		`#${ relatedSelector }[role="listbox"] [role="option"]`
	);
}

function getCurrentLink() {
	return container.querySelector(
		'.block-editor-link-control__search-item.is-current'
	);
}

describe( 'Basic rendering', () => {
	it( 'should render', () => {
		act( () => {
			render( <LinkControl />, container );
		} );

		// Search Input UI
		const searchInput = getURLInput();

		expect( searchInput ).not.toBeNull();
		expect( container.innerHTML ).toMatchSnapshot();
	} );

	it( 'should not render protocol in links', async () => {
		mockFetchSearchSuggestions.mockImplementation( () =>
			Promise.resolve( [
				{
					id: uniqueId(),
					title: 'Hello Page',
					type: 'Page',
					info: '2 days ago',
					url: `http://example.com/?p=${ uniqueId() }`,
				},
				{
					id: uniqueId(),
					title: 'Hello Post',
					type: 'Post',
					info: '19 days ago',
					url: `https://example.com/${ uniqueId() }`,
				},
			] )
		);

		const searchTerm = 'Hello';

		act( () => {
			render( <LinkControl />, container );
		} );

		// Search Input UI
		const searchInput = getURLInput();

		// Simulate searching for a term
		act( () => {
			Simulate.change( searchInput, { target: { value: searchTerm } } );
		} );

		// fetchFauxEntitySuggestions resolves on next "tick" of event loop
		await eventLoopTick();

		// Find all elements with link
		// Filter out the element with the text 'ENTER' because it doesn't contain link
		const linkElements = Array.from(
			container.querySelectorAll(
				'.block-editor-link-control__search-item-info'
			)
		).filter( ( elem ) => ! elem.innerHTML.includes( 'ENTER' ) );

		linkElements.forEach( ( elem ) => {
			expect( elem.innerHTML ).not.toContain( '://' );
		} );
	} );

	describe( 'forceIsEditingLink', () => {
		const isEditing = () => !! getURLInput();

		it( 'undefined', () => {
			act( () => {
				render(
					<LinkControl value={ { url: 'https://example.com' } } />,
					container
				);
			} );

			expect( isEditing() ).toBe( false );
		} );

		it( 'true', () => {
			act( () => {
				render(
					<LinkControl
						value={ { url: 'https://example.com' } }
						forceIsEditingLink
					/>,
					container
				);
			} );

			expect( isEditing() ).toBe( true );
		} );

		it( 'false', () => {
			act( () => {
				render(
					<LinkControl value={ { url: 'https://example.com' } } />,
					container
				);
			} );

			// Click the "Edit" button to trigger into the editing mode.
			const editButton = Array.from(
				container.querySelectorAll( 'button' )
			).find( ( button ) => button.innerHTML.includes( 'Edit' ) );

			act( () => {
				Simulate.click( editButton );
			} );

			expect( isEditing() ).toBe( true );

			// If passed `forceIsEditingLink` of `false` while editing, should
			// forcefully reset to the preview state.
			act( () => {
				render(
					<LinkControl
						value={ { url: 'https://example.com' } }
						forceIsEditingLink={ false }
					/>,
					container
				);
			} );

			expect( isEditing() ).toBe( false );
		} );
	} );
} );

describe( 'Searching for a link', () => {
	it( 'should display loading UI when input is valid but search results have yet to be returned', async () => {
		const searchTerm = 'Hello';

		let resolver;

		const fauxRequest = () =>
			new Promise( ( resolve ) => {
				resolver = resolve;
			} );

		mockFetchSearchSuggestions.mockImplementation( fauxRequest );

		act( () => {
			render( <LinkControl />, container );
		} );

		// Search Input UI
		const searchInput = getURLInput();

		// Simulate searching for a term
		act( () => {
			Simulate.change( searchInput, { target: { value: searchTerm } } );
		} );

		// fetchFauxEntitySuggestions resolves on next "tick" of event loop
		await eventLoopTick();

		const searchResultElements = getSearchResults();

		let loadingUI = container.querySelector( '.components-spinner' );

		expect( searchResultElements ).toHaveLength( 0 );

		expect( loadingUI ).not.toBeNull();

		act( () => {
			resolver( fauxEntitySuggestions );
		} );

		await eventLoopTick();

		loadingUI = container.querySelector( '.components-spinner' );

		expect( loadingUI ).toBeNull();
	} );

	it( 'should display only search suggestions when current input value is not URL-like', async () => {
		const searchTerm = 'Hello world';
		const firstFauxSuggestion = first( fauxEntitySuggestions );

		act( () => {
			render( <LinkControl />, container );
		} );

		// Search Input UI
		const searchInput = getURLInput();

		// Simulate searching for a term
		act( () => {
			Simulate.change( searchInput, { target: { value: searchTerm } } );
		} );

		// fetchFauxEntitySuggestions resolves on next "tick" of event loop
		await eventLoopTick();
		// TODO: select these by aria relationship to autocomplete rather than arbitrary selector.

		const searchResultElements = getSearchResults();

		const firstSearchResultItemHTML = first( searchResultElements )
			.innerHTML;
		const lastSearchResultItemHTML = last( searchResultElements ).innerHTML;

		expect( searchResultElements ).toHaveLength(
			fauxEntitySuggestions.length
		);

		expect( searchInput.getAttribute( 'aria-expanded' ) ).toBe( 'true' );

		// Sanity check that a search suggestion shows up corresponding to the data
		expect( firstSearchResultItemHTML ).toEqual(
			expect.stringContaining( firstFauxSuggestion.title )
		);
		expect( firstSearchResultItemHTML ).toEqual(
			expect.stringContaining( firstFauxSuggestion.type )
		);

		// The fallback URL suggestion should not be shown when input is not URL-like
		expect( lastSearchResultItemHTML ).not.toEqual(
			expect.stringContaining( 'URL' )
		);
	} );

	it( 'should trim search term', async () => {
		const searchTerm = '   Hello    ';

		act( () => {
			render( <LinkControl />, container );
		} );

		// Search Input UI
		const searchInput = container.querySelector(
			'input[aria-label="URL"]'
		);

		// Simulate searching for a term
		act( () => {
			Simulate.change( searchInput, { target: { value: searchTerm } } );
		} );

		// fetchFauxEntitySuggestions resolves on next "tick" of event loop
		await eventLoopTick();

		const searchResultTextHighlightElements = Array.from(
			container.querySelectorAll(
				'[role="listbox"] button[role="option"] mark'
			)
		);

		const invalidResults = searchResultTextHighlightElements.find(
			( mark ) => mark.innerHTML !== 'Hello'
		);

		// Grab the first argument that was passed to the fetchSuggestions
		// handler (which is mocked out).
		const mockFetchSuggestionsFirstArg =
			mockFetchSearchSuggestions.mock.calls[ 0 ][ 0 ];

		// Given we're mocking out the results we should always have 4 mark elements.
		expect( searchResultTextHighlightElements ).toHaveLength( 4 );

		// Make sure there are no `mark` elements which contain anything other
		// than the trimmed search term (ie: no whitespace).
		expect( invalidResults ).toBeFalsy();

		// Implementation detail test to ensure that the fetch handler is called
		// with the trimmed search value. We do this because we are mocking out
		// the fetch handler in our test so we need to assert it would be called
		// correctly in a real world scenario.
		expect( mockFetchSuggestionsFirstArg ).toEqual( 'Hello' );
	} );

	it.each( [
		[ 'couldbeurlorentitysearchterm' ],
		[ 'ThisCouldAlsoBeAValidURL' ],
	] )(
		'should display a URL suggestion as a default fallback for the search term "%s" which could potentially be a valid url.',
		async ( searchTerm ) => {
			act( () => {
				render( <LinkControl />, container );
			} );

			// Search Input UI
			const searchInput = getURLInput();

			// Simulate searching for a term
			act( () => {
				Simulate.change( searchInput, {
					target: { value: searchTerm },
				} );
			} );

			// fetchFauxEntitySuggestions resolves on next "tick" of event loop
			await eventLoopTick();
			// TODO: select these by aria relationship to autocomplete rather than arbitrary selector.

			const searchResultElements = getSearchResults();

			const lastSearchResultItemHTML = last( searchResultElements )
				.innerHTML;
			const additionalDefaultFallbackURLSuggestionLength = 1;

			// We should see a search result for each of the expect search suggestions
			// plus 1 additional one for the fallback URL suggestion
			expect( searchResultElements ).toHaveLength(
				fauxEntitySuggestions.length +
					additionalDefaultFallbackURLSuggestionLength
			);

			// The last item should be a URL search suggestion
			expect( lastSearchResultItemHTML ).toEqual(
				expect.stringContaining( searchTerm )
			);
			expect( lastSearchResultItemHTML ).toEqual(
				expect.stringContaining( 'URL' )
			);
			expect( lastSearchResultItemHTML ).toEqual(
				expect.stringContaining( 'Press ENTER to add this link' )
			);
		}
	);

	it( 'should not display a URL suggestion as a default fallback when noURLSuggestion is passed.', async () => {
		act( () => {
			render( <LinkControl noURLSuggestion />, container );
		} );

		// Search Input UI
		const searchInput = getURLInput();

		// Simulate searching for a term
		act( () => {
			Simulate.change( searchInput, {
				target: { value: 'couldbeurlorentitysearchterm' },
			} );
		} );

		// fetchFauxEntitySuggestions resolves on next "tick" of event loop
		await eventLoopTick();
		// TODO: select these by aria relationship to autocomplete rather than arbitrary selector.

		const searchResultElements = getSearchResults();

		// We should see a search result for each of the expect search suggestions and nothing else
		expect( searchResultElements ).toHaveLength(
			fauxEntitySuggestions.length
		);
	} );
} );

describe( 'Manual link entry', () => {
	it.each( [
		[ 'https://make.wordpress.org' ], // explicit https
		[ 'http://make.wordpress.org' ], // explicit http
		[ 'www.wordpress.org' ], // usage of "www"
	] )(
		'should display a single suggestion result when the current input value is URL-like (eg: %s)',
		async ( searchTerm ) => {
			act( () => {
				render( <LinkControl />, container );
			} );

			// Search Input UI
			const searchInput = getURLInput();

			// Simulate searching for a term
			act( () => {
				Simulate.change( searchInput, {
					target: { value: searchTerm },
				} );
			} );

			// fetchFauxEntitySuggestions resolves on next "tick" of event loop
			await eventLoopTick();

			const searchResultElements = getSearchResults();

			const firstSearchResultItemHTML =
				searchResultElements[ 0 ].innerHTML;
			const expectedResultsLength = 1;

			expect( searchResultElements ).toHaveLength(
				expectedResultsLength
			);
			expect( firstSearchResultItemHTML ).toEqual(
				expect.stringContaining( searchTerm )
			);
			expect( firstSearchResultItemHTML ).toEqual(
				expect.stringContaining( 'URL' )
			);
			expect( firstSearchResultItemHTML ).toEqual(
				expect.stringContaining( 'Press ENTER to add this link' )
			);
		}
	);

	describe( 'Alternative link protocols and formats', () => {
		it.each( [
			[ 'mailto:example123456@wordpress.org', 'mailto' ],
			[ 'tel:example123456@wordpress.org', 'tel' ],
			[ '#internal-anchor', 'internal' ],
		] )(
			'should recognise "%s" as a %s link and handle as manual entry by displaying a single suggestion',
			async ( searchTerm, searchType ) => {
				act( () => {
					render( <LinkControl />, container );
				} );

				// Search Input UI
				const searchInput = getURLInput();

				// Simulate searching for a term
				act( () => {
					Simulate.change( searchInput, {
						target: { value: searchTerm },
					} );
				} );

				// fetchFauxEntitySuggestions resolves on next "tick" of event loop
				await eventLoopTick();

				const searchResultElements = getSearchResults();

				const firstSearchResultItemHTML =
					searchResultElements[ 0 ].innerHTML;
				const expectedResultsLength = 1;

				expect( searchResultElements ).toHaveLength(
					expectedResultsLength
				);
				expect( firstSearchResultItemHTML ).toEqual(
					expect.stringContaining( searchTerm )
				);
				expect( firstSearchResultItemHTML ).toEqual(
					expect.stringContaining( searchType )
				);
				expect( firstSearchResultItemHTML ).toEqual(
					expect.stringContaining( 'Press ENTER to add this link' )
				);
			}
		);
	} );
} );

describe( 'Default search suggestions', () => {
	it( 'should display a list of initial search suggestions when there is no search value or suggestions', async () => {
		const expectedResultsLength = 3; // set within `LinkControl`

		act( () => {
			render( <LinkControl showInitialSuggestions />, container );
		} );

		await eventLoopTick();

		// Search Input UI
		const searchInput = getURLInput();

		const searchResultsWrapper = container.querySelector(
			'[role="listbox"]'
		);
		const initialSearchResultElements = searchResultsWrapper.querySelectorAll(
			'[role="option"]'
		);

		const searchResultsLabel = container.querySelector(
			`#${ searchResultsWrapper.getAttribute( 'aria-labelledby' ) }`
		);

		// Verify input has no value has default suggestions should only show
		// when this does not have a value
		expect( searchInput.value ).toBe( '' );

		// Ensure only called once as a guard against potential infinite
		// re-render loop within `componentDidUpdate` calling `updateSuggestions`
		// which has calls to `setState` within it.
		expect( mockFetchSearchSuggestions ).toHaveBeenCalledTimes( 1 );

		// Verify the search results already display the initial suggestions
		expect( initialSearchResultElements ).toHaveLength(
			expectedResultsLength
		);

		expect( searchResultsLabel.innerHTML ).toEqual( 'Recently updated' );
	} );

	it( 'should not display initial suggestions when input value is present', async () => {
		// Render with an initial value an ensure that no initial suggestions
		// are shown.
		//
		act( () => {
			render(
				<LinkControl
					showInitialSuggestions
					value={ fauxEntitySuggestions[ 0 ] }
				/>,
				container
			);
		} );

		await eventLoopTick();

		expect( mockFetchSearchSuggestions ).not.toHaveBeenCalled();

		//
		// Click the "Edit/Change" button and check initial suggestions are not
		// shown.
		//
		const currentLinkUI = getCurrentLink();
		const currentLinkBtn = currentLinkUI.querySelector( 'button' );

		act( () => {
			Simulate.click( currentLinkBtn );
		} );

		const searchInput = getURLInput();
		searchInput.focus();

		await eventLoopTick();

		const searchResultElements = getSearchResults();

		// search input is set to the URL value
		expect( searchInput.value ).toEqual( fauxEntitySuggestions[ 0 ].url );

		// it should match any url that's like ?p= and also include a URL option
		expect( searchResultElements ).toHaveLength( 5 );

		expect( searchInput.getAttribute( 'aria-expanded' ) ).toBe( 'true' );

		expect( mockFetchSearchSuggestions ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should display initial suggestions when input value is manually deleted', async () => {
		const searchTerm = 'Hello world';

		act( () => {
			render( <LinkControl showInitialSuggestions />, container );
		} );

		let searchResultElements;
		let searchInput;

		// Search Input UI
		searchInput = getURLInput();

		// Simulate searching for a term
		act( () => {
			Simulate.change( searchInput, { target: { value: searchTerm } } );
		} );

		// fetchFauxEntitySuggestions resolves on next "tick" of event loop
		await eventLoopTick();

		expect( searchInput.value ).toBe( searchTerm );

		searchResultElements = getSearchResults();

		// delete the text
		act( () => {
			Simulate.change( searchInput, { target: { value: '' } } );
		} );

		await eventLoopTick();

		searchResultElements = getSearchResults();

		searchInput = getURLInput();

		// check the input is empty now
		expect( searchInput.value ).toBe( '' );

		const searchResultLabel = container.querySelector(
			'.block-editor-link-control__search-results-label'
		);

		expect( searchResultLabel.innerHTML ).toBe( 'Recently updated' );

		expect( searchResultElements ).toHaveLength( 3 );
	} );

	it( 'should not display initial suggestions when there are no recently updated pages/posts', async () => {
		const noResults = [];
		// Force API returning empty results for recently updated Pages.
		mockFetchSearchSuggestions.mockImplementation( () =>
			Promise.resolve( noResults )
		);

		act( () => {
			render( <LinkControl showInitialSuggestions />, container );
		} );

		await eventLoopTick();

		const searchInput = getURLInput();

		const searchResultElements = getSearchResults();

		const searchResultLabel = container.querySelector(
			'.block-editor-link-control__search-results-label'
		);

		expect( searchResultLabel ).toBeFalsy();

		expect( searchResultElements ).toHaveLength( 0 );

		expect( searchInput.getAttribute( 'aria-expanded' ) ).toBe( 'false' );
	} );
} );

describe( 'Creating Entities (eg: Posts, Pages)', () => {
	const noResults = [];
	beforeEach( () => {
		// Force returning empty results for existing Pages. Doing this means that the only item
		// shown should be "Create Page" suggestion because there will be no search suggestions
		// and our input does not conform to a direct entry schema (eg: a URL).
		mockFetchSearchSuggestions.mockImplementation( () =>
			Promise.resolve( noResults )
		);
	} );
	it.each( [
		[ 'HelloWorld', 'without spaces' ],
		[ 'Hello World', 'with spaces' ],
	] )(
		'should allow creating a link for a valid Entity title "%s" (%s)',
		async ( entityNameText ) => {
			let resolver;
			let resolvedEntity;

			const createSuggestion = ( title ) =>
				new Promise( ( resolve ) => {
					resolver = ( arg ) => {
						resolve( arg );
					};
					resolvedEntity = {
						title,
						id: 123,
						url: '/?p=123',
						type: 'page',
					};
				} );

			const LinkControlConsumer = () => {
				const [ link, setLink ] = useState( null );

				return (
					<LinkControl
						value={ link }
						onChange={ ( suggestion ) => {
							setLink( suggestion );
						} }
						createSuggestion={ createSuggestion }
					/>
				);
			};

			act( () => {
				render( <LinkControlConsumer />, container );
			} );

			// Search Input UI
			const searchInput = container.querySelector(
				'input[aria-label="URL"]'
			);

			// Simulate searching for a term
			act( () => {
				Simulate.change( searchInput, {
					target: { value: entityNameText },
				} );
			} );

			await eventLoopTick();

			// TODO: select these by aria relationship to autocomplete rather than arbitrary selector.
			const searchResultElements = container.querySelectorAll(
				'[role="listbox"] [role="option"]'
			);

			const createButton = first(
				Array.from( searchResultElements ).filter( ( result ) =>
					result.innerHTML.includes( 'Create:' )
				)
			);

			expect( createButton ).not.toBeNull();
			expect( createButton.innerHTML ).toEqual(
				expect.stringContaining( entityNameText )
			);

			// No need to wait in this test because we control the Promise
			// resolution manually via the `resolver` reference
			act( () => {
				Simulate.click( createButton );
			} );

			await eventLoopTick();

			// Check for loading indicator
			const loadingIndicator = container.querySelector(
				'.block-editor-link-control__loading'
			);
			const currentLinkLabel = container.querySelector(
				'[aria-label="Currently selected"]'
			);

			expect( currentLinkLabel ).toBeNull();
			expect( loadingIndicator.innerHTML ).toEqual(
				expect.stringContaining( 'Creating' )
			);

			// Resolve the `createSuggestion` promise
			await act( async () => {
				resolver( resolvedEntity );
			} );

			await eventLoopTick();

			const currentLink = container.querySelector(
				'[aria-label="Currently selected"]'
			);

			const currentLinkHTML = currentLink.innerHTML;

			expect( currentLinkHTML ).toEqual(
				expect.stringContaining( entityNameText )
			);
			expect( currentLinkHTML ).toEqual(
				expect.stringContaining( '/?p=123' )
			);
		}
	);

	it( 'should allow createSuggestion prop to return a non-Promise value', async () => {
		const LinkControlConsumer = () => {
			const [ link, setLink ] = useState( null );

			return (
				<LinkControl
					value={ link }
					onChange={ ( suggestion ) => {
						setLink( suggestion );
					} }
					createSuggestion={ ( title ) => ( {
						title,
						id: 123,
						url: '/?p=123',
						type: 'page',
					} ) }
				/>
			);
		};

		act( () => {
			render( <LinkControlConsumer />, container );
		} );

		// Search Input UI
		const searchInput = container.querySelector(
			'input[aria-label="URL"]'
		);

		// Simulate searching for a term
		act( () => {
			Simulate.change( searchInput, {
				target: { value: 'Some new page to create' },
			} );
		} );

		await eventLoopTick();

		// TODO: select these by aria relationship to autocomplete rather than arbitrary selector.
		const searchResultElements = container.querySelectorAll(
			'[role="listbox"] [role="option"]'
		);

		const createButton = first(
			Array.from( searchResultElements ).filter( ( result ) =>
				result.innerHTML.includes( 'Create:' )
			)
		);

		await act( async () => {
			Simulate.click( createButton );
		} );

		await eventLoopTick();

		const currentLink = container.querySelector(
			'[aria-label="Currently selected"]'
		);

		const currentLinkHTML = currentLink.innerHTML;

		expect( currentLinkHTML ).toEqual(
			expect.stringContaining( 'Some new page to create' )
		);
		expect( currentLinkHTML ).toEqual(
			expect.stringContaining( '/?p=123' )
		);
	} );

	it( 'should allow creation of entities via the keyboard', async () => {
		const entityNameText = 'A new page to be created';

		const LinkControlConsumer = () => {
			const [ link, setLink ] = useState( null );

			return (
				<LinkControl
					value={ link }
					onChange={ ( suggestion ) => {
						setLink( suggestion );
					} }
					createSuggestion={ ( title ) =>
						Promise.resolve( {
							title,
							id: 123,
							url: '/?p=123',
							type: 'page',
						} )
					}
				/>
			);
		};

		act( () => {
			render( <LinkControlConsumer />, container );
		} );

		// Search Input UI
		const searchInput = container.querySelector(
			'input[aria-label="URL"]'
		);

		// Simulate searching for a term
		act( () => {
			Simulate.change( searchInput, {
				target: { value: entityNameText },
			} );
		} );

		await eventLoopTick();

		// TODO: select these by aria relationship to autocomplete rather than arbitrary selector.
		const searchResultElements = container.querySelectorAll(
			'[role="listbox"] [role="option"]'
		);
		const form = container.querySelector( 'form' );
		const createButton = first(
			Array.from( searchResultElements ).filter( ( result ) =>
				result.innerHTML.includes( 'Create:' )
			)
		);

		// Step down into the search results, highlighting the first result item
		act( () => {
			Simulate.keyDown( searchInput, { keyCode: DOWN } );
		} );

		act( () => {
			Simulate.keyDown( createButton, { keyCode: ENTER } );
		} );

		await act( async () => {
			Simulate.submit( form );
		} );

		await eventLoopTick();

		const currentLink = container.querySelector(
			'[aria-label="Currently selected"]'
		);

		const currentLinkHTML = currentLink.innerHTML;

		expect( currentLinkHTML ).toEqual(
			expect.stringContaining( entityNameText )
		);
	} );

	it( 'should allow customisation of button text', async () => {
		const entityNameText = 'A new page to be created';

		const LinkControlConsumer = () => {
			return (
				<LinkControl
					createSuggestion={ () => {} }
					createSuggestionButtonText="Custom suggestion text"
				/>
			);
		};

		act( () => {
			render( <LinkControlConsumer />, container );
		} );

		// Search Input UI
		const searchInput = container.querySelector(
			'input[aria-label="URL"]'
		);

		// Simulate searching for a term
		act( () => {
			Simulate.change( searchInput, {
				target: { value: entityNameText },
			} );
		} );

		await eventLoopTick();

		// TODO: select these by aria relationship to autocomplete rather than arbitrary selector.
		const searchResultElements = container.querySelectorAll(
			'[role="listbox"] [role="option"]'
		);

		const createButton = first(
			Array.from( searchResultElements ).filter( ( result ) =>
				result.innerHTML.includes( 'Custom suggestion text' )
			)
		);

		expect( createButton ).not.toBeNull();
	} );

	describe( 'Do not show create option', () => {
		it.each( [ [ undefined ], [ null ], [ false ] ] )(
			'should not show not show an option to create an entity when "createSuggestion" handler is %s',
			async ( handler ) => {
				act( () => {
					render(
						<LinkControl createSuggestion={ handler } />,
						container
					);
				} );
				// Await the initial suggestions to be fetched
				await eventLoopTick();

				// Search Input UI
				const searchInput = container.querySelector(
					'input[aria-label="URL"]'
				);

				// TODO: select these by aria relationship to autocomplete rather than arbitrary selector.
				const searchResultElements = container.querySelectorAll(
					'[role="listbox"] [role="option"]'
				);
				const createButton = first(
					Array.from( searchResultElements ).filter( ( result ) =>
						result.innerHTML.includes( 'Create:' )
					)
				);

				// Verify input has no value
				expect( searchInput.value ).toBe( '' );
				expect( createButton ).toBeFalsy(); // shouldn't exist!
			}
		);

		it( 'should not show not show an option to create an entity when input is empty', async () => {
			act( () => {
				render(
					<LinkControl
						showInitialSuggestions={ true } // should show even if we're not showing initial suggestions
						createSuggestion={ jest.fn() }
					/>,
					container
				);
			} );
			// Await the initial suggestions to be fetched
			await eventLoopTick();

			// Search Input UI
			const searchInput = container.querySelector(
				'input[aria-label="URL"]'
			);

			// TODO: select these by aria relationship to autocomplete rather than arbitrary selector.
			const searchResultElements = container.querySelectorAll(
				'[role="listbox"] [role="option"]'
			);
			const createButton = first(
				Array.from( searchResultElements ).filter( ( result ) =>
					result.innerHTML.includes( 'New page' )
				)
			);

			// Verify input has no value
			expect( searchInput.value ).toBe( '' );
			expect( createButton ).toBeFalsy(); // shouldn't exist!
		} );

		it.each( [
			'https://wordpress.org',
			'www.wordpress.org',
			'mailto:example123456@wordpress.org',
			'tel:example123456@wordpress.org',
			'#internal-anchor',
		] )(
			'should not show option to "Create Page" when text is a form of direct entry (eg: %s)',
			async ( inputText ) => {
				act( () => {
					render(
						<LinkControl createSuggestion={ jest.fn() } />,
						container
					);
				} );

				// Search Input UI
				const searchInput = container.querySelector(
					'input[aria-label="URL"]'
				);

				// Simulate searching for a term
				act( () => {
					Simulate.change( searchInput, {
						target: { value: inputText },
					} );
				} );

				await eventLoopTick();

				// TODO: select these by aria relationship to autocomplete rather than arbitrary selector.
				const searchResultElements = container.querySelectorAll(
					'[role="listbox"] [role="option"]'
				);

				const createButton = first(
					Array.from( searchResultElements ).filter( ( result ) =>
						result.innerHTML.includes( 'New page' )
					)
				);

				expect( createButton ).toBeFalsy(); // shouldn't exist!
			}
		);
	} );

	describe( 'Error handling', () => {
		it( 'should display human-friendly, perceivable error notice and re-show create button and search input if page creation request fails', async () => {
			const searchText = 'This page to be created';
			let searchInput;

			const throwsError = () => {
				throw new Error( 'API response returned invalid entity.' ); // this can be any error and msg
			};

			const createSuggestion = () => Promise.reject( throwsError() );

			act( () => {
				render(
					<LinkControl createSuggestion={ createSuggestion } />,
					container
				);
			} );

			// Search Input UI
			searchInput = container.querySelector( 'input[aria-label="URL"]' );

			// Simulate searching for a term
			act( () => {
				Simulate.change( searchInput, {
					target: { value: searchText },
				} );
			} );

			await eventLoopTick();

			// TODO: select these by aria relationship to autocomplete rather than arbitrary selector.
			let searchResultElements = container.querySelectorAll(
				'[role="listbox"] [role="option"]'
			);
			let createButton = first(
				Array.from( searchResultElements ).filter( ( result ) =>
					result.innerHTML.includes( 'Create:' )
				)
			);

			await act( async () => {
				Simulate.click( createButton );
			} );

			await eventLoopTick();

			searchInput = container.querySelector( 'input[aria-label="URL"]' );

			// This is a Notice component
			// we allow selecting by className here as an edge case because the
			// a11y is handled via `speak`.
			// See: https://github.com/WordPress/gutenberg/tree/HEAD/packages/a11y#speak.
			const errorNotice = container.querySelector(
				'.block-editor-link-control__search-error'
			);

			// Catch the error in the test to avoid test failures
			expect( throwsError ).toThrow( Error );

			// Check human readable error notice is perceivable
			expect( errorNotice ).not.toBeFalsy();
			expect( errorNotice.innerHTML ).toEqual(
				expect.stringContaining(
					'API response returned invalid entity'
				)
			);

			// Verify input is repopulated with original search text
			expect( searchInput ).not.toBeFalsy();
			expect( searchInput.value ).toBe( searchText );

			// Verify search results are re-shown and create button is available.
			searchResultElements = container.querySelectorAll(
				'[role="listbox"] [role="option"]'
			);
			createButton = first(
				Array.from( searchResultElements ).filter( ( result ) =>
					result.innerHTML.includes( 'New page' )
				)
			);
		} );
	} );
} );

describe( 'Selecting links', () => {
	it( 'should display a selected link corresponding to the provided "currentLink" prop', () => {
		const selectedLink = first( fauxEntitySuggestions );

		const LinkControlConsumer = () => {
			const [ link ] = useState( selectedLink );

			return <LinkControl value={ link } />;
		};

		act( () => {
			render( <LinkControlConsumer />, container );
		} );

		// TODO: select by aria role or visible text
		const currentLink = getCurrentLink();
		const currentLinkHTML = currentLink.innerHTML;
		const currentLinkAnchor = currentLink.querySelector(
			`[href="${ selectedLink.url }"]`
		);

		expect( currentLinkHTML ).toEqual(
			expect.stringContaining( selectedLink.title )
		);
		expect(
			queryByRole( currentLink, 'button', { name: 'Edit' } )
		).toBeTruthy();
		expect( currentLinkAnchor ).not.toBeNull();
	} );

	it( 'should hide "selected" link UI and display search UI prepopulated with previously selected link title when "Change" button is clicked', () => {
		const selectedLink = first( fauxEntitySuggestions );

		const LinkControlConsumer = () => {
			const [ link, setLink ] = useState( selectedLink );

			return (
				<LinkControl
					value={ link }
					onChange={ ( suggestion ) => setLink( suggestion ) }
				/>
			);
		};

		act( () => {
			render( <LinkControlConsumer />, container );
		} );

		// Required in order to select the button below
		let currentLinkUI = getCurrentLink();
		const currentLinkBtn = currentLinkUI.querySelector( 'button' );

		// Simulate searching for a term
		act( () => {
			Simulate.click( currentLinkBtn );
		} );

		const searchInput = getURLInput();
		currentLinkUI = getCurrentLink();

		// We should be back to showing the search input
		expect( searchInput ).not.toBeNull();
		expect( searchInput.value ).toBe( selectedLink.url ); // prepopulated with previous link's URL
		expect( currentLinkUI ).toBeNull();
	} );

	describe( 'Selection using mouse click', () => {
		it.each( [
			[ 'entity', 'hello world', first( fauxEntitySuggestions ) ], // entity search
			[
				'url',
				'https://www.wordpress.org',
				{
					id: '1',
					title: 'https://www.wordpress.org',
					url: 'https://www.wordpress.org',
					type: 'URL',
				},
			], // url
		] )(
			'should display a current selected link UI when a %s suggestion for the search "%s" is clicked',
			async ( type, searchTerm, selectedLink ) => {
				const LinkControlConsumer = () => {
					const [ link, setLink ] = useState();

					return (
						<LinkControl
							value={ link }
							onChange={ ( suggestion ) => setLink( suggestion ) }
						/>
					);
				};

				act( () => {
					render( <LinkControlConsumer />, container );
				} );

				// Search Input UI
				const searchInput = getURLInput();

				// Simulate searching for a term
				act( () => {
					Simulate.change( searchInput, {
						target: { value: searchTerm },
					} );
				} );

				// fetchFauxEntitySuggestions resolves on next "tick" of event loop
				await eventLoopTick();

				const searchResultElements = getSearchResults();

				const firstSearchSuggestion = first( searchResultElements );

				// Simulate selecting the first of the search suggestions
				act( () => {
					Simulate.click( firstSearchSuggestion );
				} );

				const currentLink = container.querySelector(
					'.block-editor-link-control__search-item.is-current'
				);
				const currentLinkHTML = currentLink.innerHTML;
				const currentLinkAnchor = currentLink.querySelector(
					`[href="${ selectedLink.url }"]`
				);

				// Check that this suggestion is now shown as selected
				expect( currentLinkHTML ).toEqual(
					expect.stringContaining( selectedLink.title )
				);
				expect( currentLinkHTML ).toEqual(
					expect.stringContaining( 'Edit' )
				);
				expect( currentLinkAnchor ).not.toBeNull();
			}
		);
	} );

	describe( 'Selection using keyboard', () => {
		it.each( [
			[ 'entity', 'hello world', first( fauxEntitySuggestions ) ], // entity search
			[
				'url',
				'https://www.wordpress.org',
				{
					id: '1',
					title: 'https://www.wordpress.org',
					url: 'https://www.wordpress.org',
					type: 'URL',
				},
			], // url
		] )(
			'should display a current selected link UI when an %s suggestion for the search "%s" is selected using the keyboard',
			async ( type, searchTerm, selectedLink ) => {
				const LinkControlConsumer = () => {
					const [ link, setLink ] = useState();

					return (
						<LinkControl
							value={ link }
							onChange={ ( suggestion ) => setLink( suggestion ) }
						/>
					);
				};

				act( () => {
					render( <LinkControlConsumer />, container );
				} );

				// Search Input UI
				const searchInput = getURLInput();
				searchInput.focus();
				const form = container.querySelector( 'form' );

				// Simulate searching for a term
				act( () => {
					Simulate.change( searchInput, {
						target: { value: searchTerm },
					} );
				} );

				//fetchFauxEntitySuggestions resolves on next "tick" of event loop
				await eventLoopTick();

				// Step down into the search results, highlighting the first result item
				act( () => {
					Simulate.keyDown( searchInput, { keyCode: DOWN } );
				} );

				const searchResultElements = getSearchResults();

				const firstSearchSuggestion = first( searchResultElements );
				const secondSearchSuggestion = nth( searchResultElements, 1 );

				let selectedSearchResultElement = container.querySelector(
					'[role="option"][aria-selected="true"]'
				);

				// We should have highlighted the first item using the keyboard
				expect( selectedSearchResultElement ).toEqual(
					firstSearchSuggestion
				);

				// Only entity searches contain more than 1 suggestion
				if ( type === 'entity' ) {
					// Check we can go down again using the down arrow
					act( () => {
						Simulate.keyDown( searchInput, { keyCode: DOWN } );
					} );

					selectedSearchResultElement = container.querySelector(
						'[role="option"][aria-selected="true"]'
					);

					// We should have highlighted the first item using the keyboard
					expect( selectedSearchResultElement ).toEqual(
						secondSearchSuggestion
					);

					// Check we can go back up via up arrow
					act( () => {
						Simulate.keyDown( searchInput, { keyCode: UP } );
					} );

					selectedSearchResultElement = container.querySelector(
						'[role="option"][aria-selected="true"]'
					);

					// We should be back to highlighting the first search result again
					expect( selectedSearchResultElement ).toEqual(
						firstSearchSuggestion
					);
				}

				// Commit the selected item as the current link
				act( () => {
					Simulate.keyDown( searchInput, { keyCode: ENTER } );
				} );
				act( () => {
					Simulate.submit( form );
				} );

				// Check that the suggestion selected via is now shown as selected
				const currentLink = container.querySelector(
					'.block-editor-link-control__search-item.is-current'
				);
				const currentLinkHTML = currentLink.innerHTML;
				const currentLinkAnchor = currentLink.querySelector(
					`[href="${ selectedLink.url }"]`
				);

				// Make sure focus is retained after submission.
				expect( container.contains( document.activeElement ) ).toBe(
					true
				);

				expect( currentLinkHTML ).toEqual(
					expect.stringContaining( selectedLink.title )
				);
				expect( currentLinkHTML ).toEqual(
					expect.stringContaining( 'Edit' )
				);
				expect( currentLinkAnchor ).not.toBeNull();
			}
		);

		it( 'should allow selection of initial search results via the keyboard', async () => {
			act( () => {
				render( <LinkControl showInitialSuggestions />, container );
			} );

			await eventLoopTick();

			const searchResultsWrapper = container.querySelector(
				'[role="listbox"]'
			);

			const searchResultsLabel = container.querySelector(
				`#${ searchResultsWrapper.getAttribute( 'aria-labelledby' ) }`
			);

			expect( searchResultsLabel.innerHTML ).toEqual(
				'Recently updated'
			);

			// Search Input UI
			const searchInput = getURLInput();

			// Step down into the search results, highlighting the first result item
			act( () => {
				Simulate.keyDown( searchInput, { keyCode: DOWN } );
			} );

			await eventLoopTick();

			const searchResultElements = getSearchResults();

			const firstSearchSuggestion = first( searchResultElements );
			const secondSearchSuggestion = nth( searchResultElements, 1 );

			let selectedSearchResultElement = container.querySelector(
				'[role="option"][aria-selected="true"]'
			);

			// We should have highlighted the first item using the keyboard
			expect( selectedSearchResultElement ).toEqual(
				firstSearchSuggestion
			);

			// Check we can go down again using the down arrow
			act( () => {
				Simulate.keyDown( searchInput, { keyCode: DOWN } );
			} );

			selectedSearchResultElement = container.querySelector(
				'[role="option"][aria-selected="true"]'
			);

			// We should have highlighted the first item using the keyboard
			expect( selectedSearchResultElement ).toEqual(
				secondSearchSuggestion
			);

			// Check we can go back up via up arrow
			act( () => {
				Simulate.keyDown( searchInput, { keyCode: UP } );
			} );

			selectedSearchResultElement = container.querySelector(
				'[role="option"][aria-selected="true"]'
			);

			// We should be back to highlighting the first search result again
			expect( selectedSearchResultElement ).toEqual(
				firstSearchSuggestion
			);

			expect( mockFetchSearchSuggestions ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );

describe( 'Addition Settings UI', () => {
	it( 'should display "New Tab" setting (in "off" mode) by default when a link is selected', async () => {
		const selectedLink = first( fauxEntitySuggestions );
		const expectedSettingText = 'Open in new tab';

		const LinkControlConsumer = () => {
			const [ link ] = useState( selectedLink );

			return <LinkControl value={ link } />;
		};

		act( () => {
			render( <LinkControlConsumer />, container );
		} );

		const newTabSettingLabel = Array.from(
			container.querySelectorAll( 'label' )
		).find(
			( label ) =>
				label.innerHTML &&
				label.innerHTML.includes( expectedSettingText )
		);
		expect( newTabSettingLabel ).not.toBeUndefined(); // find() returns "undefined" if not found

		const newTabSettingLabelForAttr = newTabSettingLabel.getAttribute(
			'for'
		);
		const newTabSettingInput = container.querySelector(
			`#${ newTabSettingLabelForAttr }`
		);
		expect( newTabSettingInput ).not.toBeNull();
		expect( newTabSettingInput.checked ).toBe( false );
	} );

	it( 'should display a setting control with correct default state for each of the custom settings provided', async () => {
		const selectedLink = first( fauxEntitySuggestions );

		const customSettings = [
			{
				id: 'newTab',
				title: 'Open in new tab',
			},
			{
				id: 'noFollow',
				title: 'No follow',
			},
		];

		const customSettingsLabelsText = customSettings.map(
			( setting ) => setting.title
		);

		const LinkControlConsumer = () => {
			const [ link ] = useState( selectedLink );

			return (
				<LinkControl
					value={ { ...link, newTab: false, noFollow: true } }
					settings={ customSettings }
				/>
			);
		};

		act( () => {
			render( <LinkControlConsumer />, container );
		} );

		// Grab the elements using user perceivable DOM queries
		const settingsLegend = Array.from(
			container.querySelectorAll( 'legend' )
		).find(
			( legend ) =>
				legend.innerHTML &&
				legend.innerHTML.includes( 'Currently selected link settings' )
		);
		const settingsFieldset = settingsLegend.closest( 'fieldset' );
		const settingControlsLabels = Array.from(
			settingsFieldset.querySelectorAll( 'label' )
		);
		const settingControlsInputs = settingControlsLabels.map( ( label ) => {
			return settingsFieldset.querySelector(
				`#${ label.getAttribute( 'for' ) }`
			);
		} );

		const settingControlLabelsText = Array.from(
			settingControlsLabels
		).map( ( label ) => label.innerHTML );

		// Check we have the correct number of controls
		expect( settingControlsLabels ).toHaveLength( 2 );

		// Check the labels match
		expect( settingControlLabelsText ).toEqual(
			expect.arrayContaining( customSettingsLabelsText )
		);

		// Assert the default "checked" states match the expected
		expect( settingControlsInputs[ 0 ].checked ).toEqual( false );
		expect( settingControlsInputs[ 1 ].checked ).toEqual( true );
	} );
} );

describe( 'Post types', () => {
	it( 'should display post type in search results of link', async () => {
		const searchTerm = 'Hello world';

		act( () => {
			render( <LinkControl />, container );
		} );

		// Search Input UI
		const searchInput = getURLInput();

		// Simulate searching for a term
		act( () => {
			Simulate.change( searchInput, { target: { value: searchTerm } } );
		} );

		// fetchFauxEntitySuggestions resolves on next "tick" of event loop
		await eventLoopTick();

		const searchResultElements = getSearchResults();

		searchResultElements.forEach( ( resultItem, index ) => {
			expect(
				queryByText( resultItem, fauxEntitySuggestions[ index ].type )
			).toBeTruthy();
		} );
	} );

	it.each( [ 'page', 'post', 'tag', 'post_tag', 'category' ] )(
		'should NOT display post type in search results of %s',
		async ( postType ) => {
			const searchTerm = 'Hello world';

			act( () => {
				render(
					<LinkControl suggestionsQuery={ { type: postType } } />,
					container
				);
			} );

			// Search Input UI
			const searchInput = getURLInput();

			// Simulate searching for a term
			act( () => {
				Simulate.change( searchInput, {
					target: { value: searchTerm },
				} );
			} );

			// fetchFauxEntitySuggestions resolves on next "tick" of event loop
			await eventLoopTick();

			const searchResultElements = getSearchResults();

			searchResultElements.forEach( ( resultItem, index ) => {
				expect(
					queryByText(
						resultItem,
						fauxEntitySuggestions[ index ].type
					)
				).toBeFalsy();
			} );
		}
	);
} );
