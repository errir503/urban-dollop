/**
 * External dependencies
 */
import type { Meta, Story } from '@storybook/react';
import type { ReactNode } from 'react';

/**
 * WordPress dependencies
 */
import {
	formatBold,
	formatItalic,
	link,
	more,
	wordpress,
} from '@wordpress/icons';

/**
 * Internal dependencies
 */
import './style.css';
import Button from '..';

const meta: Meta< typeof Button > = {
	title: 'Components/Button',
	component: Button,
	argTypes: {
		// Overrides a limitation of the docgen interpreting our TS types for this as required.
		href: { type: { name: 'string', required: false } },
		icon: {
			control: { type: 'select' },
			options: [ 'wordpress', 'link', 'more' ],
			mapping: {
				wordpress,
				link,
				more,
			},
		},
	},
	parameters: {
		controls: { expanded: true },
		docs: { source: { state: 'open' } },
	},
};
export default meta;

const Template: Story< typeof Button > = ( props ) => {
	return <Button { ...props }></Button>;
};

export const Default: Story< typeof Button > = Template.bind( {} );
Default.args = {
	children: 'Code is poetry',
};

export const Primary: Story< typeof Button > = Template.bind( {} );
Primary.args = {
	...Default.args,
	variant: 'primary',
};

export const Secondary: Story< typeof Button > = Template.bind( {} );
Secondary.args = {
	...Default.args,
	variant: 'secondary',
};

export const Tertiary: Story< typeof Button > = Template.bind( {} );
Tertiary.args = {
	...Default.args,
	variant: 'tertiary',
};

export const Link: Story< typeof Button > = Template.bind( {} );
Link.args = {
	...Default.args,
	variant: 'link',
};

export const IsDestructive: Story< typeof Button > = Template.bind( {} );
IsDestructive.args = {
	...Default.args,
	isDestructive: true,
};

export const Icon: Story< typeof Button > = Template.bind( {} );
Icon.args = {
	label: 'Code is poetry',
	icon: 'wordpress',
};

export const GroupedIcons: Story< typeof Button > = () => {
	const GroupContainer = ( { children }: { children: ReactNode } ) => (
		<div style={ { display: 'inline-flex' } }>{ children }</div>
	);

	return (
		<GroupContainer>
			<Button icon={ formatBold } label="Bold" />
			<Button icon={ formatItalic } label="Italic" />
			<Button icon={ link } label="Link" />
		</GroupContainer>
	);
};
