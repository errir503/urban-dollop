/**
 * External dependencies
 */
import type { Meta, StoryFn } from '@storybook/react';

/**
 * Internal dependencies
 */
import Dropdown from '..';
import Button from '../../button';
import { DropdownContentWrapper } from '../dropdown-content-wrapper';

const meta: Meta< typeof Dropdown > = {
	title: 'Components/Dropdown',
	component: Dropdown,
	// @ts-expect-error - See https://github.com/storybookjs/storybook/issues/23170
	subcomponents: { DropdownContentWrapper },
	argTypes: {
		focusOnMount: {
			options: [ 'firstElement', true, false ],
			control: {
				type: 'radio',
			},
		},
		position: { control: { type: null } },
		renderContent: { control: { type: null } },
		renderToggle: { control: { type: null } },
	},
	parameters: {
		controls: {
			expanded: true,
		},
	},
};
export default meta;

const Template: StoryFn< typeof Dropdown > = ( args ) => {
	return (
		<div style={ { height: 150 } }>
			<Dropdown { ...args } />
		</div>
	);
};

export const Default = Template.bind( {} );
Default.args = {
	renderToggle: ( { isOpen, onToggle } ) => (
		<Button onClick={ onToggle } aria-expanded={ isOpen } variant="primary">
			Open dropdown
		</Button>
	),
	renderContent: () => <div>This is the dropdown content.</div>,
};

/**
 * To apply more padding to the dropdown content, use the provided `<DropdownContentWrapper>`
 * convenience wrapper. A `paddingSize` of `"medium"` is suitable for relatively larger dropdowns (default is `"small"`).
 */
export const WithMorePadding = Template.bind( {} );
WithMorePadding.args = {
	...Default.args,
	renderContent: () => (
		<DropdownContentWrapper paddingSize="medium">
			Content wrapped with <code>{ `paddingSize="medium"` }</code>.
		</DropdownContentWrapper>
	),
};

/**
 * The `<DropdownContentWrapper>` convenience wrapper can also be used to remove padding entirely,
 * with a `paddingSize` of `"none"`. This can also serve as a clean foundation to add arbitrary
 * paddings, for example when child components already have padding on their own.
 */
export const WithNoPadding = Template.bind( {} );
WithNoPadding.args = {
	...Default.args,
	renderContent: () => (
		<DropdownContentWrapper paddingSize="none">
			Content wrapped with <code>{ `paddingSize="none"` }</code>.
		</DropdownContentWrapper>
	),
};
