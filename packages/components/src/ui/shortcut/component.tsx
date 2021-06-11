/**
 * External dependencies
 */
// eslint-disable-next-line no-restricted-imports
import type { Ref } from 'react';

/**
 * Internal dependencies
 */
import { useContextSystem, contextConnect } from '../context';
// eslint-disable-next-line no-duplicate-imports
import type { ViewOwnProps } from '../context';

export interface ShortcutDescription {
	display: string;
	ariaLabel: string;
}

export interface Props {
	shortcut?: ShortcutDescription | string;
	className?: string;
}

function Shortcut(
	props: ViewOwnProps< Props, 'span' >,
	forwardedRef: Ref< any >
): JSX.Element | null {
	const { shortcut, className, ...otherProps } = useContextSystem(
		props,
		'Shortcut'
	);
	if ( ! shortcut ) {
		return null;
	}

	let displayText: string;
	let ariaLabel: string | undefined;

	if ( typeof shortcut === 'string' ) {
		displayText = shortcut;
	} else {
		displayText = shortcut.display;
		ariaLabel = shortcut.ariaLabel;
	}

	return (
		<span
			className={ className }
			aria-label={ ariaLabel }
			ref={ forwardedRef }
			{ ...otherProps }
		>
			{ displayText }
		</span>
	);
}

const ConnectedShortcut = contextConnect( Shortcut, 'Shortcut' );

export default ConnectedShortcut;
