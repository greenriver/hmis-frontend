import { ComponentStory, ComponentMeta } from '@storybook/react';

import ClickToShow from './ClickToShow';

export default {
  title: 'ClickToShow',
  component: ClickToShow,
} as ComponentMeta<typeof ClickToShow>;

const Template: ComponentStory<typeof ClickToShow> = (args) => (
  <ClickToShow {...args}>hidden value </ClickToShow>
);

export const Default = Template.bind({});
Default.args = {};
