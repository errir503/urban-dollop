/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

export class PluginErrorBoundary extends Component {
	/**
	 * @param {Object} props
	 */
	constructor( props ) {
		super( props );
		this.state = {
			hasError: false,
		};
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	/**
	 * @param {Error} error Error object passed by React.
	 */
	componentDidCatch( error ) {
		const { name, onError } = this.props;
		if ( onError ) {
			onError( name, error );
		}
	}

	render() {
		if ( ! this.state.hasError ) {
			return this.props.children;
		}

		return null;
	}
}
