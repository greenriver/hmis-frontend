import { ComponentStory, ComponentMeta } from '@storybook/react';

import ProjectSelect from './ProjectSelect';

export default {
  title: 'ProjectSelect',
  component: ProjectSelect,
  parameters: {
    layout: 'fullscreen',
  },
} as ComponentMeta<typeof ProjectSelect>;

const Template: ComponentStory<typeof ProjectSelect> = (args) => (
  <ProjectSelect {...args} />
);

export const Default = Template.bind({});
Default.args = {};
