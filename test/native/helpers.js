/**
 * External dependencies
 */
import { act, render, fireEvent } from '@testing-library/react-native';

/**
 * WordPress dependencies
 */
import {
	subscribeParentGetHtml,
	provideToNative_Html as provideToNativeHtml,
} from '@wordpress/react-native-bridge';
// Editor component is not exposed in the pacakge because is meant to be consumed
// internally, however we require it for rendering the editor in integration tests,
// for this reason it's imported with path access.
// eslint-disable-next-line no-restricted-syntax
import Editor from '@wordpress/edit-post/src/editor';

// Set up the mocks for getting the HTML output of the editor
let triggerHtmlSerialization;
let serializedHtml;
subscribeParentGetHtml.mockImplementation( ( callback ) => {
	if ( ! triggerHtmlSerialization ) {
		triggerHtmlSerialization = callback;
		return {
			remove: () => {
				triggerHtmlSerialization = undefined;
			},
		};
	}
} );
provideToNativeHtml.mockImplementation( ( html ) => {
	serializedHtml = html;
} );

export async function initializeEditor( { initialHtml } ) {
	const renderResult = render(
		<Editor
			postId={ 0 }
			postType="post"
			initialTitle="test"
			initialHtml={ initialHtml }
		/>
	);
	const { getByTestId } = renderResult;

	const blockListWrapper = await waitFor( () =>
		getByTestId( 'block-list-wrapper' )
	);

	// onLayout event has to be explicitly dispatched in BlockList component,
	// otherwise the inner blocks are not rendered.
	fireEvent( blockListWrapper, 'layout', {
		nativeEvent: {
			layout: {
				width: 100,
			},
		},
	} );

	return renderResult;
}

export * from '@testing-library/react-native';

// Custom implementation of the waitFor utility to prevent the issue: https://git.io/JYYGE
export function waitFor(
	cb,
	{ timeout, interval } = { timeout: 1000, interval: 50 }
) {
	let result;
	const check = ( resolve, reject, time = 0 ) => {
		try {
			result = cb();
		} catch ( e ) {
			//NOOP
		}
		if ( ! result && time < timeout ) {
			setTimeout(
				() => check( resolve, reject, time + interval ),
				interval
			);
			return;
		}
		resolve( result );
	};
	return new Promise( ( resolve, reject ) =>
		act(
			() => new Promise( ( internalResolve ) => check( internalResolve ) )
		).then( () => {
			if ( ! result ) {
				reject(
					`waitFor timed out after ${ timeout }ms for callback:\n${ cb }`
				);
				return;
			}
			resolve( result );
		} )
	);
}

// Helper for getting the current HTML output of the editor
export function getEditorHtml() {
	if ( ! triggerHtmlSerialization ) {
		throw new Error( 'HTML serialization trigger is not defined.' );
	}
	triggerHtmlSerialization();
	return serializedHtml;
}
