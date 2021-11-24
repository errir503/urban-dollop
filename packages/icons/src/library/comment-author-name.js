/**
 * WordPress dependencies
 */
import { SVG, Path, Circle } from '@wordpress/primitives';

const commentAuthorName = (
	<SVG viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
		<Path
			d="M18 4H6c-1.1 0-2 .9-2 2v12.9c0 .6.5 1.1 1.1 1.1.3 0 .5-.1.8-.3L8.5 17H18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm.5 11c0 .3-.2.5-.5.5H7.9l-2.4 2.4V6c0-.3.2-.5.5-.5h12c.3 0 .5.2.5.5v9z"
			fillRule="evenodd"
			clipRule="evenodd"
		/>
		<Path
			d="M15 15V15C15 13.8954 14.1046 13 13 13L11 13C9.89543 13 9 13.8954 9 15V15"
			fillRule="evenodd"
			clipRule="evenodd"
		/>
		<Circle cx="12" cy="9" r="2" fillRule="evenodd" clipRule="evenodd" />
	</SVG>
);

export default commentAuthorName;
