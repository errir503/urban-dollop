/**
 * WordPress dependencies
 */
import { SVG, Path } from '@wordpress/primitives';

const sidesBottom = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M7 20.5h10V19H7v1.5z" style={ { fill: '#1e1e1e' } } />
		<Path
			d="M3.5 17H5V7H3.5v10zM19 7v10h1.5V7H19zM7 5h10V3.5H7V5z"
			style={ { fill: '#1e1e1e', opacity: 0.1 } }
		/>
	</SVG>
);

export default sidesBottom;
